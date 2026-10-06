<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMutasiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('mutasi.manage') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'aset_ids' => ['required', 'array', 'min:1'],
            'aset_ids.*' => ['required', 'integer', 'exists:aset,id'],
            'jenis' => ['required', 'string', 'in:penempatan_awal,pindah_ruangan,ganti_pemegang,pengembalian'],
            'ke_ruangan_id' => ['nullable', 'integer', 'exists:ruangan,id'],
            'ke_pegawai_id' => ['nullable', 'integer', 'exists:pegawai,id'],
            'tanggal' => ['required', 'date'],
            'alasan' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'aset_ids.required' => 'Pilih minimal satu aset yang akan dimutasi.',
            'aset_ids.min' => 'Pilih minimal satu aset yang akan dimutasi.',
            'jenis.required' => 'Jenis mutasi wajib dipilih.',
            'jenis.in' => 'Jenis mutasi yang dipilih tidak valid.',
            'ke_ruangan_id.exists' => 'Ruangan tujuan tidak terdaftar dalam sistem.',
            'ke_pegawai_id.exists' => 'Pegawai penerima tidak terdaftar dalam sistem.',
            'tanggal.required' => 'Tanggal mutasi wajib diisi.',
            'tanggal.date' => 'Format tanggal mutasi tidak valid.',
        ];
    }
}
