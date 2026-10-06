<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database for SIMUKTI (BMD Mekarmukti).
     */
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            PengaturanSeeder::class,
            PegawaiSeeder::class,
            UserSeeder::class,
            RuanganSeeder::class,
            KodeBarangSeeder::class,
            AsetSeeder::class,
        ]);
    }
}
