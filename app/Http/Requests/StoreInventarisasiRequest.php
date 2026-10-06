<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInventarisasiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('opname.manage') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'nama' => ['required', 'string', 'max:150'],
            'tanggal_mulai' => ['required', 'date'],
            'ruangan_scope' => ['nullable', 'integer', 'exists:ruangan,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nama.required' => 'Nama sesi inventarisasi wajib diisi (misal: Sensus Semester II 2026).',
            'tanggal_mulai.required' => 'Tanggal mulai inventarisasi wajib diisi.',
            'ruangan_scope.exists' => 'Ruangan yang dipilih tidak valid.',
        ];
    }
}
