<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. User Admin (Penting)
        $this->call([
            UserSeeder::class,
        ]);

        // 2. Data Master (Kamar)
        $this->call([
            KamarSeeder::class,
        ]);

        // 3. Data Penghuni (Butuh Kamar)
        $this->call([
            PenghuniSeeder::class,
        ]);

        // 4. Data Transaksi & Tagihan (Butuh Penghuni & Kamar)
        $this->call([
            TransaksiSeeder::class,
            TagihanSeeder::class,
        ]);
    }
}
