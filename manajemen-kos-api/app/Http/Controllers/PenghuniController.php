<?php

namespace App\Http\Controllers;

use App\Models\Penghuni;
use App\Models\Kamar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Requests\StorePenghuniRequest;
use App\Http\Requests\UpdatePenghuniRequest;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class PenghuniController extends Controller
{
    /**
     * GET /api/penghunis
     * Mengambil semua penghuni dengan relasi kamar
     */
    public function index(Request $request)
    {
        // 1. Inisialisasi query
        $query = Penghuni::query();

        // 2. Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                    ->orWhere('no_ktp', 'like', "%{$search}%")
                    ->orWhere('no_hp', 'like', "%{$search}%");
            });
        }

        // 3. Filter by status
        if ($request->filled('status_sewa')) {
            $query->where('status_sewa', $request->status_sewa);
        }

        // 4. Filter by kamar
        if ($request->filled('kamar_id')) {
            $query->where('kamar_id', $request->kamar_id);
        }

        // 5. Tambahkan relasi dan urutan
        $query->with('kamar:id,nama_kamar,blok,lantai,is_available')
            ->orderBy('status_sewa', 'desc')
            ->orderBy('created_at', 'desc');

        // 6. Eksekusi query
        $penghunis = $query->get();

        Log::info('Penghuni list fetched', [
            'count' => $penghunis->count(),
            'search' => $request->search ?? null,
            'filtered_by' => $request->status_sewa ?? 'all'
        ]);

        return response()->json(['data' => $penghunis], 200);
    }

    /**
     * POST /api/penghunis
     * Membuat penghuni baru dan assign ke kamar
     */
    public function store(StorePenghuniRequest $request)
    {
        // Validasi sudah ditangani oleh StorePenghuniRequest
        // Jika gagal, otomatis return 422 JSON response

        // Cek ketersediaan kamar
        $kamar = Kamar::findOrFail($request->kamar_id);
        if (!$kamar->is_available) {
            Log::warning('Kamar tidak tersedia:', ['kamar_id' => $kamar->id]);
            return response()->json(['message' => 'Gagal. Kamar ini sudah terisi.'], 409);
        }

        // Hitung masa berakhir sewa
        $duration = $request->initial_duration ?? 1;
        $unit = $request->duration_unit;
        $startDate = Carbon::parse($request->tanggal_masuk);
        $endDate = $this->calculateEndDate($startDate, $duration, $unit);

        // Buat penghuni baru
        $penghuni = Penghuni::create($request->all() + [
            'status_sewa' => 'Aktif',
            'masa_berakhir_sewa' => $endDate,
            'durasi_bayar_terakhir' => $duration,
            'unit_bayar_terakhir' => $unit,
        ]);

        // Update status kamar
        $kamar->update(['is_available' => false]);

        Log::info('Penghuni created:', [
            'id' => $penghuni->id,
            'nama' => $penghuni->nama_lengkap,
            'kamar' => $kamar->nama_kamar,
            'masa_berakhir' => $endDate
        ]);

        return response()->json([
            'message' => 'Penghuni berhasil ditambahkan.',
            'data' => $penghuni->load('kamar')
        ], 201);
    }

    /**
     * GET /api/penghunis/{id}
     * Detail satu penghuni
     */
    public function show(Penghuni $penghuni)
    {
        return response()->json([
            'data' => $penghuni->load('kamar:id,nama_kamar,harga_bulanan,blok,lantai')
        ], 200);
    }

    /**
     * PUT/PATCH /api/penghunis/{id}
     * Update data penghuni (dengan logic pindah kamar & recalculate)
     */
    public function update(UpdatePenghuniRequest $request, Penghuni $penghuni)
    {
        $oldKamarId = $penghuni->kamar_id;
        $newKamarId = $request->kamar_id;
        $tanggalMasukBerubah = $penghuni->tanggal_masuk !== $request->tanggal_masuk;

        // Handle room change if kamar_id changed
        if ($oldKamarId != $newKamarId) {
            $this->handleRoomChange($penghuni, $oldKamarId, $newKamarId);
        }

        // Update penghuni data
        $penghuni->update($request->except([
            'status_sewa',
            'masa_berakhir_sewa',
            'durasi_bayar_terakhir',
            'unit_bayar_terakhir'
        ]));

        // Recalculate end date if tanggal_masuk changed
        if ($tanggalMasukBerubah && $penghuni->status_sewa === 'Aktif') {
            $this->recalculateMasaBerakhir($penghuni, $request->tanggal_masuk);
        }

        return response()->json([
            'message' => 'Data penghuni berhasil diperbarui.',
            'data' => $penghuni->fresh(['kamar'])
        ], 200);
    }

    /**
     * Handle room change logic
     */
    private function handleRoomChange(Penghuni $penghuni, $oldKamarId, $newKamarId)
    {
        $newKamar = Kamar::findOrFail($newKamarId);

        // Check if new room is available
        if ($newKamar->penghuni()->where('status_sewa', 'Aktif')->exists()) {
            Log::warning('Room change failed - already occupied:', ['new_kamar' => $newKamarId]);
            abort(409, 'Kamar tujuan sudah terisi oleh penghuni aktif lain.');
        }

        // Free up old room
        if ($oldKamarId) {
            Kamar::where('id', $oldKamarId)->update(['is_available' => true]);
        }

        // Mark new room as occupied
        $newKamar->update(['is_available' => false]);

        Log::info('Room changed:', [
            'penghuni_id' => $penghuni->id,
            'old_kamar' => $oldKamarId,
            'new_kamar' => $newKamarId
        ]);
    }

    /**
     * Recalculate masa berakhir sewa based on new tanggal masuk
     */
    private function recalculateMasaBerakhir(Penghuni $penghuni, $newTanggalMasuk)
    {
        $duration = $penghuni->durasi_bayar_terakhir ?? 1;
        $unit = $penghuni->unit_bayar_terakhir ?? 'month';
        $newStartDate = Carbon::parse($newTanggalMasuk);
        $newEndDate = $this->calculateEndDate($newStartDate, $duration, $unit);

        $penghuni->update(['masa_berakhir_sewa' => $newEndDate]);

        Log::info('Recalculated masa berakhir:', [
            'penghuni_id' => $penghuni->id,
            'new_end_date' => $newEndDate
        ]);
    }

    /**
     * POST /api/penghunis/{id}/payment
     * Mencatat pembayaran dan extend masa sewa
     */
    public function recordPayment(Request $request, $penghuniId)
    {
        $validator = Validator::make($request->all(), [
            'duration' => 'required|integer|min:1',
            'unit' => 'required|in:day,week,month,year',
            'metode_pembayaran' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            Log::error('Validasi gagal - Payment:', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $penghuni = Penghuni::findOrFail($penghuniId);

        if ($penghuni->status_sewa !== 'Aktif') {
            Log::warning('Payment gagal - status tidak aktif:', ['penghuni_id' => $penghuniId]);
            return response()->json([
                'message' => 'Tidak dapat mencatat pembayaran untuk penghuni yang tidak aktif.'
            ], 400);
        }

        $duration = $request->duration;
        $unit = $request->unit;

        // Extend dari masa berakhir sewa yang ada
        $currentEnd = $penghuni->masa_berakhir_sewa
            ? Carbon::parse($penghuni->masa_berakhir_sewa)
            : Carbon::parse($penghuni->tanggal_masuk);

        $newEndDate = $this->calculateEndDate($currentEnd, $duration, $unit);

        // Update masa berakhir dan info pembayaran terakhir
        $penghuni->update([
            'durasi_bayar_terakhir' => $duration,
            'unit_bayar_terakhir' => $unit,
            'masa_berakhir_sewa' => $newEndDate,
        ]);

        Log::info('Payment recorded:', [
            'penghuni_id' => $penghuni->id,
            'duration' => $duration,
            'unit' => $unit,
            'new_end_date' => $newEndDate
        ]);

        return response()->json([
            'message' => 'Pembayaran berhasil dicatat.',
            'data' => $penghuni->fresh(['kamar'])
        ], 200);
    }

    /**
     * POST /api/penghunis/{id}/checkout
     * Menonaktifkan penghuni dan bebaskan kamar
     */
    public function checkout(Request $request, Penghuni $penghuni)
    {
        if ($penghuni->status_sewa === 'Nonaktif') {
            return response()->json(['message' => 'Penghuni ini sudah nonaktif.'], 400);
        }

        // Cek apakah penghuni saat ini benar-benar menempati kamar sebelum checkout
        if (!$penghuni->kamar_id) {
            return response()->json(['message' => 'Penghuni ini tidak terikat pada kamar manapun.'], 400);
        }

        $validator = Validator::make($request->all(), [
            'tanggal_keluar' => 'required|date|after_or_equal:' . $penghuni->tanggal_masuk,
        ]);

        if ($validator->fails()) {
            Log::error('Validasi gagal - Checkout:', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $kamarIdToFree = $penghuni->kamar_id;

        // 💡 PERBAIKAN: Update status penghuni DAN LEPAS IKATAN KAMAR (kamar_id = NULL)
        $penghuni->update([
            'status_sewa' => 'Nonaktif',
            'tanggal_keluar' => $request->tanggal_keluar ?? Carbon::today(),
            'kamar_id' => null, // <--- KRITIS: Lepas ikatan kamar
        ]);

        // Bebaskan kamar di tabel kamars
        Kamar::where('id', $kamarIdToFree)->update(['is_available' => true]);

        Log::info('Penghuni checkout:', [
            'penghuni_id' => $penghuni->id,
            'kamar_yang_dilepas' => $kamarIdToFree,
            'tanggal_keluar' => $penghuni->tanggal_keluar
        ]);

        return response()->json(['message' => 'Penghuni berhasil di-checkout.'], 200);
    }

    /**
     * POST /api/penghunis/{id}/reassign
     * Mengaktifkan kembali penghuni nonaktif ke kamar baru/lama
     */
    public function reassign(Request $request, Penghuni $penghuni)
    {
        // 1. Manual Validation untuk memastikan bukan masalah Validator class
        if (!$request->new_kamar_id)
            return response()->json(['message' => 'Kamar ID harus diisi'], 422);

        // 2. Cek Kamar
        $newKamar = Kamar::find($request->new_kamar_id);
        if (!$newKamar)
            return response()->json(['message' => 'Kamar tidak ditemukan'], 404);

        // Debug Availability (Handle string "0" case)
        $isAvailable = $newKamar->is_available || $newKamar->is_available === '1' || $newKamar->is_available === 1;
        if (!$isAvailable) {
            return response()->json(['message' => 'Kamar tujuan penuh/tidak tersedia'], 409);
        }

        // 3. LOGIKA DATE MANUAL (Tanpa dependency helper lain)
        try {
            $duration = (int) $request->initial_duration;
            $unit = $request->duration_unit;
            $tglMasuk = $request->tanggal_masuk_baru;

            // Manual calculation pengganti calculateEndDate
            $carbonDate = Carbon::parse($tglMasuk);
            if ($unit == 'day')
                $carbonDate->addDays($duration);
            elseif ($unit == 'week')
                $carbonDate->addWeeks($duration);
            elseif ($unit == 'year')
                $carbonDate->addYears($duration);
            else
                $carbonDate->addMonths($duration); // Default month

            $newEndDate = $carbonDate->toDateString();

            // 4. Update Penghuni
            // Kita gunakan DB Transaction biar aman
            \DB::beginTransaction();

            $penghuni->kamar_id = $request->new_kamar_id;
            $penghuni->tanggal_masuk = $tglMasuk;
            $penghuni->tanggal_keluar = null;
            $penghuni->status_sewa = 'Aktif';
            $penghuni->masa_berakhir_sewa = $newEndDate;
            $penghuni->durasi_bayar_terakhir = $duration;
            $penghuni->unit_bayar_terakhir = $unit;
            $penghuni->save();

            // 5. Update Kamar
            $newKamar->is_available = false; // Paksa boolean false
            $newKamar->save();

            \DB::commit();

            return response()->json([
                'message' => "Berhasil memindahkan penghuni ke kamar {$newKamar->nama_kamar}.",
                'data' => $penghuni
            ], 200);

        } catch (\Exception $e) {
            \DB::rollBack();
            return response()->json([
                'message' => 'Gagal Reassign (Logika)',
                'error_detail' => $e->getMessage(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    /**
     * GET /api/penghunis/{id}/detail-tagihans
     * Mengambil detail penghuni beserta daftar tagihan
     */
    public function getDetailAndTagihans($id)
    {
        $penghuni = Penghuni::with([
            'kamar:id,nama_kamar,harga_bulanan',
            'tagihans' => function ($query) {
                $query->orderBy('jatuh_tempo', 'desc');
            }
        ])->findOrFail($id);

        return response()->json(['data' => $penghuni], 200);
    }

    /**
     * DELETE /api/penghunis/{id}
     * Menghapus penghuni secara permanen.
     */
    public function destroy(Penghuni $penghuni)
    {
        // 1. Validasi: Jangan hapus jika masih AKTIF menempati kamar
        // Alasan: Kamar harus dikosongkan (status available=true) lewat proses Checkout dulu.
        if ($penghuni->status_sewa === 'Aktif') {
            return response()->json([
                'message' => 'Gagal menghapus! Penghuni ini masih berstatus AKTIF menempati kamar. Silakan lakukan "Checkout" terlebih dahulu agar kamar menjadi kosong.'
            ], 409); // 409 Conflict
        }

        // 2. Bersihkan ikatan kamar jika masih ada (Defensive Coding)
        // Seharusnya Nonaktif = kamar_id null, tapi jaga-jaga.
        if ($penghuni->kamar_id) {
            $kamar = Kamar::find($penghuni->kamar_id);
            if ($kamar) {
                $kamar->update(['is_available' => true]);
            }
        }

        // 3. Hapus Data Penghuni
        // Karena kita sudah memutuskan Foreign Key di tabel Transaksi & Tagihan,
        // Data keuangan (history) TIDAK AKAN HILANG.
        $nama = $penghuni->nama_lengkap;
        $penghuni->delete();

        Log::info("Penghuni deleted permanently: {$nama} (ID: {$penghuni->id})");

        return response()->json([
            'message' => "Data penghuni '{$nama}' berhasil dihapus permanen."
        ], 200);
    }

    /**
     * Helper: Menghitung tanggal akhir berdasarkan durasi dan unit
     */
    private function calculateEndDate(Carbon $startDate, $duration, $unit)
    {
        $endDate = $startDate->copy();

        switch ($unit) {
            case 'day':
                $endDate->addDays($duration);
                break;
            case 'week':
                $endDate->addWeeks($duration);
                break;
            case 'month':
                $endDate->addMonths($duration);
                break;
            case 'year':
                $endDate->addYears($duration);
                break;
            default:
                $endDate->addMonths($duration); // Fallback
        }

        return $endDate->toDateString();
    }
}
