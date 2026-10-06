<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\RefKodeBarang;
use Illuminate\Database\Eloquent\Collection;

class KodeBarangRepository
{
    public function search(string $keyword, int $limit = 20): Collection
    {
        return RefKodeBarang::query()
            ->where(function ($q) use ($keyword) {
                $q->where('kode', 'like', "%{$keyword}%")
                    ->orWhere('uraian', 'like', "%{$keyword}%");
            })
            ->selectable()
            ->orderBy('kode')
            ->limit($limit)
            ->get();
    }

    public function findByKode(string $kode): ?RefKodeBarang
    {
        return RefKodeBarang::where('kode', $kode)->first();
    }

    public function getByGolongan(string $golongan): Collection
    {
        return RefKodeBarang::where('golongan_kib', $golongan)
            ->selectable()
            ->orderBy('kode')
            ->get();
    }
}
