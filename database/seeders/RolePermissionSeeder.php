<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\UserRole;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Permissions map per BMD v3 Matriks Bab 7.3
        $permissions = [
            'master.manage',
            'aset.view',
            'aset.create',
            'aset.update',
            'aset.dokumen.view-sensitive',
            'aset.label.print',
            'mutasi.manage',
            'pemeliharaan.manage',
            'opname.manage',
            'opname.view',
            'penghapusan.create',
            'penghapusan.verify',
            'penghapusan.approve',
            'laporan.view',
            'laporan.export',
            'user.manage',
            'pengaturan.manage',
        ];

        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate(['name' => $permissionName, 'guard_name' => 'web']);
        }

        // Roles mapping per Bab 7.3
        $rolesWithPermissions = [
            UserRole::SUPER_ADMIN->value => $permissions,
            UserRole::PENGURUS_BARANG->value => [
                'master.manage',
                'aset.view',
                'aset.create',
                'aset.update',
                'aset.dokumen.view-sensitive',
                'aset.label.print',
                'mutasi.manage',
                'pemeliharaan.manage',
                'opname.manage',
                'opname.view',
                'penghapusan.create',
                'laporan.view',
                'laporan.export',
            ],
            UserRole::PENATAUSAHA->value => [
                'aset.view',
                'aset.dokumen.view-sensitive',
                'opname.view',
                'penghapusan.verify',
                'laporan.view',
                'laporan.export',
            ],
            UserRole::CAMAT->value => [
                'aset.view',
                'aset.dokumen.view-sensitive',
                'opname.view',
                'penghapusan.approve',
                'laporan.view',
                'laporan.export',
            ],
            UserRole::PEMEGANG->value => [
                'aset.view',
            ],
        ];

        foreach ($rolesWithPermissions as $roleName => $rolePermissions) {
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
            $role->syncPermissions($rolePermissions);
        }
    }
}
