<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransaksiRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    /**
     * Sanitize input before validation to prevent XSS
     */
    protected function prepareForValidation()
    {
        if ($this->has('deskripsi')) {
            $this->merge([
                'deskripsi' => strip_tags($this->deskripsi),
            ]);
        }
    }

    public function rules()
    {
        return [
            'tipe_transaksi' => 'required|in:Pemasukan,Pengeluaran',
            'kategori' => 'required|string|max:100',
            'deskripsi' => 'required|string',
            'jumlah' => 'required|numeric|min:1',
            'tanggal_transaksi' => 'required|date',
            'kamar_id' => 'nullable|integer',
            'metode_pembayaran' => 'nullable|string',
            'penghuni_id' => 'nullable|integer',
        ];
    }
}
