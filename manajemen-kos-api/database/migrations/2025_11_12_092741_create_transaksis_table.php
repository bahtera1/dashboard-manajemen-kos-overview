<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transaksis', function (Blueprint $table) {
            $table->id();

            // Foreign Keys
            $table->foreignId('penghuni_id')->nullable()->constrained('penghunis')->onDelete('set null');
            $table->foreignId('kamar_id')->nullable()->constrained('kamars')->onDelete('set null');

            // Snapshot columns (denormalized for history)
            $table->string('penghuni_name')->nullable();
            $table->string('kamar_name')->nullable();

            $table->enum('tipe_transaksi', ['Pemasukan', 'Pengeluaran']);
            $table->string('kategori', 100);
            $table->text('deskripsi');
            $table->decimal('jumlah', 10, 2);
            $table->date('tanggal_transaksi');
            $table->string('metode_pembayaran', 50)->nullable();

            // Indexes
            $table->index('tipe_transaksi');
            $table->index('tanggal_transaksi');
            $table->index('penghuni_id');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaksis');
    }
};
