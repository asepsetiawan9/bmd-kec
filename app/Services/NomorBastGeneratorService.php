<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\NomorUrut;
use Illuminate\Support\Facades\DB;

class NomorBastGeneratorService
{
    /**
     * Menghasilkan nomor BAST resmi:
     * Format: {URUT_3DIGIT}/BAST-BMD/KEC-MKM/{BULAN_ROMAWI}/{TAHUN}
     */
    public function generate(?int $tahun = null, ?int $bulan = null): string
    {
        $tahun = $tahun ?? (int) date('Y');
        $bulan = $bulan ?? (int) date('n');

        return DB::transaction(function () use ($tahun, $bulan) {
            $key = "bast:{$tahun}";

            $counter = NomorUrut::where('kunci', $key)->lockForUpdate()->first();

            if (! $counter) {
                $counter = NomorUrut::create([
                    'kunci' => $key,
                    'nilai_terakhir' => 1,
                    'updated_at' => now(),
                ]);
                $nextVal = 1;
            } else {
                $nextVal = $counter->nilai_terakhir + 1;
                $counter->update([
                    'nilai_terakhir' => $nextVal,
                    'updated_at' => now(),
                ]);
            }

            $urut = str_pad((string) $nextVal, 3, '0', STR_PAD_LEFT);
            $romawi = $this->bulanRomawi($bulan);

            return "{$urut}/BAST-BMD/KEC-MKM/{$romawi}/{$tahun}";
        });
    }

    private function bulanRomawi(int $bulan): string
    {
        $map = [
            1 => 'I', 2 => 'II', 3 => 'III', 4 => 'IV',
            5 => 'V', 6 => 'VI', 7 => 'VII', 8 => 'VIII',
            9 => 'IX', 10 => 'X', 11 => 'XI', 12 => 'XII',
        ];

        return $map[$bulan] ?? 'I';
    }
}
