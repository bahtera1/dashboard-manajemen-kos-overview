<?php

// app/Models/Tagihan.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tagihan extends Model
{
    use HasFactory;

    protected $fillable = [
        'penghuni_id',
        'nama_penghuni',
        'kamar_id',
        'nama_kamar',
        'nomor_tagihan',
        'deskripsi',
        'jumlah',
        'jatuh_tempo',
        'status',
    ];

    // Relasi
    public function penghuni()
    {
        return $this->belongsTo(Penghuni::class);
    }

    public function kamar()
    {
        return $this->belongsTo(Kamar::class);
    }
}
