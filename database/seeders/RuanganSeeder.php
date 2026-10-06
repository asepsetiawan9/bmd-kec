<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Pegawai;
use App\Models\Ruangan;
use Illuminate\Database\Seeder;

class RuanganSeeder extends Seeder
{
    public function run(): void
    {
        $camat = Pegawai::where('jabatan', 'like', '%Camat%')->first();
        $sekcam = Pegawai::where('jabatan', 'like', '%Sekretaris%')->first();
        $pengurus = Pegawai::where('jabatan', 'like', '%Pengurus Barang%')->first();
        $kasiPem = Pegawai::where('jabatan', 'like', '%Pemerintahan%')->first();

        $ruanganList = [
            [
                'kode' => 'R-01',
                'nama' => 'Ruang Kerja Camat',
                'gedung' => 'Gedung Utama',
                'lantai' => 'Lantai 2',
                'penanggung_jawab_id' => $camat?->id,
                'keterangan' => 'Ruang kerja pimpinan camat dan ruang tamu dinas',
                'is_active' => true,
            ],
            [
                'kode' => 'R-02',
                'nama' => 'Ruang Kerja Sekcam',
                'gedung' => 'Gedung Utama',
                'lantai' => 'Lantai 2',
                'penanggung_jawab_id' => $sekcam?->id,
                'keterangan' => 'Ruang kerja Sekretaris Kecamatan',
                'is_active' => true,
            ],
            [
                'kode' => 'R-03',
                'nama' => 'Subbag Umum & Kepegawaian',
                'gedung' => 'Gedung Utama',
                'lantai' => 'Lantai 1',
                'penanggung_jawab_id' => $pengurus?->id,
                'keterangan' => 'Ruang kerja pengelolaan surat, kepegawaian dan inventaris BMD',
                'is_active' => true,
            ],
            [
                'kode' => 'R-04',
                'nama' => 'Subbag Keuangan & Program',
                'gedung' => 'Gedung Utama',
                'lantai' => 'Lantai 1',
                'penanggung_jawab_id' => null,
                'keterangan' => 'Ruang pengelolaan perencanaan anggaran dan pembukuan',
                'is_active' => true,
            ],
            [
                'kode' => 'R-05',
                'nama' => 'Seksi Pemerintahan',
                'gedung' => 'Gedung Utama',
                'lantai' => 'Lantai 1',
                'penanggung_jawab_id' => $kasiPem?->id,
                'keterangan' => 'Ruang kerja staf Seksi Pemerintahan',
                'is_active' => true,
            ],
            [
                'kode' => 'R-06',
                'nama' => 'Seksi Ketenteraman & Ketertiban',
                'gedung' => 'Gedung Pelayanan',
                'lantai' => 'Lantai 1',
                'penanggung_jawab_id' => null,
                'keterangan' => 'Ruang Satpol PP / Trantib',
                'is_active' => true,
            ],
            [
                'kode' => 'R-07',
                'nama' => 'Ruang Pelayanan Terpadu (PATEN)',
                'gedung' => 'Gedung Pelayanan',
                'lantai' => 'Lantai 1',
                'penanggung_jawab_id' => null,
                'keterangan' => 'Loket pelayanan publik administrasi kependudukan dan perizinan',
                'is_active' => true,
            ],
            [
                'kode' => 'R-08',
                'nama' => 'Aula Pertemuan Kecamatan',
                'gedung' => 'Gedung Pertemuan',
                'lantai' => 'Lantai 1',
                'penanggung_jawab_id' => $pengurus?->id,
                'keterangan' => 'Aula serbaguna pertemuan rapat dinas dan musrenbang',
                'is_active' => true,
            ],
            [
                'kode' => 'R-09',
                'nama' => 'Gudang Inventaris & Arsip',
                'gedung' => 'Gedung Utama',
                'lantai' => 'Lantai 1',
                'penanggung_jawab_id' => $pengurus?->id,
                'keterangan' => 'Penyimpanan barang cadangan dan berkas arsip',
                'is_active' => true,
            ],
        ];

        foreach ($ruanganList as $item) {
            Ruangan::updateOrCreate(
                ['kode' => $item['kode']],
                $item
            );
        }
    }
}
