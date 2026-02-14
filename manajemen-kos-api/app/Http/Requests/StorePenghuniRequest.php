<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePenghuniRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    /**
     * Sanitize input before validation
     */
    protected function prepareForValidation()
    {
        if ($this->has('catatan')) {
            $this->merge([
                'catatan' => strip_tags($this->catatan),
            ]);
        }
    }

    public function rules()
    {
        return [
            'kamar_id' => 'required|exists:kamars,id',
            'nama_lengkap' => 'required|string|max:255',
            'no_ktp' => 'required|string|max:17',
            'tanggal_masuk' => 'required|date',
            'pic_emergency' => 'required|string|max:255',
            'no_hp' => 'required|string|max:50',
            'email' => 'nullable|email|max:255',
            'pekerjaan' => 'nullable|string|max:100',
            'catatan' => 'nullable|string',
            'initial_duration' => 'nullable|integer|min:1',
            'duration_unit' => 'required|in:day,week,month,year',
        ];
    }
}
