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
        Schema::create('penghunis', function (Blueprint $table) {
            $table->id();

            // Foreign Key
            $table->foreignId('kamar_id')->nullable()->constrained('kamars')->onDelete('restrict');

            $table->string('nama_lengkap', 150);
            $table->string('no_ktp', 17);
            $table->string('no_hp', 16);
            $table->string('email', 150)->nullable();
            $table->string('pekerjaan', 100)->nullable();
            $table->string('pic_emergency', 150);
            $table->date('tanggal_masuk')->nullable();
            $table->date('tanggal_keluar')->nullable();
            $table->enum('status_sewa', ['Aktif', 'Nonaktif'])->default('Aktif');
            $table->date('masa_berakhir_sewa')->nullable();
            $table->unsignedSmallInteger('durasi_bayar_terakhir')->nullable();
            $table->string('unit_bayar_terakhir', 10)->default('month');
            $table->text('catatan')->nullable();

            // Indexes
            $table->index('status_sewa');
            $table->index('kamar_id');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penghunis');
    }
};
