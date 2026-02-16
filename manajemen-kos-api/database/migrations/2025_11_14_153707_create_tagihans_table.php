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
        Schema::create('tagihans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('penghuni_id')->nullable()->constrained('penghunis')->onDelete('set null');
            $table->foreignId('kamar_id')->nullable()->constrained('kamars')->onDelete('set null');
            $table->foreignId('transaksi_id')
                ->nullable()
                ->constrained('transaksis')
                ->onDelete('set null');
            $table->string('nomor_tagihan');
            $table->text('deskripsi');
            $table->decimal('jumlah', 10, 2);
            $table->date('jatuh_tempo');
            $table->enum('status', ['Dibuat', 'Belum Lunas', 'Lunas', 'Dibatalkan'])->default('Dibuat');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tagihans');
    }
};
