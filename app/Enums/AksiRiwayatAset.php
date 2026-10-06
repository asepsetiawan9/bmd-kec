<?php

declare(strict_types=1);

namespace App\Enums;

enum AksiRiwayatAset: string
{
    case REGISTRASI = 'registrasi';
    case UBAH_DATA = 'ubah_data';
    case MUTASI = 'mutasi';
    case PEMELIHARAAN = 'pemeliharaan';
    case OPNAME = 'opname';
    case USUL_HAPUS = 'usul_hapus';
    case DIHAPUS = 'dihapus';
    case UPLOAD_DOKUMEN = 'upload_dokumen';
    case HAPUS_DOKUMEN = 'hapus_dokumen';

    public function label(): string
    {
        return match ($this) {
            self::REGISTRASI => 'Registrasi Aset',
            self::UBAH_DATA => 'Pembaruan Data Aset',
            self::MUTASI => 'Mutasi / Penempatan Aset',
            self::PEMELIHARAAN => 'Pencatatan Pemeliharaan',
            self::OPNAME => 'Inventarisasi / Sensus Fisik',
            self::USUL_HAPUS => 'Diusulkan Penghapusan',
            self::DIHAPUS => 'Penghapusan Resmi',
            self::UPLOAD_DOKUMEN => 'Unggah Dokumen / Foto',
            self::HAPUS_DOKUMEN => 'Hapus Dokumen',
        };
    }
}
