<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePemeliharaanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('pemeliharaan.manage') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'aset_id' => ['required', 'integer', 'exists:aset,id'],
            'tanggal' => ['required', 'date'],
            'jenis' => ['required', 'string', 'in:rutin,perbaikan,penggantian_suku_cadang'],
            'uraian' => ['required', 'string', 'max:1000'],
            'biaya' => ['nullable', 'numeric', 'min:0'],
            'pelaksana' => ['nullable', 'string', 'max:150'],
            'kondisi_sesudah' => ['required', 'string', 'in:baik,rusak_ringan,rusak_berat'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'aset_id.required' => 'Aset yang dipelihara wajib dipilih.',
            'aset_id.exists' => 'Aset tidak ditemukan dalam sistem.',
            'tanggal.required' => 'Tanggal servis wajib diisi.',
            'jenis.required' => 'Jenis pemeliharaan wajib dipilih.',
            'uraian.required' => 'Uraian pekerjaan servis wajib diisi.',
            'kondisi_sesudah.required' => 'Kondisi fisik aset setelah diservis wajib ditentukan.',
        ];
    }
}
