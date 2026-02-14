<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreKamarRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'nama_kamar' => 'required|string|max:100',
            'harga_bulanan' => 'required|numeric|min:0',
            'luas_kamar' => 'required|string|max:50',
            'blok' => 'required|string|max:10',
            'lantai' => 'required|integer|min:1',
            'type' => 'required|integer|min:1',
            'deskripsi_fasilitas' => 'nullable|string', //  string JSON
        ];
    }
}
