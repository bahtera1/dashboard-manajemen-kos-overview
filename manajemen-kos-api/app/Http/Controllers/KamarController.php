<?php

namespace App\Http\Controllers;

use App\Models\Kamar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Requests\StoreKamarRequest;
use App\Http\Requests\UpdateKamarRequest;
use Illuminate\Support\Facades\Log;

class KamarController extends Controller
{
    /**
     * GET /api/kamars
     * Mengambil semua data kamar dengan relasi penghuni
     */
    public function index(Request $request)
    {
        $query = Kamar::query();

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_kamar', 'like', "%{$search}%")
                    ->orWhere('blok', 'like', "%{$search}%");
            });
        }

        // Filter by availability
        if ($request->filled('is_available')) {
            $available = $request->is_available === 'true' || $request->is_available === '1';
            if ($available) {
                $query->whereDoesntHave('penghuni', function ($q) {
                    $q->where('status_sewa', 'Aktif');
                });
            } else {
                $query->whereHas('penghuni', function ($q) {
                    $q->where('status_sewa', 'Aktif');
                });
            }
        }

        // Filter by lantai
        if ($request->filled('lantai')) {
            $query->where('lantai', $request->lantai);
        }

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $kamars = $query->with('penghuni:id,nama_lengkap,kamar_id,status_sewa')
            ->orderBy('nama_kamar', 'asc')
            ->get();

        Log::info('Kamar list fetched', [
            'count' => $kamars->count(),
            'search' => $request->search ?? null,
            'filters' => [
                'is_available' => $request->is_available ?? null,
                'lantai' => $request->lantai ?? null,
                'type' => $request->type ?? null
            ]
        ]);

        return response()->json([
            'message' => 'Daftar kamar berhasil diambil.',
            'data' => $kamars
        ], 200);
    }

    /**
     * POST /api/kamars
     * Membuat kamar baru
     */
    public function store(StoreKamarRequest $request)
    {
        // Validasi otomatis oleh StoreKamarRequest

        // Validasi format JSON untuk deskripsi_fasilitas
        if ($request->filled('deskripsi_fasilitas')) {
            $fasilitasString = $request->input('deskripsi_fasilitas');
            $decoded = json_decode($fasilitasString, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('JSON fasilitas tidak valid:', ['error' => json_last_error_msg()]);
                return response()->json([
                    'message' => 'Format deskripsi_fasilitas tidak valid',
                    'error' => json_last_error_msg()
                ], 422);
            }
        }

        // Simpan kamar
        $kamar = Kamar::create($request->all());

        Log::info('Kamar created:', [
            'id' => $kamar->id,
            'nama' => $kamar->nama_kamar,
            'has_fasilitas' => !empty($kamar->deskripsi_fasilitas)
        ]);

        return response()->json([
            'message' => 'Kamar baru berhasil ditambahkan.',
            'data' => $kamar->fresh()
        ], 201);
    }

    /**
     * GET /api/kamars/{id}
     * Menampilkan detail satu kamar
     */
    public function show(Kamar $kamar)
    {
        // Load relasi penghuni jika ada
        $kamar->load('penghuni:id,nama_lengkap,kamar_id,status_sewa');

        return response()->json([
            'message' => 'Detail kamar berhasil diambil.',
            'data' => $kamar
        ], 200);
    }

    /**
     * PUT/PATCH /api/kamars/{id}
     * Update data kamar
     */
    public function update(UpdateKamarRequest $request, Kamar $kamar)
    {
        // Validasi otomatis oleh UpdateKamarRequest

        // Validasi format JSON untuk deskripsi_fasilitas
        if ($request->filled('deskripsi_fasilitas')) {
            $fasilitasString = $request->input('deskripsi_fasilitas');
            $decoded = json_decode($fasilitasString, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('JSON fasilitas tidak valid:', ['error' => json_last_error_msg()]);
                return response()->json([
                    'message' => 'Format deskripsi_fasilitas tidak valid',
                    'error' => json_last_error_msg()
                ], 422);
            }
        }

        // Update kamar
        $kamar->update($request->all());

        Log::info('Kamar updated:', ['id' => $kamar->id, 'nama' => $kamar->nama_kamar]);

        return response()->json([
            'message' => 'Data kamar berhasil diperbarui.',
            'data' => $kamar->fresh()
        ], 200);
    }

    /**
     * DELETE /api/kamars/{id}
     * Hapus kamar (hanya jika tidak ditempati)
     */
    public function destroy(Kamar $kamar)
    {
        // Cek apakah kamar memiliki penghuni aktif
        if ($kamar->penghuni()->where('status_sewa', 'Aktif')->exists()) {
            Log::warning('Gagal hapus kamar - masih ditempati:', ['kamar_id' => $kamar->id]);
            return response()->json([
                'message' => 'Kamar tidak dapat dihapus karena masih ditempati penghuni aktif.'
            ], 409);
        }

        try {
            $kamarId = $kamar->id;
            $kamarNama = $kamar->nama_kamar;
            $kamar->delete();

            Log::info('Kamar deleted (Soft Delete):', ['id' => $kamarId, 'nama' => $kamarNama]);

            return response()->json(['message' => 'Kamar berhasil dihapus.'], 200);
        } catch (\Exception $e) {
            Log::error('Gagal menghapus kamar:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Terjadi kesalahan saat menghapus kamar: ' . $e->getMessage()
            ], 500);
        }
    }
}
