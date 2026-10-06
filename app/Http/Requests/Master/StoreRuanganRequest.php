<?php

declare(strict_types=1);

namespace App\Http\Requests\Master;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRuanganRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('master.manage') ?? false;
    }

    public function rules(): array
    {
        return [
            'kode' => ['required', 'string', 'max:50', 'unique:ruangan,kode'],
            'nama' => ['required', 'string', 'max:150'],
            'gedung' => ['nullable', 'string', 'max:100'],
            'lantai' => ['nullable', 'string', 'max:20'],
            'penanggung_jawab_id' => ['nullable', 'exists:pegawai,id'],
            'keterangan' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'kode.required' => 'Kode ruangan wajib diisi.',
            'kode.unique' => 'Kode ruangan sudah digunakan.',
            'nama.required' => 'Nama ruangan wajib diisi.',
            'penanggung_jawab_id.exists' => 'Pegawai penanggung jawab tidak valid.',
        ];
    }
}
