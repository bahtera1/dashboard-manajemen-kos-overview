<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TestPerformance extends Command
{
    protected $signature = 'test:performance {--count=10 : Jumlah request per endpoint}';
    protected $description = 'Test performa API endpoint sederhana';

    public function handle()
    {
        $count = $this->option('count');
        $baseUrl = 'http://127.0.0.1:8000/api';

        $this->info("🚀 Mulai Testing Performa Komprehensif ($count requests/scenario)...");

        // 1. Ambil user pertama untuk testing
        $user = \App\Models\User::first();
        if (!$user) {
            $this->error("❌ Tidak ada user di database. Jalankan seeder dulu.");
            return;
        }

        $token = $user->createToken('test-token')->plainTextToken;
        $this->info("🔑 Menggunakan user: " . $user->email);

        // ==========================================
        // SCENARIO 1: READ (GET Requests)
        // ==========================================
        $this->info("\n--- 📖 SCENARIO 1: READ PERFORMANCE ---");
        $readEndpoints = [
            'List Kamar' => '/kamars',
            'List Penghuni' => '/penghunis',
            'Laporan (Cached)' => '/reports/due-soon',
            'Search Kamar' => '/kamars?search=A',
            'Filter Kamar Kosong' => '/kamars?is_available=true'
        ];

        foreach ($readEndpoints as $label => $endpoint) {
            $totalTime = 0;
            $successCount = 0;

            for ($i = 0; $i < $count; $i++) {
                $start = microtime(true);
                $res = Http::withToken($token)->get("$baseUrl$endpoint");
                $end = microtime(true);

                if ($res->successful())
                    $successCount++;
                $totalTime += ($end - $start);
            }

            $avgTime = ($totalTime / $count) * 1000;
            $this->info(sprintf("   %-25s: %6.2f ms (Success: $successCount/$count)", $label, $avgTime));
        }

        // ==========================================
        // SCENARIO 2: WRITE (POST/PUT/DELETE)
        // ==========================================
        $this->info("\n--- ✍️  SCENARIO 2: WRITE PERFORMANCE (Create-Update-Delete) ---");

        $totalWriteTime = 0;

        for ($i = 0; $i < $count; $i++) {
            // A. CREATE
            $start = microtime(true);
            $res = Http::withToken($token)->post("$baseUrl/kamars", [
                'nama_kamar' => "TEST_PERF_$i",
                'harga_bulanan' => 500000,
                'luas_kamar' => '3x3',
                'is_available' => true,
                'blok' => 'X',
                'lantai' => 1,
                'type' => 1
            ]);

            if ($res->failed()) {
                $this->warn("   Gagal Create: " . $res->body());
                continue;
            }
            $kamarId = $res->json('data.id');

            // B. UPDATE
            Http::withToken($token)->put("$baseUrl/kamars/$kamarId", [
                'nama_kamar' => "TEST_PERF_UPDATED_$i",
                'harga_bulanan' => 600000,
            ]);

            // C. DELETE
            Http::withToken($token)->delete("$baseUrl/kamars/$kamarId");

            $end = microtime(true);
            $totalWriteTime += ($end - $start);
        }

        $avgWriteTime = ($totalWriteTime / $count) * 1000;
        $this->info(sprintf("   %-25s: %6.2f ms (Full Cycle)", "CRUD Kamar Cycle", $avgWriteTime));


        // Cleanup
        $user->tokens()->where('name', 'test-token')->delete();
        $this->info("\n✅ Testing selesai.");
    }
}
