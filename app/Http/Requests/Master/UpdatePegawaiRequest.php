<?php

declare(strict_types=1);

namespace App\Http\Requests\Master;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePegawaiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('master.manage') ?? false;
    }

    public function rules(): array
    {
        $pegawaiId = $this->route('pegawai')?->id ?? $this->route('pegawai');

        return [
            'nip' => ['nullable', 'string', 'max:30', Rule::unique('pegawai', 'nip')->ignore($pegawaiId)],
            'nama' => ['required', 'string', 'max:150'],
            'jabatan' => ['required', 'string', 'max:100'],
            'unit_kerja' => ['nullable', 'string', 'max:100'],
            'no_hp' => ['nullable', 'string', 'max:25'],
            'user_id' => ['nullable', 'exists:users,id', Rule::unique('pegawai', 'user_id')->ignore($pegawaiId)],
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
