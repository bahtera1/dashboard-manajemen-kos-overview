<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Transaksi;

class UpdateTransaksiSnapshots extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'transaksi:update-snapshots';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update semua transaksi existing dengan snapshot nama penghuni dan kamar';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Mulai update snapshot transaksi...');

        $transaksis = Transaksi::with(['penghuni', 'kamar'])->get();
        $updated = 0;

        foreach ($transaksis as $transaksi) {
            $needsUpdate = false;
            $updates = [];

            // Update penghuni_name jika ada penghuni_id dan belum ada penghuni_name
            if ($transaksi->penghuni_id && !$transaksi->penghuni_name && $transaksi->penghuni) {
                $updates['penghuni_name'] = $transaksi->penghuni->nama_lengkap;
                $needsUpdate = true;
            }

            // Update kamar_name jika ada kamar_id dan belum ada kamar_name
            if ($transaksi->kamar_id && !$transaksi->kamar_name && $transaksi->kamar) {
                $updates['kamar_name'] = $transaksi->kamar->nama_kamar;
                $needsUpdate = true;
            }

            if ($needsUpdate) {
                $transaksi->update($updates);
                $updated++;
            }
        }

        $this->info("Selesai! {$updated} transaksi berhasil diupdate.");
        return 0;
    }
}
