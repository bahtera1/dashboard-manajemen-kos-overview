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
        // 0. Hapus transaksi_id (Gabungan dari migrasi sebelumnya)
        Schema::table('tagihans', function (Blueprint $table) {
            if (Schema::hasColumn('tagihans', 'transaksi_id')) {
                // Drop FK jika ada
                try {
                    $table->dropForeign(['transaksi_id']);
                } catch (\Exception $e) { /* Ignore */
                }

                // Drop Column
                $table->dropColumn('transaksi_id');
            }
        });

        // 1. Tambahkan Kolom Snapshot & Ubah Nullable
        Schema::table('tagihans', function (Blueprint $table) {
            if (!Schema::hasColumn('tagihans', 'nama_penghuni')) {
                $table->string('nama_penghuni')->after('penghuni_id')->nullable();
            }
            if (!Schema::hasColumn('tagihans', 'nama_kamar')) {
                $table->string('nama_kamar')->after('kamar_id')->nullable();
            }
            // Ubah jadi nullable
            $table->unsignedBigInteger('penghuni_id')->nullable()->change();
            $table->unsignedBigInteger('kamar_id')->nullable()->change();
        });

        // 1. Hapus Foreign Key (Cari namanya dari information_schema)
        $foreignKeys = DB::select("
            SELECT CONSTRAINT_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_NAME = 'tagihans' 
            AND COLUMN_NAME IN ('penghuni_id', 'kamar_id')
            AND REFERENCED_TABLE_NAME IS NOT NULL
            AND TABLE_SCHEMA = DATABASE()
        ");

        foreach ($foreignKeys as $fk) {
            try {
                DB::statement("ALTER TABLE tagihans DROP FOREIGN KEY `{$fk->CONSTRAINT_NAME}`");
            } catch (\Exception $e) { /* Ignore */
            }
        }

        // 2. Hapus Index (Cari namanya dari information_schema)
        $indexes = DB::select("
            SELECT INDEX_NAME 
            FROM information_schema.STATISTICS 
            WHERE TABLE_NAME = 'tagihans' 
            AND COLUMN_NAME IN ('penghuni_id', 'kamar_id')
            AND INDEX_NAME != 'PRIMARY'
            AND TABLE_SCHEMA = DATABASE()
        ");

        // Gunakan array unique karena index bisa muncul multiple rows per kolom
        $uniqueIndexes = array_unique(array_column($indexes, 'INDEX_NAME'));

        foreach ($uniqueIndexes as $indexName) {
            try {
                DB::statement("ALTER TABLE tagihans DROP INDEX `{$indexName}`");
            } catch (\Exception $e) { /* Ignore */
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Tidak perlu restore karena kita ingin menghapusnya permanen
    }
};
