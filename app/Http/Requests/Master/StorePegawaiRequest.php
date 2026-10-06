<?php

declare(strict_types=1);

namespace App\Http\Requests\Master;

use Illuminate\Foundation\Http\FormRequest;

class StorePegawaiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('master.manage') ?? false;
    }

    public function rules(): array
    {
        return [
            'nip' => ['nullable', 'string', 'max:30', 'unique:pegawai,nip'],
            'nama' => ['required', 'string', 'max:150'],
            'jabatan' => ['required', 'string', 'max:100'],
            'unit_kerja' => ['nullable', 'string', 'max:100'],
            'no_hp' => ['nullable', 'string', 'max:25'],
            'user_id' => ['nullable', 'exists:users,id', 'unique:pegawai,user_id'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nama.required' => 'Nama pegawai wajib diisi.',
            'jabatan.required' => 'Jabatan wajib diisi.',
            'nip.unique' => 'NIP sudah terdaftar.',
            'user_id.unique' => 'Akun pengguna ini sudah ditautkan ke pegawai lain.',
        ];
    }
}
