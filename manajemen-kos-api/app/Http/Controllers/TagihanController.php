<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tagihan;
use Carbon\Carbon;
use App\Models\Kamar;
use App\Models\Penghuni;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class TagihanController extends Controller
{
    private function numberToText($number)
    {
        $num = floor($number);
        if ($num >= 1000000000)
            return "Satu Milyar Lebih Rupiah";
        if ($num >= 1000000)
            return "Jutaan Rupiah";
        if ($num >= 1000)
            return "Ratusan Ribu Rupiah";
        return "Jumlah Pembayaran";
    }

    /**
     * Preview Data Kuitansi/Invoice TANPA menyimpan ke database.
     * Mengambil data fresh dari Penghuni & Kamar.
     */
    public function getKuitansiPreview($penghuniId)
    {
        try {
            // 1. Ambil data Penghuni & Kamar
            $penghuni = Penghuni::with('kamar')->findOrFail($penghuniId);
            $kamar = $penghuni->kamar;

            if (!$kamar) {
                // Fallback jika tidak ada kamar (misal penghuni nonaktif)
                $kamarData = [
                    'id' => null,
                    'nama_kamar' => 'Tanpa Kamar',
                    'harga_bulanan' => 0,
                    'deskripsi_fasilitas' => []
                ];
            } else {
                $kamarData = $kamar;
            }

            // 2. Format Fasilitas
            $fasilitasTersedia = [];
            // Handle JSON/Array deskripsi_fasilitas
            $rawFasilitas = $kamarData['deskripsi_fasilitas'] ?? [];
            if (is_string($rawFasilitas)) {
                $decoded = json_decode($rawFasilitas, true);
                $fasilitasTersedia = is_array($decoded) ? $decoded : [];
            } elseif (is_array($rawFasilitas)) {
                $fasilitasTersedia = $rawFasilitas;
            }

            $fasilitasFormatted = [];
            $parkirFormatted = [];
            $PARKIR_LIST = ['Motor', 'Mobil', 'Rental Motor', 'Rental Mobil'];

            foreach ($fasilitasTersedia as $item) {
                $key = strtolower(str_replace(' ', '_', $item));
                if (in_array($item, $PARKIR_LIST)) {
                    $parkirFormatted[$key] = true;
                } else {
                    $fasilitasFormatted[$key] = true;
                }
            }

            // 3. Generate Data Dummy/Default untuk Invoice
            $date = Carbon::now();
            $nomorInvoice = 'INV-' . $date->format('Ymd') . '-' . rand(100, 999); // Generate random number on fly
            $harga = $kamarData['harga_bulanan'] ?? 0;

            // Struktur Data sama persis dengan getKuitansiData agar Frontend tidak perlu ubah banyak
            $kuitansiData = [
                // Data ID & Dokumen (Dummy ID karena tidak ada di DB)
                'id' => 'PREVIEW-TEMP',
                'transaksi_id' => null,
                'kamar_id' => $kamarData['id'],
                'nomor_kuitansi' => $nomorInvoice,
                'nomor_tagihan' => $nomorInvoice,

                // Data Waktu & Harga
                'tanggal_bayar' => $date->toDateString(),
                'jatuh_tempo' => $date->addDays(7)->toDateString(),
                'jumlah' => (float) $harga,
                'terbilang' => $this->numberToText((float) $harga),
                'deskripsi' => "Sewa Kamar " . ($kamarData['nama_kamar'] ?? ''),
                'tampilkan_jatuh_tempo' => true,

                // Data Penghuni & Kamar (Untuk Preview)
                'nama_penghuni' => $penghuni->nama_lengkap,
                'id_penghuni' => $penghuni->id,
                'nama_kamar' => $kamarData['nama_kamar'],
                'tarif_sewa' => $harga,
                'periode_sewa' => "Bulan " . $date->locale('id')->monthName . " " . $date->year,

                // Data Pembayaran
                'jatuh_tempo_berikut' => $penghuni->masa_berakhir_sewa
                    ? Carbon::parse($penghuni->masa_berakhir_sewa)->toDateString()
                    : 'N/A',
                'status_pembayaran' => 'Belum Lunas',
                'metode_pembayaran' => 'Transfer',

                'uang_muka' => 0,
                'pelunasan' => (float) $harga,
                'refund' => 0,
                'lain_lain' => 0,

                // Fasilitas
                'fasilitas' => $fasilitasFormatted,
                'parkir' => $parkirFormatted,
            ];

            return response()->json(['data' => $kuitansiData], 200);

        } catch (\Exception $e) {
            Log::error('Error in getKuitansiPreview: ' . $e->getMessage());
            return response()->json([
                'message' => 'Gagal generate preview kuitansi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menyimpan Tagihan baru ke database.
     * Dipanggil saat tombol "Cetak" diklik.
     * Menyimpan snapshot data agar mandiri (tidak tergantung relasi di masa depan).
     */
    public function store(Request $request)
    {
        try {
            // Validasi Input
            $validator = Validator::make($request->all(), [
                'penghuni_id' => 'required',
                'jumlah' => 'required',
                'nomor_kuitansi' => 'required',
                'status_pembayaran' => 'required',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            // Ambil data referensi untuk snapshot
            $penghuniRef = Penghuni::with('kamar')->find($request->penghuni_id);
            $namaPenghuniSnapshot = $penghuniRef ? $penghuniRef->nama_lengkap : 'Penghuni Tidak Ditemukan';
            $namaKamarSnapshot = ($penghuniRef && $penghuniRef->kamar) ? $penghuniRef->kamar->nama_kamar : ($request->nama_kamar ?? 'Tanpa Kamar');

            // Create Tagihan Baru dengan Snapshot Data
            $tagihan = Tagihan::create([
                'penghuni_id' => $request->penghuni_id,
                'nama_penghuni' => $namaPenghuniSnapshot,
                'kamar_id' => $request->kamar_id,
                'nama_kamar' => $namaKamarSnapshot,
                'nomor_tagihan' => $request->nomor_kuitansi, // Gunakan nomor manual user
                'deskripsi' => $request->deskripsi ?? 'Tagihan Kos', // Deskripsi singkat
                'jumlah' => $request->jumlah,
                'jatuh_tempo' => $request->jatuh_tempo ?? Carbon::now()->addDays(7),
                'status' => $request->status_pembayaran, // 'Lunas' / 'Belum Lunas'
            ]);

            return response()->json([
                'message' => 'Tagihan berhasil disimpan.',
                'tagihan_id' => $tagihan->id,
                'data' => $tagihan
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error storing tagihan: ' . $e->getMessage());
            return response()->json(['message' => 'Gagal menyimpan tagihan', 'error' => $e->getMessage()], 500);
        }
    }

    public function getKuitansiData($tagihanId)
    {
        try {
            // 1. Ambil data Tagihan SAJA (Tanpa Join/Relasi di awal)
            $tagihan = Tagihan::findOrFail($tagihanId);

            // 2. Cek apakah ini data snapshot (mandiri) atau data lama?
            $namaPenghuni = $tagihan->nama_penghuni;
            $namaKamar = $tagihan->nama_kamar;
            $kamar = null;

            // Jika data snapshot KOSONG (berarti ini data lama/history lama), baru kita intip tabel relasi
            if (empty($namaPenghuni) || empty($namaKamar)) {
                // Lazy Load relasi hanya jika dibutuhkan
                $tagihan->load(['penghuni.kamar']);

                $namaPenghuni = $namaPenghuni ?: ($tagihan->penghuni ? $tagihan->penghuni->nama_lengkap : 'Penghuni Terhapus');
                $namaKamar = $namaKamar ?: ($tagihan->penghuni && $tagihan->penghuni->kamar ? $tagihan->penghuni->kamar->nama_kamar : 'Kamar Terhapus');

                // Ambil referensi kamar untuk fasilitas (khusus data lama)
                $kamar = $tagihan->penghuni ? $tagihan->penghuni->kamar : null;
            } else {
                // If snapshot data exists, we still need to load kamar for facilities if kamar_id is present
                // and we want to show current facilities, not just snapshot.
                // If kamar_id is null, it means no kamar was associated or it was a custom tagihan.
                if ($tagihan->kamar_id) {
                    $tagihan->load('kamar'); // Load only kamar if kamar_id exists
                    $kamar = $tagihan->kamar;
                }
            }

            // Logic Format Fasilitas (Jika kamar masih ada)
            $fasilitasFormatted = [];
            $parkirFormatted = [];
            $PARKIR_LIST = ['Motor', 'Mobil', 'Rental Motor', 'Rental Mobil'];

            if ($kamar) {
                $rawFasilitas = $kamar->deskripsi_fasilitas;
                $fasilitasTersedia = [];

                if (is_array($rawFasilitas)) {
                    $fasilitasTersedia = $rawFasilitas;
                } else if (is_string($rawFasilitas)) {
                    $decoded = json_decode($rawFasilitas, true);
                    $fasilitasTersedia = is_array($decoded) ? $decoded : [];
                }

                foreach ($fasilitasTersedia as $item) {
                    $itemStr = is_string($item) ? $item : '';
                    $key = strtolower(str_replace(' ', '_', $itemStr));
                    if (in_array($itemStr, $PARKIR_LIST)) {
                        $parkirFormatted[$key] = true;
                    } else {
                        $fasilitasFormatted[$key] = true;
                    }
                }
            }

            return response()->json([
                'data' => [
                    'id' => $tagihan->id,
                    'kamar_id' => $tagihan->kamar_id, // Bisa null
                    'nomor_kuitansi' => $tagihan->nomor_tagihan,
                    'nomor_tagihan' => $tagihan->nomor_tagihan,
                    'tanggal_bayar' => $tagihan->created_at->format('Y-m-d'),
                    'jatuh_tempo' => $tagihan->jatuh_tempo,
                    'jumlah' => (float) $tagihan->jumlah,
                    'terbilang' => $this->numberToText((float) $tagihan->jumlah),
                    'deskripsi' => $tagihan->deskripsi,
                    'nama_penghuni' => $namaPenghuni, // Menggunakan Snapshot
                    'id_penghuni' => $tagihan->penghuni_id,
                    'nama_kamar' => $namaKamar, // Menggunakan Snapshot
                    'tarif_sewa' => (float) $tagihan->jumlah, // Asumsi tarif sewa = jumlah tagihan
                    'status_pembayaran' => $tagihan->status,
                    'metode_pembayaran' => 'Transfer',
                    'uang_muka' => 0,
                    'pelunasan' => (float) $tagihan->jumlah, // Default lunas
                    'refund' => 0,
                    'lain_lain' => 0,
                    'catatan' => $tagihan->deskripsi,
                    'fasilitas' => $fasilitasFormatted, // Kosong jika kamar terhapus
                    'parkir' => $parkirFormatted,
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error fetching tagihan details: ' . $e->getMessage());
            return response()->json(['message' => 'Gagal memuat data tagihan', 'error' => $e->getMessage()], 500);
        }
    }
}
