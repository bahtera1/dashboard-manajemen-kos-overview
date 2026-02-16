<?php

namespace App\Http\Controllers;

use App\Models\Kamar;
use App\Models\Penghuni;
use App\Models\Transaksi;
use App\Models\Tagihan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use App\Helpers\DateHelper;

class ReportController extends Controller
{
    /**
     * GET /api/reports/room-occupancy
     * Laporan okupansi kamar per periode
     */
    public function getRoomOccupancyReport(Request $request)
    {
        $dateRange = DateHelper::getDateRangeFromRequest($request);
        extract($dateRange); // $start_date, $end_date, $start, $end

        // Hitung jumlah hari dalam periode
        $totalDays = $start->diffInDays($end) + 1;

        // Ambil semua kamar dengan penghuni
        $kamars = Kamar::withTrashed()
            ->with([
                'penghunis' => function ($query) use ($start_date, $end_date) {
                    /** @var \Illuminate\Database\Eloquent\Builder $query */
                    $query->where(function ($q) use ($start_date, $end_date) {
                        /** @var \Illuminate\Database\Eloquent\Builder $q */
                        $q->where('tanggal_masuk', '<=', $end_date)
                            ->where(function ($q2) use ($start_date) {
                                /** @var \Illuminate\Database\Eloquent\Builder $q2 */
                                $q2->whereNull('tanggal_keluar')
                                    ->orWhere('tanggal_keluar', '>=', $start_date);
                            });
                    });
                }
            ])
            ->orderBy('nama_kamar')
            ->get();

        $occupancyData = [];
        foreach ($kamars as $kamar) {
            $daysOccupied = 0;

            foreach ($kamar->penghunis as $penghuni) {
                $moveIn = Carbon::parse($penghuni->tanggal_masuk);
                $moveOut = $penghuni->tanggal_keluar ? Carbon::parse($penghuni->tanggal_keluar) : $end;

                // Batasi ke periode yang diminta
                $effectiveStart = $moveIn->max($start);
                $effectiveEnd = $moveOut->min($end);

                if ($effectiveStart <= $effectiveEnd) {
                    $daysOccupied += $effectiveStart->diffInDays($effectiveEnd) + 1;
                }
            }

            $actualPercentage = $totalDays > 0 ? round(($daysOccupied / $totalDays) * 100) : 0;

            $occupancyData[] = [
                'kamar_id' => $kamar->id,
                'nama_kamar' => $kamar->nama_kamar,
                'blok' => $kamar->blok,
                'lantai' => $kamar->lantai,
                'total_days' => $totalDays,
                'days_occupied' => $daysOccupied,
                'actual_percentage' => $actualPercentage,
                'plan_percentage' => 90, // Default target 90%
            ];
        }

        return response()->json([
            'message' => 'Laporan okupansi berhasil diambil',
            'period' => [
                'start_date' => $start_date,
                'end_date' => $end_date,
                'total_days' => $totalDays,
            ],
            'data' => $occupancyData,
            'summary' => [
                'total_rooms' => count($occupancyData),
                'average_occupancy' => count($occupancyData) > 0
                    ? round(collect($occupancyData)->avg('actual_percentage'))
                    : 0,
            ],
        ], 200);
    }

    /**
     * GET /api/reports/tenant-details
     * Laporan detail penghuni dengan tanggal masuk/keluar
     */
    public function getTenantDetailReport(Request $request)
    {
        $status = $request->input('status'); // 'Aktif', 'Nonaktif', atau null untuk semua

        $query = Penghuni::with('kamar:id,nama_kamar');

        if ($status) {
            $query->where('status_sewa', $status);
        }

        $penghunis = $query->orderBy('created_at', 'desc')->get();

        $tenantData = $penghunis->map(function ($penghuni) {
            $tanggalMasuk = $penghuni->tanggal_masuk ? Carbon::parse($penghuni->tanggal_masuk) : null;
            $tanggalKeluar = $penghuni->tanggal_keluar ? Carbon::parse($penghuni->tanggal_keluar) : null;

            // Hitung jumlah hari
            $jumlahHari = 0;
            if ($tanggalMasuk) {
                if ($tanggalKeluar) {
                    $jumlahHari = $tanggalMasuk->diffInDays($tanggalKeluar);
                } else {
                    $jumlahHari = $tanggalMasuk->diffInDays(Carbon::now());
                }
            }

            return [
                'id' => $penghuni->id,
                'nama_lengkap' => $penghuni->nama_lengkap,
                'tanggal_masuk' => $penghuni->tanggal_masuk,
                'tanggal_keluar' => $penghuni->tanggal_keluar,
                'masa_berakhir_sewa' => $penghuni->masa_berakhir_sewa,
                'status_sewa' => $penghuni->status_sewa,
                'kamar_nama' => $penghuni->kamar ? $penghuni->kamar->nama_kamar : '-',
                'jumlah_hari' => $jumlahHari,
                'no_hp' => $penghuni->no_hp,
                'email' => $penghuni->email,
            ];
        });

        return response()->json([
            'message' => 'Laporan detail penghuni berhasil diambil',
            'data' => $tenantData,
            'summary' => [
                'total_tenants' => $tenantData->count(),
                'active_tenants' => $penghunis->where('status_sewa', 'Aktif')->count(),
                'inactive_tenants' => $penghunis->where('status_sewa', 'Nonaktif')->count(),
            ],
        ], 200);
    }

    /**
     * GET /api/reports/financial-summary
     * Ringkasan keuangan untuk dashboard
     */
    public function getFinancialSummary(Request $request)
    {
        $dateRange = DateHelper::getDateRangeFromRequest($request);
        extract($dateRange); // $start_date, $end_date, $start, $end

        // Total Pemasukan dan Pengeluaran
        $pemasukan = Transaksi::where('tipe_transaksi', 'Pemasukan')
            ->whereBetween('tanggal_transaksi', [$start_date, $end_date])
            ->sum('jumlah');

        $pengeluaran = Transaksi::where('tipe_transaksi', 'Pengeluaran')
            ->whereBetween('tanggal_transaksi', [$start_date, $end_date])
            ->sum('jumlah');

        $labaRugi = $pemasukan - $pengeluaran;

        // Breakdown per kategori Pemasukan
        $pemasukanPerKategori = Transaksi::select('kategori', DB::raw('SUM(jumlah) as total'))
            ->where('tipe_transaksi', 'Pemasukan')
            ->whereBetween('tanggal_transaksi', [$start_date, $end_date])
            ->groupBy('kategori')
            ->get();

        // Breakdown per kategori Pengeluaran
        $pengeluaranPerKategori = Transaksi::select('kategori', DB::raw('SUM(jumlah) as total'))
            ->where('tipe_transaksi', 'Pengeluaran')
            ->whereBetween('tanggal_transaksi', [$start_date, $end_date])
            ->groupBy('kategori')
            ->get();

        // OPTIMIZED: Data per bulan untuk grafik trend (Dinamis sesuai limit, default 6 bulan)
        $limit = $request->input('trend_limit', 6);
        $limit = max(1, min(12, intval($limit))); // Validasi limit (min 1, max 12 bulan)

        $startDateTrend = Carbon::now()->subMonths($limit - 1)->startOfMonth();

        $monthlyRaw = Transaksi::select(
            DB::raw("DATE_FORMAT(tanggal_transaksi, '%Y-%m') as month_key"),
            'tipe_transaksi',
            DB::raw('SUM(jumlah) as total')
        )
            ->where('tanggal_transaksi', '>=', $startDateTrend)
            ->groupBy('month_key', 'tipe_transaksi')
            ->get()
            ->groupBy('month_key');

        // Format monthly data
        $monthlyData = [];
        for ($i = $limit - 1; $i >= 0; $i--) {
            $monthStart = Carbon::now()->subMonths($i)->startOfMonth();
            $monthKey = $monthStart->format('Y-m');

            $monthPemasukan = $monthlyRaw->get($monthKey, collect())
                ->where('tipe_transaksi', 'Pemasukan')
                ->sum('total');

            $monthPengeluaran = $monthlyRaw->get($monthKey, collect())
                ->where('tipe_transaksi', 'Pengeluaran')
                ->sum('total');

            $monthlyData[] = [
                'month' => $monthStart->format('M Y'),
                'pemasukan' => (float) $monthPemasukan,
                'pengeluaran' => (float) $monthPengeluaran,
                'laba_rugi' => (float) ($monthPemasukan - $monthPengeluaran),
            ];
        }

        return response()->json([
            'message' => 'Ringkasan keuangan berhasil diambil',
            'period' => [
                'start_date' => $start_date,
                'end_date' => $end_date,
            ],
            'summary' => [
                'total_pemasukan' => (float) $pemasukan,
                'total_pengeluaran' => (float) $pengeluaran,
                'laba_rugi' => (float) $labaRugi,
            ],
            'pemasukan_per_kategori' => $pemasukanPerKategori,
            'pengeluaran_per_kategori' => $pengeluaranPerKategori,
            'monthly_trend' => $monthlyData,
        ], 200);
    }

    /**
     * GET /api/reports/occupancy-trend
     * Trend okupansi untuk grafik (harian dalam periode)
     */
    public function getOccupancyTrend(Request $request)
    {
        $dateRange = DateHelper::getDateRangeFromRequest($request);
        extract($dateRange); // $start_date, $end_date, $start, $end

        $totalKamar = Kamar::count();
        $trendData = [];

        // Generate data per hari
        $currentDate = $start->copy();
        while ($currentDate <= $end) {
            $dateStr = $currentDate->toDateString();

            // Hitung kamar terisi pada tanggal ini
            $kamarTerisi = Penghuni::where('tanggal_masuk', '<=', $dateStr)
                ->where(function ($q) use ($dateStr) {
                    $q->whereNull('tanggal_keluar')
                        ->orWhere('tanggal_keluar', '>=', $dateStr);
                })
                ->where('status_sewa', 'Aktif')
                ->distinct('kamar_id')
                ->count('kamar_id');

            $occupancyRate = $totalKamar > 0 ? round(($kamarTerisi / $totalKamar) * 100) : 0;

            $trendData[] = [
                'date' => $dateStr,
                'date_formatted' => $currentDate->format('d M'),
                'occupied_rooms' => $kamarTerisi,
                'total_rooms' => $totalKamar,
                'occupancy_rate' => $occupancyRate,
                'plan_rate' => 90, // Target 90%
            ];

            $currentDate->addDay();
        }

        return response()->json([
            'message' => 'Trend okupansi berhasil diambil',
            'period' => [
                'start_date' => $start_date,
                'end_date' => $end_date,
            ],
            'data' => $trendData,
        ], 200);
    }

    /**
     * GET /api/reports/dashboard-stats
     * Statistik untuk dashboard cards
     */
    public function getDashboardStats()
    {
        $totalKamar = Kamar::count();

        $kamarTerisi = Penghuni::where('status_sewa', 'Aktif')
            ->distinct('kamar_id')
            ->count('kamar_id');

        $kamarKosong = $totalKamar - $kamarTerisi;

        $penghuniAktif = Penghuni::where('status_sewa', 'Aktif')->count();

        // Penghuni yang akan berakhir dalam 7 hari
        $dueSoon = Penghuni::where('status_sewa', 'Aktif')
            ->whereNotNull('masa_berakhir_sewa')
            ->whereBetween('masa_berakhir_sewa', [
                Carbon::now()->toDateString(),
                Carbon::now()->addDays(7)->toDateString()
            ])
            ->count();

        // Pemasukan bulan ini
        $pemasukanBulanIni = Transaksi::where('tipe_transaksi', 'Pemasukan')
            ->whereBetween('tanggal_transaksi', [
                Carbon::now()->startOfMonth(),
                Carbon::now()->endOfMonth()
            ])
            ->sum('jumlah');

        // Pengeluaran bulan ini
        $pengeluaranBulanIni = Transaksi::where('tipe_transaksi', 'Pengeluaran')
            ->whereBetween('tanggal_transaksi', [
                Carbon::now()->startOfMonth(),
                Carbon::now()->endOfMonth()
            ])
            ->sum('jumlah');

        return response()->json([
            'message' => 'Statistik dashboard berhasil diambil',
            'data' => [
                'total_kamar' => $totalKamar,
                'kamar_terisi' => $kamarTerisi,
                'kamar_kosong' => $kamarKosong,
                'occupancy_rate' => $totalKamar > 0 ? round(($kamarTerisi / $totalKamar) * 100) : 0,
                'penghuni_aktif' => $penghuniAktif,
                'due_soon' => $dueSoon,
                'pemasukan_bulan_ini' => (float) $pemasukanBulanIni,
                'pengeluaran_bulan_ini' => (float) $pengeluaranBulanIni,
                'laba_rugi_bulan_ini' => (float) ($pemasukanBulanIni - $pengeluaranBulanIni),
            ],
        ], 200);
    }
}
