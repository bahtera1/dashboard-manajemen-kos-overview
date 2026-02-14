<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PenghuniSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        /*
         * Asumsi Seeder Kamar sudah dijalankan dan ID 1-5 tersedia.
         * Kamar 102 (ID 2) & Kamar 201 (ID 3) kita set 'is_available' = false di KamarSeeder
         * Jadi kita isi penghuni di situ.
         */

        $penghunis = [
            [
                'nama_lengkap' => 'Budi Santoso',
                'nomor_telepon' => '081234567890',
                'status_sewa' => 'Aktif',
                'kamar_id' => 2, // Menempati Kamar 102
                'tanggal_masuk' => Carbon::parse('2024-01-01'),
                'durasi_sewa' => 12, // 1 Tahun
                'satuan_durasi' => 'Bulan',
                'masa_berakhir_sewa' => Carbon::parse('2025-01-01'),
                'foto_ktp' => null, // Opsional
                'nomor_ktp' => '3201234567890001',
                // Kolom tambahan lain jika ada di migrasi
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'nama_lengkap' => 'Siti Aminah',
                'nomor_telepon' => '089876543210',
                'status_sewa' => 'Aktif',
                'kamar_id' => 3, // Menempati Kamar 201
                'tanggal_masuk' => Carbon::parse('2024-02-15'),
                'durasi_sewa' => 6, // 6 Bulan
                'satuan_durasi' => 'Bulan',
                'masa_berakhir_sewa' => Carbon::parse('2024-08-15'),
                'foto_ktp' => null,
                'nomor_ktp' => '3201234567890002',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'nama_lengkap' => 'Joko Susilo (Ex-Penghuni)',
                'nomor_telepon' => '085678901234',
                'status_sewa' => 'Nonaktif', // Sudah keluar
                'kamar_id' => null, // Sudah tidak menempati kamar
                'tanggal_masuk' => Carbon::parse('2023-01-01'),
                'durasi_sewa' => 12,
                'satuan_durasi' => 'Bulan',
                'masa_berakhir_sewa' => Carbon::parse('2024-01-01'), // Sudah lewat
                'foto_ktp' => null,
                'nomor_ktp' => '3201234567890003',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'nama_lengkap' => 'Rina Nose',
                'nomor_telepon' => '08111222333',
                'status_sewa' => 'Aktif',
                'kamar_id' => 5, // Menempati Kamar 301 (Kita update status kamar jadi false nanti manual/logic)
                'tanggal_masuk' => Carbon::now()->subDays(10), // Baru masuk 10 hari lalu
                'durasi_sewa' => 1,
                'satuan_durasi' => 'Bulan',
                'masa_berakhir_sewa' => Carbon::now()->addDays(20),
                'foto_ktp' => null,
                'nomor_ktp' => '3201234567890004',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'nama_lengkap' => 'Dedi Corbuzier',
                'nomor_telepon' => '08777888999',
                'status_sewa' => 'Dibatalkan', // Cancelled
                'kamar_id' => null,
                'tanggal_masuk' => null,
                'durasi_sewa' => 0,
                'satuan_durasi' => 'Bulan',
                'masa_berakhir_sewa' => null,
                'foto_ktp' => null,
                'nomor_ktp' => '3201234567890005',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ];

        DB::table('penghunis')->insert($penghunis);

        // Update status kamar yang ditempati Rina Nose (ID 5) jadi tidak available
        DB::table('kamars')->where('id', 5)->update(['is_available' => false]);
    }
}
