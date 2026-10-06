<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\NomorUrut;
use Illuminate\Support\Facades\DB;

class NomorRegistrasiGeneratorService
{
    /**
     * Menghasilkan nomor register urut 6-digit (e.g. 000001, 000002) per kode barang
     * dengan DB transaction dan lockForUpdate untuk mencegah race condition.
     */
    public function generate(string $kodeBarang): string
    {
        return DB::transaction(function () use ($kodeBarang) {
            $key = "register:{$kodeBarang}";

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

            return str_pad((string) $nextVal, 6, '0', STR_PAD_LEFT);
        });
    }
}
