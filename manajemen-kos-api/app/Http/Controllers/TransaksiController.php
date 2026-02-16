<?php

namespace App\Http\Controllers;

use App\Models\Transaksi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Requests\StoreTransaksiRequest;
use App\Http\Requests\UpdateTransaksiRequest;
use Illuminate\Support\Facades\DB;
use App\Models\Penghuni;
use App\Models\Kamar;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class TransaksiController extends Controller
{
    /**
     * GET /api/transaksis
     * Mengambil semua transaksi dengan filter opsional
     */
    public function index(Request $request)
    {
        // Tentukan jumlah item per halaman, default 10
        $perPage = $request->get('per_page', 10);

        $query = Transaksi::query();

        // Search functionality - Enhanced
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('deskripsi', 'like', "%{$search}%")
                    ->orWhere('kategori', 'like', "%{$search}%")
                    ->orWhere('metode_pembayaran', 'like', "%{$search}%")
                    ->orWhere('jumlah', 'like', "%{$search}%")
                    // Search by snapshot names
                    ->orWhere('penghuni_name', 'like', "%{$search}%")
                    ->orWhere('kamar_name', 'like', "%{$search}%")
                    // Search by relation (legacy/fallback)
                    ->orWhereHas('penghuni', function ($query) use ($search) {
                        $query->where('nama_lengkap', 'like', "%{$search}%");
                    })
                    ->orWhereHas('kamar', function ($query) use ($search) {
                        $query->where('nama_kamar', 'like', "%{$search}%");
                    });
            });
        }

        // Filter berdasarkan range tanggal
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('tanggal_transaksi', [$request->start_date, $request->end_date]);
        }

        // Filter berdasarkan tipe_transaksi
        if ($request->filled('tipe_transaksi') && in_array($request->tipe_transaksi, ['Pemasukan', 'Pengeluaran'])) {
            $query->where('tipe_transaksi', $request->tipe_transaksi);
        }

        // Filter by penghuni
        if ($request->filled('penghuni_id')) {
            $query->where('penghuni_id', $request->penghuni_id);
        }

        // Load relasi penghuni dan kamar
        $transaksis = $query->with([
            'penghuni:id,nama_lengkap',
            'kamar:id,nama_kamar'
        ])
            ->orderBy('tanggal_transaksi', 'desc')
            ->paginate($perPage);

        return response()->json($transaksis, 200);
    }

    /**
     * POST /api/transaksis
     * Membuat transaksi baru (Pemasukan/Pengeluaran)
     */
    public function store(StoreTransaksiRequest $request)
    {
        // Validasi otomatis oleh StoreTransaksiRequest

        $data = $request->all();

        // Simpan snapshot nama penghuni dan kamar
        if ($request->penghuni_id) {
            $penghuni = Penghuni::find($request->penghuni_id);
            $data['penghuni_name'] = $penghuni ? $penghuni->nama_lengkap : null;
        }

        if ($request->kamar_id) {
            $kamar = Kamar::find($request->kamar_id);
            $data['kamar_name'] = $kamar ? $kamar->nama_kamar : null;
        }

        // Simpan transaksi
        $transaksi = Transaksi::create($data);

        Log::info('Transaksi berhasil dibuat:', ['id' => $transaksi->id, 'tipe' => $transaksi->tipe_transaksi]);

        return response()->json([
            'message' => 'Transaksi berhasil dicatat.',
            'data' => $transaksi
        ], 201);
    }

    /**
     * GET /api/transaksis/{id}
     * Menampilkan detail satu transaksi
     */
    public function show(Transaksi $transaksi)
    {
        return response()->json([
            'data' => $transaksi->load('penghuni:id,nama_lengkap', 'kamar:id,nama_kamar')
        ], 200);
    }

    /**
     * PUT/PATCH /api/transaksis/{id}
     * Update transaksi
     */
    public function update(UpdateTransaksiRequest $request, Transaksi $transaksi)
    {
        // Validasi otomatis oleh UpdateTransaksiRequest

        $data = $request->all();

        // Update snapshot nama penghuni dan kamar jika ada perubahan
        if ($request->has('penghuni_id')) {
            if ($request->penghuni_id) {
                $penghuni = Penghuni::find($request->penghuni_id);
                $data['penghuni_name'] = $penghuni ? $penghuni->nama_lengkap : null;
            } else {
                $data['penghuni_name'] = null;
            }
        }

        if ($request->has('kamar_id')) {
            if ($request->kamar_id) {
                $kamar = Kamar::find($request->kamar_id);
                $data['kamar_name'] = $kamar ? $kamar->nama_kamar : null;
            } else {
                $data['kamar_name'] = null;
            }
        }

        $transaksi->update($data);

        Log::info('Transaksi berhasil diupdate:', ['id' => $transaksi->id]);

        return response()->json([
            'message' => 'Transaksi berhasil diperbarui.',
            'data' => $transaksi
        ], 200);
    }

    /**
     * DELETE /api/transaksis/{id}
     * Hapus transaksi
     */
    public function destroy(Transaksi $transaksi)
    {
        $transaksiId = $transaksi->id;
        $transaksi->delete();

        Log::info('Transaksi dihapus:', ['id' => $transaksiId]);

        return response()->json(['message' => 'Transaksi berhasil dihapus.'], 200);
    }

    /**
     * GET /api/transaksis/report/laba-rugi
     * Laporan ringkasan laba/rugi (agregasi saja)
     */
    public function reportLabaRugi(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Query dengan filter tanggal
        $query = Transaksi::query();

        if ($request->filled('start_date')) {
            $query->whereDate('tanggal_transaksi', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('tanggal_transaksi', '<=', $request->end_date);
        }

        // Hitung total per tipe transaksi
        $results = $query
            ->select('tipe_transaksi', DB::raw('SUM(jumlah) as total'))
            ->groupBy('tipe_transaksi')
            ->get()
            ->keyBy('tipe_transaksi');

        $pemasukan = $results->get('Pemasukan')->total ?? 0;
        $pengeluaran = $results->get('Pengeluaran')->total ?? 0;
        $laba_rugi = $pemasukan - $pengeluaran;

        Log::info('Laporan Laba/Rugi:', [
            'pemasukan' => $pemasukan,
            'pengeluaran' => $pengeluaran,
            'laba_rugi' => $laba_rugi
        ]);

        return response()->json([
            'message' => 'Laporan Laba/Rugi berhasil dibuat.',
            'pemasukan' => (float) $pemasukan,
            'pengeluaran' => (float) $pengeluaran,
            'laba_rugi' => (float) $laba_rugi,
        ], 200);
    }

    /**
     * GET /api/transaksis/export/summary
     * Export lengkap: Ringkasan + Detail Pemasukan + Detail Pengeluaran
     */
    public function transactionSummaryExport(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $start = $request->start_date;
        $end = $request->end_date;

        // 1. HITUNG RINGKASAN
        $summaryResults = Transaksi::whereBetween('tanggal_transaksi', [$start, $end])
            ->select('tipe_transaksi', DB::raw('SUM(jumlah) as total'))
            ->groupBy('tipe_transaksi')
            ->get()
            ->keyBy('tipe_transaksi');

        $totalIncome = $summaryResults->get('Pemasukan')->total ?? 0;
        $totalExpense = $summaryResults->get('Pengeluaran')->total ?? 0;
        $netProfit = $totalIncome - $totalExpense;

        // 2. AMBIL DETAIL PEMASUKAN (dengan relasi penghuni & kamar)
        $incomeDetails = Transaksi::where('tipe_transaksi', 'Pemasukan')
            ->whereBetween('tanggal_transaksi', [$start, $end])
            ->with(['penghuni:id,nama_lengkap', 'kamar:id,nama_kamar'])
            ->orderBy('tanggal_transaksi', 'asc')
            ->get();

        // 3. AMBIL DETAIL PENGELUARAN (tanpa relasi)
        $expenseDetails = Transaksi::where('tipe_transaksi', 'Pengeluaran')
            ->whereBetween('tanggal_transaksi', [$start, $end])
            ->orderBy('tanggal_transaksi', 'asc')
            ->get();

        Log::info('Export Summary:', [
            'periode' => "$start s/d $end",
            'income_count' => $incomeDetails->count(),
            'expense_count' => $expenseDetails->count(),
            'net_profit' => $netProfit
        ]);

        return response()->json([
            'summary' => [
                'total_income' => (float) $totalIncome,
                'total_expense' => (float) $totalExpense,
                'net_profit' => (float) $netProfit,
            ],
            'income' => $incomeDetails,
            'expense' => $expenseDetails,
        ], 200);
    }

    /**
     * GET /api/transaksis/report/due-soon
     * Laporan penghuni yang masa sewanya akan berakhir dalam 7 hari
     */
    public function dueSoonReport()
    {
        $today = Carbon::today();
        $sevenDaysLater = $today->copy()->addDays(7);
        $thirtyDaysAgo = $today->copy()->subDays(30);

        // Cache hasil report selama 60 menit
        $penghunisJatuhTempo = Cache::remember('report_due_soon', 60 * 60, function () use ($thirtyDaysAgo, $sevenDaysLater) {
            return Penghuni::with('kamar:id,nama_kamar')
                ->where('status_sewa', 'Aktif')
                ->whereBetween('masa_berakhir_sewa', [$thirtyDaysAgo, $sevenDaysLater])
                ->orderBy('masa_berakhir_sewa', 'asc')
                ->get();
        });

        Log::info('Due Soon Report (Cached):', [
            'count' => $penghunisJatuhTempo->count(),
            'range' => "$thirtyDaysAgo s/d $sevenDaysLater"
        ]);

        return response()->json([
            'count' => $penghunisJatuhTempo->count(),
            'data' => $penghunisJatuhTempo,
            'meta' => [
                'today' => $today->toDateString(),
                'range_start' => $thirtyDaysAgo->toDateString(),
                'range_end' => $sevenDaysLater->toDateString()
            ]
        ], 200);
    }
}
