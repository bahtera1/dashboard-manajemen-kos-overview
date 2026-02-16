<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\KamarController;
use App\Http\Controllers\PenghuniController;
use App\Http\Controllers\TransaksiController;
use App\Http\Controllers\TagihanController;
use App\Http\Controllers\ReportController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group.
|
*/

// ============================================================================
// 1. PUBLIC ROUTES
// ============================================================================
// Dibatasi 10 request per menit untuk keamanan login.
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

// ============================================================================
// 2. PROTECTED ROUTES (Memerlukan Autentikasi Sanctum)
// ============================================================================
// Semua route di bawah ini memerlukan header: Authorization: Bearer <token>
// Rate Limit Default: 120 request per menit.
Route::middleware(['auth:sanctum', 'throttle:120,1'])->group(function () {

    // --- Manajemen User & Autentikasi ---
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // --- Manajemen Kamar (Master Data) ---
    Route::apiResource('kamars', KamarController::class);

    // --- Manajemen Penghuni ---
    Route::apiResource('penghunis', PenghuniController::class);
    // Operasi Khusus Penghuni
    Route::post('penghunis/{penghuni}/payment', [PenghuniController::class, 'recordPayment']); // Catat Pembayaran & Perpanjang
    Route::post('penghunis/{penghuni}/checkout', [PenghuniController::class, 'checkout']);      // Proses Checkout Penghuni
    Route::post('penghunis/{penghuni}/reassign', [PenghuniController::class, 'reassign']);      // Sewa Kembali (Re-entry)
    Route::get('penghunis/{id}/tagihans', [PenghuniController::class, 'getDetailAndTagihans']); // Detail Penghuni + Sejarah Tagihan

    // --- Manajemen Tagihan & Kuitansi ---
    Route::get('tagihans/{id}/kuitansi-data', [TagihanController::class, 'getKuitansiData']);       // Ambil Data Historis Kuitansi
    Route::get('penghunis/{id}/kuitansi-preview', [TagihanController::class, 'getKuitansiPreview']); // Preview Data Kuitansi Baru
    Route::post('tagihans', [TagihanController::class, 'store']);                                   // Simpan Tagihan Baru

    // --- Manajemen Transaksi (Pemasukan & Pengeluaran) ---
    Route::apiResource('transaksis', TransaksiController::class);

    // ============================================================================
    // 3. LAPORAN & DASHBOARD (Analytics)
    // ============================================================================
    // Rate limit diperlonggar (300 req/menit) karena dashboard memuat banyak data sekaligus.
    Route::middleware('throttle:300,1')->group(function () {

        // Laporan Transaksi Spesifik
        Route::get('reports/laba-rugi', [TransaksiController::class, 'reportLabaRugi']);
        Route::get('reports/due-soon', [TransaksiController::class, 'dueSoonReport']);
        Route::get('reports/transaction-summary', [TransaksiController::class, 'transactionSummaryExport']);

        // Kompilasi Laporan Lengkap & Statistik Dashboard
        Route::get('reports/dashboard-stats', [ReportController::class, 'getDashboardStats']);
        Route::get('reports/room-occupancy', [ReportController::class, 'getRoomOccupancyReport']);
        Route::get('reports/tenant-details', [ReportController::class, 'getTenantDetailReport']);
        Route::get('reports/financial-summary', [ReportController::class, 'getFinancialSummary']);
        Route::get('reports/occupancy-trend', [ReportController::class, 'getOccupancyTrend']);
    });

});
