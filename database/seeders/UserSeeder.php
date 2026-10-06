<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Pegawai;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $camatPegawai = Pegawai::where('jabatan', 'like', '%Camat%')->first();
        $sekcamPegawai = Pegawai::where('jabatan', 'like', '%Sekretaris%')->first();
        $pengurusPegawai = Pegawai::where('jabatan', 'like', '%Pengurus Barang%')->first();
        $kasiPegawai = Pegawai::where('jabatan', 'like', '%Pemerintahan%')->first();

        $accounts = [
            [
                'name' => 'Super Administrator',
                'email' => 'superadmin@simukti.test',
                'role' => UserRole::SUPER_ADMIN,
                'pegawai_id' => null,
                'nip' => '198001011999011000',
                'jabatan' => 'Administrator Sistem BMD',
                'no_hp' => '081200000001',
            ],
            [
                'name' => 'Rendi Pratama, A.Md.',
                'email' => 'pengurus.barang@simukti.test',
                'role' => UserRole::PENGURUS_BARANG,
                'pegawai_id' => $pengurusPegawai?->id,
                'nip' => '199203112015031002',
                'jabatan' => 'Pengurus Barang Pengguna',
                'no_hp' => '081223344552',
            ],
            [
                'name' => 'Agus Herdiana, S.IP.',
                'email' => 'sekcam@simukti.test',
                'role' => UserRole::PENATAUSAHA,
                'pegawai_id' => $sekcamPegawai?->id,
                'nip' => '198004152005011008',
                'jabatan' => 'Sekretaris Kecamatan (Penatausahaan)',
                'no_hp' => '081223344551',
            ],
            [
                'name' => 'Drs. H. Asep Mulyana, M.Si.',
                'email' => 'camat@simukti.test',
                'role' => UserRole::CAMAT,
                'pegawai_id' => $camatPegawai?->id,
                'nip' => '197508121998031002',
                'jabatan' => 'Camat Mekarmukti (Pengguna Barang)',
                'no_hp' => '081223344550',
            ],
            [
                'name' => 'Hendra Gunawan, S.Sos.',
                'email' => 'pegawai@simukti.test',
                'role' => UserRole::PEMEGANG,
                'pegawai_id' => $kasiPegawai?->id,
                'nip' => '197806122002121004',
                'jabatan' => 'Kasi Pemerintahan / Pemegang Barang',
                'no_hp' => '081223344554',
            ],
        ];

        foreach ($accounts as $acc) {
            $user = User::updateOrCreate(
                ['email' => $acc['email']],
                [
                    'name' => $acc['name'],
                    'password' => Hash::make('password'),
                    'role' => $acc['role'],
                    'pegawai_id' => $acc['pegawai_id'],
                    'nip' => $acc['nip'],
                    'jabatan' => $acc['jabatan'],
                    'no_hp' => $acc['no_hp'],
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            );

            // Sync Spatie role
            $user->syncRoles([$acc['role']->value]);

            // Link user_id back to Pegawai if applicable
            if ($acc['pegawai_id']) {
                Pegawai::where('id', $acc['pegawai_id'])->update(['user_id' => $user->id]);
            }
        }
    }
}
