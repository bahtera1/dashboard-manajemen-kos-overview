<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Hapus Foreign Key (Cari namanya dari information_schema)
        $foreignKeys = DB::select("
            SELECT CONSTRAINT_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_NAME = 'transaksis' 
            AND COLUMN_NAME IN ('penghuni_id', 'kamar_id')
            AND REFERENCED_TABLE_NAME IS NOT NULL
            AND TABLE_SCHEMA = DATABASE()
        ");

        foreach ($foreignKeys as $fk) {
            try {
                DB::statement("ALTER TABLE transaksis DROP FOREIGN KEY `{$fk->CONSTRAINT_NAME}`");
            } catch (\Exception $e) { /* Ignore */
            }
        }

        // 2. Hapus Index (Cari namanya dari information_schema)
        $indexes = DB::select("
            SELECT INDEX_NAME 
            FROM information_schema.STATISTICS 
            WHERE TABLE_NAME = 'transaksis' 
            AND COLUMN_NAME IN ('penghuni_id', 'kamar_id')
            AND INDEX_NAME != 'PRIMARY'
            AND TABLE_SCHEMA = DATABASE()
        ");

        // Gunakan array unique karena index bisa muncul multiple rows per kolom
        $uniqueIndexes = array_unique(array_column($indexes, 'INDEX_NAME'));

        foreach ($uniqueIndexes as $indexName) {
            try {
                DB::statement("ALTER TABLE transaksis DROP INDEX `{$indexName}`");
            } catch (\Exception $e) { /* Ignore */
            }
        }

        // 3. Pastikan kolom nullable (Optional, karena sudah nullable di create)
        Schema::table('transaksis', function (Blueprint $table) {
            $table->unsignedBigInteger('penghuni_id')->nullable()->change();
            $table->unsignedBigInteger('kamar_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No restore needed as requested
    }
};
