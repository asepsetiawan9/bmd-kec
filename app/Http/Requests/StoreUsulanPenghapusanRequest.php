<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUsulanPenghapusanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('penghapusan.create') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'tanggal' => ['required', 'date'],
            'alasan_umum' => ['required', 'string', 'min:5', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.aset_id' => ['required', 'integer', 'exists:aset,id'],
            'items.*.alasan' => ['required', 'string', 'in:rusak_berat,hilang,usang,lainnya'],
            'items.*.keterangan' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'tanggal.required' => 'Tanggal usulan wajib diisi.',
            'alasan_umum.required' => 'Alasan umum usulan penghapusan wajib diisi.',
            'items.required' => 'Pilih minimal satu aset untuk diusulkan penghapusan.',
            'items.min' => 'Pilih minimal satu aset untuk diusulkan penghapusan.',
            'items.*.aset_id.exists' => 'Aset yang dipilih tidak valid.',
            'items.*.alasan.required' => 'Alasan penghapusan per item wajib dipilih.',
        ];
    }
}
