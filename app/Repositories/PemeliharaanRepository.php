<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Pemeliharaan;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class PemeliharaanRepository
{
    /**
     * @param array<string, mixed> $filters
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Pemeliharaan::with(['aset.ruangan', 'aset.pemegang', 'pembuat'])
            ->latest('tanggal')
            ->latest('id');

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('uraian', 'like', "%{$search}%")
                    ->orWhere('pelaksana', 'like', "%{$search}%")
                    ->orWhereHas('aset', function ($sub) use ($search) {
                        $sub->where('nama', 'like', "%{$search}%")
                            ->orWhere('kode_barang', 'like', "%{$search}%")
                            ->orWhere('nomor_register', 'like', "%{$search}%");
                    });
            });
        }

        if (! empty($filters['jenis'])) {
            $query->where('jenis', $filters['jenis']);
        }

        if (! empty($filters['tahun'])) {
            $query->whereYear('tanggal', (int) $filters['tahun']);
        }

        if (! empty($filters['aset_id'])) {
            $query->where('aset_id', (int) $filters['aset_id']);
        }

        return $query->paginate($perPage)->withQueryString();
    }

    public function getTotalBiaya(?int $tahun = null): float
    {
        $query = Pemeliharaan::query();
        if ($tahun) {
            $query->whereYear('tanggal', $tahun);
        }

        return (float) $query->sum('biaya');
    }

    /**
     * @return Collection<int, Pemeliharaan>
     */
    public function getByAsetId(int $asetId): Collection
    {
        return Pemeliharaan::with('pembuat')
            ->where('aset_id', $asetId)
            ->latest('tanggal')
            ->get();
    }
}
