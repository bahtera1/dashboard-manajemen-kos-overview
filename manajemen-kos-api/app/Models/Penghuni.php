<?php

namespace App\Models;

// 🎯 KOREKSI KRITIS: Tambahkan import ini!
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Kamar;
use App\Models\Transaksi;

class Penghuni extends Model
{
    use HasFactory; // Baris 7 yang menyebabkan error

    // Untuk menghindari Mass Assignment Error
    protected $guarded = ['id'];

    // Relasi ke Kamar
    public function kamar()
    {
        return $this->belongsTo(Kamar::class);
    }

    // Relasi ke Transaksi
    public function transaksis()
    {
        return $this->hasMany(Transaksi::class, 'penghuni_id');
    }
    public function tagihans()
    {
        // Penghuni memiliki banyak Tagihan (Invoice/Pembayaran)
        return $this->hasMany(Tagihan::class, 'penghuni_id');
    }
}
