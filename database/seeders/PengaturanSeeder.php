<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Pengaturan;
use Illuminate\Database\Seeder;

class PengaturanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            [
                'key' => 'nama_instansi',
                'value' => 'Pemerintah Kecamatan Mekarmukti',
                'keterangan' => 'Nama Instansi Pengguna Sistem',
            ],
            [
                'key' => 'nama_kecamatan',
                'value' => 'Mekarmukti',
                'keterangan' => 'Nama Wilayah Kecamatan',
            ],
            [
                'key' => 'kabupaten',
                'value' => 'Kabupaten Garut',
                'keterangan' => 'Kabupaten Wilayah Kerja',
            ],
            [
                'key' => 'provinsi',
                'value' => 'Jawa Barat',
                'keterangan' => 'Provinsi Wilayah Kerja',
            ],
            [
                'key' => 'alamat_kantor',
                'value' => 'Jl. Raya Mekarmukti, Kec. Mekarmukti, Kab. Garut, Jawa Barat 44165',
                'keterangan' => 'Alamat Resmi Kantor Kecamatan Mekarmukti',
            ],
            [
                'key' => 'kode_lokasi',
                'value' => '12.05.24.01',
                'keterangan' => 'Kode Lokasi Wilayah SKPD',
            ],
            [
                'key' => 'kode_upb',
                'value' => '01.01.24.01',
                'keterangan' => 'Kode Unit Pengguna Barang (UPB)',
            ],
            [
                'key' => 'nama_camat',
                'value' => 'Drs. H. Asep Mulyana, M.Si.',
                'keterangan' => 'Nama Camat / Pengguna Barang',
            ],
            [
                'key' => 'nip_camat',
                'value' => '197508121998031002',
                'keterangan' => 'NIP Camat Mekarmukti',
            ],
            [
                'key' => 'nama_sekcam',
                'value' => 'Agus Herdiana, S.IP.',
                'keterangan' => 'Nama Sekretaris Kecamatan / Pejabat Penatausahaan',
            ],
            [
                'key' => 'nip_sekcam',
                'value' => '198004152005011008',
                'keterangan' => 'NIP Sekcam Mekarmukti',
            ],
            [
                'key' => 'nama_pengurus_barang',
                'value' => 'Rendi Pratama, A.Md.',
                'keterangan' => 'Nama Pengurus Barang Pengguna',
            ],
            [
                'key' => 'nip_pengurus_barang',
                'value' => '199203112015031002',
                'keterangan' => 'NIP Pengurus Barang',
            ],
            [
                'key' => 'tahun_aktif',
                'value' => '2026',
                'keterangan' => 'Tahun Anggaran Berjalan Aktif',
            ],
            [
                'key' => 'tahun_anggaran_aktif',
                'value' => '2026',
                'keterangan' => 'Tahun Anggaran Berjalan Aktif (Alias)',
            ],
            [
                'key' => 'app_name',
                'value' => 'SIMUKTI',
                'keterangan' => 'Nama Resmi Sistem Informasi',
            ],
        ];

        foreach ($settings as $setting) {
            Pengaturan::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
