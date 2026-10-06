<?php

declare(strict_types=1);

namespace App\Http\Requests\Aset;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAsetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('aset.update') ?? false;
    }

    public function rules(): array
    {
        $aset = $this->route('aset');
        $golongan = strtoupper((string) ($this->input('golongan', $aset?->golongan?->value ?? '')));

        $rules = [
            'nama' => ['sometimes', 'required', 'string', 'max:255'],
            'merk_type' => ['nullable', 'string', 'max:150'],
            'spesifikasi' => ['nullable', 'string'],
            'nilai_perolehan' => ['sometimes', 'required', 'numeric', 'min:0'],
            'satuan' => ['nullable', 'string', 'max:30'],
            'kondisi' => ['sometimes', 'required', 'string', 'in:baik,rusak_ringan,rusak_berat'],
            'status' => ['nullable', 'string'],
            'ruangan_id' => ['nullable', 'exists:ruangan,id'],
            'pemegang_id' => ['nullable', 'exists:pegawai,id'],
            'keterangan' => ['nullable', 'string'],
            'foto' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:5120'],

            // Common subdetail fields
            'alamat' => ['nullable', 'string'],
            'luas_m2' => ['nullable', 'numeric', 'min:0'],
            'status_tanah' => ['nullable', 'string', 'max:100'],
            'nomor_dokumen' => ['nullable', 'string', 'max:100'],
            'tanggal_dokumen' => ['nullable', 'date'],
        ];

        switch ($golongan) {
            case 'A':
                $rules['status_hak'] = ['nullable', 'string', 'max:100'];
                $rules['nomor_sertifikat'] = ['nullable', 'string', 'max:100'];
                $rules['tanggal_sertifikat'] = ['nullable', 'date'];
                $rules['penggunaan'] = ['nullable', 'string', 'max:150'];
                break;
            case 'B':
                $rules['ukuran_cc'] = ['nullable', 'string', 'max:50'];
                $rules['bahan'] = ['nullable', 'string', 'max:100'];
                $rules['nomor_pabrik'] = ['nullable', 'string', 'max:100'];
                $rules['nomor_rangka'] = ['nullable', 'string', 'max:100'];
                $rules['nomor_mesin'] = ['nullable', 'string', 'max:100'];
                $rules['nomor_polisi'] = ['nullable', 'string', 'max:50'];
                $rules['nomor_bpkb'] = ['nullable', 'string', 'max:100'];
                $rules['tanggal_pajak'] = ['nullable', 'date'];
                break;
            case 'C':
                $rules['kondisi_bangunan'] = ['nullable', 'string', 'max:50'];
                $rules['bertingkat'] = ['nullable', 'boolean'];
                $rules['beton'] = ['nullable', 'boolean'];
                $rules['luas_lantai_m2'] = ['nullable', 'numeric', 'min:0'];
                $rules['luas_tanah_m2'] = ['nullable', 'numeric', 'min:0'];
                $rules['kode_tanah'] = ['nullable', 'string', 'max:50'];
                break;
            case 'D':
                $rules['konstruksi'] = ['nullable', 'string', 'max:100'];
                $rules['panjang_m'] = ['nullable', 'numeric', 'min:0'];
                $rules['lebar_m'] = ['nullable', 'numeric', 'min:0'];
                break;
            case 'E':
                $rules['judul_pencipta'] = ['nullable', 'string', 'max:200'];
                $rules['spesifikasi_buku'] = ['nullable', 'string', 'max:200'];
                $rules['asal_daerah'] = ['nullable', 'string', 'max:100'];
                $rules['pencipta'] = ['nullable', 'string', 'max:150'];
                $rules['bahan'] = ['nullable', 'string', 'max:100'];
                $rules['jenis_hewan_tumbuhan'] = ['nullable', 'string', 'max:150'];
                $rules['ukuran'] = ['nullable', 'string', 'max:100'];
                break;
            case 'F':
                $rules['bangunan'] = ['nullable', 'string', 'max:150'];
                $rules['bertingkat'] = ['nullable', 'boolean'];
                $rules['beton'] = ['nullable', 'boolean'];
                $rules['tanggal_mulai'] = ['nullable', 'date'];
                $rules['nilai_kontrak'] = ['nullable', 'numeric', 'min:0'];
                break;
        }

        return $rules;
    }
}
