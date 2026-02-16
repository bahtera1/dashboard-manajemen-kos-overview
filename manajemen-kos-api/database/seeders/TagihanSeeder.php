<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TagihanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        /*
         * Tagihan menyimpan snapshot nama penghuni & kamar.
         */

        $now = Carbon::now();

        $tagihans = [
            // 1. Tagihan Sewa Januari - Budi (Lunas)
            [
                'penghuni_id' => 1,
                'nama_penghuni' => 'Budi Santoso',
                'kamar_id' => 2,
                'nama_kamar' => 'Kamar 102',
                'nomor_tagihan' => 'INV-202401-001',
                'deskripsi' => 'Tagihan Sewa Januari 2024',
                'jumlah' => 1500000,
                'jatuh_tempo' => $now->copy()->subMonth()->addDays(5),
                'status' => 'Lunas',
                'created_at' => $now->copy()->subMonth(),
                'updated_at' => $now->copy()->subMonth(),
            ],
            // 2. Tagihan Sewa Februari - Siti (Lunas)
            [
                'penghuni_id' => 2,
                'nama_penghuni' => 'Siti Aminah',
                'kamar_id' => 3,
                'nama_kamar' => 'Kamar 201',
                'nomor_tagihan' => 'INV-202402-002',
                'deskripsi' => 'Tagihan Sewa Februari 2024',
                'jumlah' => 2000000,
                'jatuh_tempo' => $now->copy()->subDays(10), // Lewat jatuh tempo
                'status' => 'Lunas',
                'created_at' => $now->copy()->subDays(20),
                'updated_at' => $now->copy()->subDays(15),
            ],
            // 3. Tagihan Sewa Maret (Next Month) - Siti (Belum Lunas)
            [
                'penghuni_id' => 2,
                'nama_penghuni' => 'Siti Aminah',
                'kamar_id' => 3,
                'nama_kamar' => 'Kamar 201',
                'nomor_tagihan' => 'INV-202403-003',
                'deskripsi' => 'Tagihan Sewa Maret 2024',
                'jumlah' => 2000000,
                'jatuh_tempo' => $now->copy()->addDays(20), // Masih lama
                'status' => 'Belum Lunas',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            // 4. Tagihan Sewa Awal - Rina (Lunas)
            [
                'penghuni_id' => 4,
                'nama_penghuni' => 'Rina Nose',
                'kamar_id' => 5,
                'nama_kamar' => 'Kamar 301',
                'nomor_tagihan' => 'INV-202402-004',
                'deskripsi' => 'Tagihan Sewa Februari (Awal Masuk)',
                'jumlah' => 1200000, // Harga Kamar 301
                'jatuh_tempo' => $now->copy()->subDays(5),
                'status' => 'Lunas',
                'created_at' => $now->copy()->subDays(10),
                'updated_at' => $now->copy()->subDays(10),
            ],
            // 5. Tagihan Listrik Tambahan - Budi (Belum Lunas)
            [
                'penghuni_id' => 1,
                'nama_penghuni' => 'Budi Santoso',
                'kamar_id' => 2,
                'nama_kamar' => 'Kamar 102',
                'nomor_tagihan' => 'INV-202402-ADD',
                'deskripsi' => 'Tagihan Listrik Tambahan (Over usage)',
                'jumlah' => 50000,
                'jatuh_tempo' => $now->copy()->addDays(2),
                'status' => 'Belum Lunas',
                'created_at' => $now->copy()->subDays(1),
                'updated_at' => $now->copy()->subDays(1),
            ],
        ];

        DB::table('tagihans')->insert($tagihans);
    }
}
