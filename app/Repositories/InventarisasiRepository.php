<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Enums\StatusInventarisasi;
use App\Models\Inventarisasi;
use App\Models\InventarisasiItem;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class InventarisasiRepository
{
    /**
     * @param array<string, mixed> $filters
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Inventarisasi::with(['ruanganScope', 'pembuat'])
            ->withCount('items')
            ->latest('id');

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['search'])) {
            $query->where('nama', 'like', "%{$filters['search']}%");
        }

        return $query->paginate($perPage)->withQueryString();
    }

    public function getActiveSession(): ?Inventarisasi
    {
        return Inventarisasi::with(['ruanganScope', 'pembuat'])
            ->where('status', StatusInventarisasi::BERJALAN)
            ->first();
    }

    public function findById(int $id): ?Inventarisasi
    {
        return Inventarisasi::with(['ruanganScope', 'pembuat'])
            ->find($id);
    }

    /**
     * @param array<string, mixed> $filters
     */
    public function getItems(int $inventarisasiId, array $filters = [], int $perPage = 25): LengthAwarePaginator
    {
        $query = InventarisasiItem::with(['aset.ruangan', 'aset.pemegang', 'ruanganTemuan', 'pemeriksa'])
            ->where('inventarisasi_id', $inventarisasiId);

        if (! empty($filters['hasil'])) {
            $query->where('hasil', $filters['hasil']);
        }

        if (! empty($filters['ruangan_id'])) {
            $query->whereHas('aset', function ($q) use ($filters) {
                $q->where('ruangan_id', $filters['ruangan_id']);
            });
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('aset', function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                    ->orWhere('kode_barang', 'like', "%{$search}%")
                    ->orWhere('nomor_register', 'like', "%{$search}%")
                    ->orWhere('qr_token', $search);
            });
        }

        return $query->paginate($perPage)->withQueryString();
    }

    /**
     * Menghitung ringkasan statistik progres inventarisasi.
     *
     * @return array<string, int|float>
     */
    public function getProgress(int $inventarisasiId): array
    {
        $total = InventarisasiItem::where('inventarisasi_id', $inventarisasiId)->count();
        $ditemukan = InventarisasiItem::where('inventarisasi_id', $inventarisasiId)->where('hasil', 'ditemukan')->count();
        $tidakDitemukan = InventarisasiItem::where('inventarisasi_id', $inventarisasiId)->where('hasil', 'tidak_ditemukan')->count();
        $belumDicek = InventarisasiItem::where('inventarisasi_id', $inventarisasiId)->where('hasil', 'belum_dicek')->count();
        $sudahDicek = $ditemukan + $tidakDitemukan;
        $persentase = $total > 0 ? round(($sudahDicek / $total) * 100, 1) : 0.0;

        return [
            'total' => $total,
            'sudah_dicek' => $sudahDicek,
            'belum_dicek' => $belumDicek,
            'ditemukan' => $ditemukan,
            'tidak_ditemukan' => $tidakDitemukan,
            'persentase' => $persentase,
        ];
    }
}
