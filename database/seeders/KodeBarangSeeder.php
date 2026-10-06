<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\GolonganKib;
use App\Models\RefKodeBarang;
use Illuminate\Database\Seeder;

class KodeBarangSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            // Golongan A: Tanah
            [
                'kode' => '1.3.1.01.01.01.001',
                'uraian' => 'Tanah Bangunan Kantor Pemerintah',
                'level' => 7,
                'golongan_kib' => GolonganKib::A,
                'masa_manfaat' => null,
                'is_selectable' => true,
            ],
            [
                'kode' => '1.3.1.01.01.01.005',
                'uraian' => 'Tanah Sarana Olahraga / Fasilitas Umum',
                'level' => 7,
                'golongan_kib' => GolonganKib::A,
                'masa_manfaat' => null,
                'is_selectable' => true,
            ],

            // Golongan B: Peralatan dan Mesin
            [
                'kode' => '1.3.2.01.01.01.001',
                'uraian' => 'Sepeda Motor Roda Dua',
                'level' => 7,
                'golongan_kib' => GolonganKib::B,
                'masa_manfaat' => 7,
                'is_selectable' => true,
            ],
            [
                'kode' => '1.3.2.01.01.02.001',
                'uraian' => 'Mobil Dinas Operasional / Penumpang',
                'level' => 7,
                'golongan_kib' => GolonganKib::B,
                'masa_manfaat' => 8,
                'is_selectable' => true,
            ],
            [
                'kode' => '1.3.2.05.01.01.001',
                'uraian' => 'Meja Kerja Pejabat / Pegawai',
                'level' => 7,
                'golongan_kib' => GolonganKib::B,
                'masa_manfaat' => 5,
                'is_selectable' => true,
            ],
            [
                'kode' => '1.3.2.05.01.02.001',
                'uraian' => 'Kursi Kerja / Rapat',
                'level' => 7,
                'golongan_kib' => GolonganKib::B,
                'masa_manfaat' => 5,
                'is_selectable' => true,
            ],
            [
                'kode' => '1.3.2.05.01.04.001',
                'uraian' => 'Lemari Arsip Besi / Filing Cabinet',
                'level' => 7,
                'golongan_kib' => GolonganKib::B,
                'masa_manfaat' => 10,
                'is_selectable' => true,
            ],
            [
                'kode' => '1.3.2.05.02.01.001',
                'uraian' => 'Air Conditioner (AC Split)',
                'level' => 7,
                'golongan_kib' => GolonganKib::B,
                'masa_manfaat' => 5,
                'is_selectable' => true,
            ],
            [
                'kode' => '1.3.2.10.01.01.001',
                'uraian' => 'Personal Computer (PC Desktop)',
                'level' => 7,
                'golongan_kib' => GolonganKib::B,
                'masa_manfaat' => 4,
                'is_selectable' => true,
            ],
            [
                'kode' => '1.3.2.10.01.02.001',
                'uraian' => 'Laptop / Notebook',
                'level' => 7,
                'golongan_kib' => GolonganKib::B,
                'masa_manfaat' => 4,
                'is_selectable' => true,
            ],
            [
                'kode' => '1.3.2.10.02.01.001',
                'uraian' => 'Printer Laser / Inkjet / Multifungsi',
                'level' => 7,
                'golongan_kib' => GolonganKib::B,
                'masa_manfaat' => 4,
                'is_selectable' => true,
            ],
            [
                'kode' => '1.3.2.03.01.01.001',
                'uraian' => 'Genset Pembangkit Listrik Darurat',
                'level' => 7,
                'golongan_kib' => GolonganKib::B,
                'masa_manfaat' => 10,
                'is_selectable' => true,
            ],

            // Golongan C: Gedung dan Bangunan
            [
                'kode' => '1.3.3.01.01.01.001',
                'uraian' => 'Bangunan Gedung Kantor Utama Kecamatan',
                'level' => 7,
                'golongan_kib' => GolonganKib::C,
                'masa_manfaat' => 50,
                'is_selectable' => true,
            ],
            [
                'kode' => '1.3.3.01.01.02.001',
                'uraian' => 'Bangunan Aula / Balai Pertemuan Warga',
                'level' => 7,
                'golongan_kib' => GolonganKib::C,
                'masa_manfaat' => 50,
                'is_selectable' => true,
            ],

            // Golongan D: Jalan, Irigasi dan Jaringan
            [
                'kode' => '1.3.4.01.01.01.001',
                'uraian' => 'Jalan Lingkungan Kompleks Perkantoran',
                'level' => 7,
                'golongan_kib' => GolonganKib::D,
                'masa_manfaat' => 10,
                'is_selectable' => true,
            ],
            [
                'kode' => '1.3.4.03.01.02.001',
                'uraian' => 'Jaringan Komputer / Local Area Network (LAN)',
                'level' => 7,
                'golongan_kib' => GolonganKib::D,
                'masa_manfaat' => 5,
                'is_selectable' => true,
            ],

            // Golongan E: Aset Tetap Lainnya
            [
                'kode' => '1.3.5.01.01.01.001',
                'uraian' => 'Buku Referensi Kedinasan / Dokumen Peraturan',
                'level' => 7,
                'golongan_kib' => GolonganKib::E,
                'masa_manfaat' => 5,
                'is_selectable' => true,
            ],

            // Golongan F: KDP
            [
                'kode' => '1.3.6.01.01.01.001',
                'uraian' => 'Konstruksi Gedung Kantor Dalam Pengerjaan',
                'level' => 7,
                'golongan_kib' => GolonganKib::F,
                'masa_manfaat' => null,
                'is_selectable' => true,
            ],
        ];

        foreach ($items as $item) {
            RefKodeBarang::updateOrCreate(
                ['kode' => $item['kode']],
                $item
            );
        }
    }
}
