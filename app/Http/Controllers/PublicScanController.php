<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Aset;
use App\Models\Pengaturan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicScanController extends Controller
{
    public function show(string $token): Response
    {
        $aset = Aset::with(['ruangan', 'pemegang', 'refKodeBarang'])
            ->where('qr_token', $token)
            ->firstOrFail();

        $instansi = Pengaturan::get('nama_instansi', 'Kecamatan Mekarmukti');
        $kabupaten = Pengaturan::get('kabupaten', 'Kabupaten Garut');

        return Inertia::render('Public/AsetScanInfo', [
            'aset' => [
                'nama' => $aset->nama,
                'kode_barang' => $aset->kode_barang,
                'nomor_register' => $aset->nomor_register,
                'golongan' => $aset->golongan instanceof \BackedEnum ? $aset->golongan->value : (string) $aset->golongan,
                'golongan_label' => $aset->golongan?->label() ?? '-',
                'kondisi' => $aset->kondisi instanceof \BackedEnum ? $aset->kondisi->value : (string) $aset->kondisi,
                'tahun_perolehan' => $aset->tahun_perolehan,
                'ruangan' => $aset->ruangan?->nama ?? 'Belum ditentukan',
                'pemegang' => $aset->pemegang?->nama ?? 'Umum / Tidak tercatat',
                'foto_url' => $aset->foto_path ? asset('storage/' . $aset->foto_path) : null,
                'keterangan' => $aset->keterangan,
            ],
            'instansi' => $instansi,
            'kabupaten' => $kabupaten,
        ]);
    }
}
