<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\MutasiAset;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class MutasiAsetRepository
{
    /**
     * Mengambil daftar mutasi dengan filter pencarian dan paginasi.
     *
     * @param array<string, mixed> $filters
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = MutasiAset::with([
            'aset.ruangan',
            'aset.pemegang',
            'dariRuangan',
            'keRuangan',
            'dariPegawai',
            'kePegawai',
            'pembuat',
        ])->latest('id');

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('nomor_bast', 'like', "%{$search}%")
                    ->orWhereHas('aset', function ($sub) use ($search) {
                        $sub->where('nama', 'like', "%{$search}%")
                            ->orWhere('kode_barang', 'like', "%{$search}%")
                            ->orWhere('nomor_register', 'like', "%{$search}%");
                    });
            });
        }

        if (! empty($filters['nomor_bast'])) {
            $query->where('nomor_bast', $filters['nomor_bast']);
        }

        if (! empty($filters['jenis'])) {
            $query->where('jenis', $filters['jenis']);
        }

        if (! empty($filters['ruangan_id'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('ke_ruangan_id', $filters['ruangan_id'])
                    ->orWhere('dari_ruangan_id', $filters['ruangan_id']);
            });
        }

        return $query->paginate($perPage)->withQueryString();
    }

    /**
     * Mengambil seluruh record mutasi berdasarkan nomor BAST.
     *
     * @return Collection<int, MutasiAset>
     */
    public function getByNomorBast(string $nomorBast): Collection
    {
        return MutasiAset::with([
            'aset.ruangan',
            'aset.pemegang',
            'dariRuangan',
            'keRuangan',
            'dariPegawai',
            'kePegawai',
            'pembuat',
        ])
            ->where('nomor_bast', $nomorBast)
            ->get();
    }

    public function findById(int $id): ?MutasiAset
    {
        return MutasiAset::with([
            'aset.ruangan',
            'aset.pemegang',
            'dariRuangan',
            'keRuangan',
            'dariPegawai',
            'kePegawai',
            'pembuat',
        ])->find($id);
    }
}
