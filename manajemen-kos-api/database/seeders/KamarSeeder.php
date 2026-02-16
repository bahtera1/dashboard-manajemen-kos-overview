<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class KamarSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        /*
         * Note: Fasilitas disimpan dalam format JSON string.
         * Contoh: '["Kasur","Lemari","AC","WiFi"]'
         */

        $kamars = [
            [
                'nama_kamar' => 'Kamar 101',
                'harga_bulanan' => 1500000, // 1.5 Juta
                'luas_kamar' => '3x4 m',
                'is_available' => true, // Kosong
                'deskripsi_fasilitas' => json_encode(['Kasur', 'Lemari', 'Meja Belajar', 'WiFi']),
                'blok' => 'A',
                'lantai' => 1,
                'type' => 1, // 1 = Standard
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'nama_kamar' => 'Kamar 102',
                'harga_bulanan' => 1500000,
                'luas_kamar' => '3x4 m',
                'is_available' => false, // Dihuni (Nanti diisi Penghuni 1)
                'deskripsi_fasilitas' => json_encode(['Kasur', 'Lemari', 'Meja Belajar', 'WiFi']),
                'blok' => 'A',
                'lantai' => 1,
                'type' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'nama_kamar' => 'Kamar 201',
                'harga_bulanan' => 2000000, // 2 Juta (AC + Kamar Mandi Dalam)
                'luas_kamar' => '4x5 m',
                'is_available' => false, // Dihuni (Nanti diisi Penghuni 2)
                'deskripsi_fasilitas' => json_encode(['Kasur King Size', 'Lemari Besar', 'AC', 'Kamar Mandi Dalam', 'WiFi']),
                'blok' => 'B',
                'lantai' => 2,
                'type' => 2, // 2 = VIP
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'nama_kamar' => 'Kamar 202',
                'harga_bulanan' => 2000000,
                'luas_kamar' => '4x5 m',
                'is_available' => true, // Kosong
                'deskripsi_fasilitas' => json_encode(['Kasur King Size', 'Lemari Besar', 'AC', 'Kamar Mandi Dalam', 'WiFi']),
                'blok' => 'B',
                'lantai' => 2,
                'type' => 2,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'nama_kamar' => 'Kamar 301',
                'harga_bulanan' => 1200000, // 1.2 Juta (Hemat)
                'luas_kamar' => '3x3 m',
                'is_available' => true, // Kosong
                'deskripsi_fasilitas' => json_encode(['Kasur', 'Lemari Kecil', 'Kipas Angin', 'WiFi']),
                'blok' => 'C',
                'lantai' => 3,
                'type' => 3, // 3 = Economis
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ];

        DB::table('kamars')->insert($kamars);
    }
}
