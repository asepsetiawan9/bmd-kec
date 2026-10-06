<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Pegawai;
use Illuminate\Database\Seeder;

class PegawaiSeeder extends Seeder
{
    public function run(): void
    {
        $pegawaiList = [
            [
                'nip' => '197508121998031002',
                'nama' => 'Drs. H. Asep Mulyana, M.Si.',
                'jabatan' => 'Camat Mekarmukti',
                'unit_kerja' => 'Pimpinan Wilayah Kecamatan',
                'no_hp' => '081223344550',
                'is_active' => true,
            ],
            [
                'nip' => '198004152005011008',
                'nama' => 'Agus Herdiana, S.IP.',
                'jabatan' => 'Sekretaris Kecamatan',
                'unit_kerja' => 'Sekretariat Kecamatan',
                'no_hp' => '081223344551',
                'is_active' => true,
            ],
            [
                'nip' => '199203112015031002',
                'nama' => 'Rendi Pratama, A.Md.',
                'jabatan' => 'Pengurus Barang Pengguna',
                'unit_kerja' => 'Subbag Umum dan Kepegawaian',
                'no_hp' => '081223344552',
                'is_active' => true,
            ],
            [
                'nip' => '198205142006042011',
                'nama' => 'Siti Fatimah, S.E.',
                'jabatan' => 'Kasubag Perencanaan dan Keuangan',
                'unit_kerja' => 'Subbag Keuangan dan Program',
                'no_hp' => '081223344553',
                'is_active' => true,
            ],
            [
                'nip' => '197806122002121004',
                'nama' => 'Hendra Gunawan, S.Sos.',
                'jabatan' => 'Kasi Pemerintahan',
                'unit_kerja' => 'Seksi Pemerintahan',
                'no_hp' => '081223344554',
                'is_active' => true,
            ],
            [
                'nip' => '198101052007011006',
                'nama' => 'Dedi Supriadi, S.AP.',
                'jabatan' => 'Kasi Ketenteraman dan Ketertiban',
                'unit_kerja' => 'Seksi Trantib',
                'no_hp' => '081223344555',
                'is_active' => true,
            ],
        ];

        foreach ($pegawaiList as $item) {
            Pegawai::updateOrCreate(
                ['nip' => $item['nip']],
                $item
            );
        }
    }
}
