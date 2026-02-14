<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Penghuni; // Pastikan ini diimpor jika menggunakan relasi

class Kamar extends Model
{
    use HasFactory, SoftDeletes;

    // 🎯 PERBAIKAN: Gunakan $fillable untuk eksplisit mengizinkan kolom baru
    protected $fillable = [
        'nama_kamar',
        'harga_bulanan',
        'luas_kamar',
        'is_available',
        'deskripsi_fasilitas',
        'blok',
        'lantai',
        'type'
    ];
    protected $casts = [
        'deskripsi_fasilitas' => 'array',
        'harga_bulanan' => 'decimal:0',
        'lantai' => 'integer',
        'type' => 'integer',
        'is_available' => 'boolean',
    ];


    public function penghuni()
    {
        return $this->hasOne(Penghuni::class, 'kamar_id');
    }
    public function penghunis()
    {
        return $this->hasMany(Penghuni::class);
    }
}
