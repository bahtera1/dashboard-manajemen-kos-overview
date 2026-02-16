<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TransaksiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        /*
         * Transaksi termasuk snapshot nama penghuni & kamar.
         */

        $now = Carbon::now();

        $transaksis = [
            // 1. Pemasukan Sewa - Budi Santoso
            [
                'tipe_transaksi' => 'Pemasukan',
                'kategori' => 'Sewa Bulanan',
                'jumlah' => 1500000,
                'tanggal_transaksi' => $now->copy()->subMonth(), // Bulan lalu
                'deskripsi' => 'Pembayaran Sewa Januari 2024 - Budi',
                'metode_pembayaran' => 'Transfer',
                'penghuni_id' => 1,
                'penghuni_name' => 'Budi Santoso', // Snapshot
                'kamar_id' => 2,
                'kamar_name' => 'Kamar 102', // Snapshot
                'created_at' => $now,
                'updated_at' => $now,
            ],
            // 2. Pemasukan Sewa - Siti Aminah
            [
                'tipe_transaksi' => 'Pemasukan',
                'kategori' => 'Sewa Bulanan',
                'jumlah' => 2000000,
                'tanggal_transaksi' => $now->copy()->subDays(15),
                'deskripsi' => 'Pembayaran Sewa Februari 2024 - Siti',
                'metode_pembayaran' => 'Tunai',
                'penghuni_id' => 2,
                'penghuni_name' => 'Siti Aminah',
                'kamar_id' => 3,
                'kamar_name' => 'Kamar 201',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            // 3. Pengeluaran - Listrik
            [
                'tipe_transaksi' => 'Pengeluaran',
                'kategori' => 'Biaya Listrik',
                'jumlah' => 450000,
                'tanggal_transaksi' => $now->copy()->subDays(5),
                'deskripsi' => 'Bayar Token Listrik Utama Kos',
                'metode_pembayaran' => 'Transfer',
                'penghuni_id' => null, // Tidak terkait penghuni
                'penghuni_name' => null,
                'kamar_id' => null,
                'kamar_name' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            // 4. Pengeluaran - Internet / WiFi
            [
                'tipe_transaksi' => 'Pengeluaran',
                'kategori' => 'Biaya Internet',
                'jumlah' => 350000,
                'tanggal_transaksi' => $now->copy()->subDays(2),
                'deskripsi' => 'Bayar Tagihan IndiHome Februari',
                'metode_pembayaran' => 'Transfer',
                'penghuni_id' => null,
                'penghuni_name' => null,
                'kamar_id' => null,
                'kamar_name' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            // 5. Pemasukan - Deposit Rina
            [
                'tipe_transaksi' => 'Pemasukan',
                'kategori' => 'Deposit',
                'jumlah' => 500000,
                'tanggal_transaksi' => $now->copy()->subDays(10),
                'deskripsi' => 'Deposit Awal Rina Nose',
                'metode_pembayaran' => 'Transfer',
                'penghuni_id' => 4,
                'penghuni_name' => 'Rina Nose',
                'kamar_id' => 5,
                'kamar_name' => 'Kamar 301',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        DB::table('transaksis')->insert($transaksis);
    }
}
