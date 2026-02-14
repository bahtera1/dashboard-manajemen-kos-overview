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
        Schema::table('transaksis', function (Blueprint $table) {
            $table->string('account_code')->nullable()->after('kategori');
            $table->tinyInteger('cash_flow_index')->nullable()->after('account_code')->comment('0: -, 1: Operasi, 2: Investasi, 3: Pendanaan');

            // Index sudah ada di create_transaksis_table, jadi tidak perlu ditambah disini lagi.
            // $table->index('kamar_id'); // Kecuali kamar_id jika belum ada (di create file tadi kamar_id belum diindex eksplisit, tapi biasanya foreignId otomatis index? Tidak selalu. CONSTRAINT index iya).
            // Tapi foreign key constraint biasanya auto-create index di MySQL. Aman.
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transaksis', function (Blueprint $table) {
            $table->dropColumn(['account_code', 'cash_flow_index']);
        });
    }
};
