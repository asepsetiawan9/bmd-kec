<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Enums\StatusUsulanPenghapusan;
use App\Models\UsulanPenghapusan;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class UsulanPenghapusanRepository
{
    /**
     * @param array<string, mixed> $filters
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = UsulanPenghapusan::with(['pembuat', 'verifikator', 'penyetuju'])
            ->withCount('items')
            ->latest('id');

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('nomor', 'like', "%{$search}%")
                    ->orWhere('alasan_umum', 'like', "%{$search}%");
            });
        }

        return $query->paginate($perPage)->withQueryString();
    }

    public function findByIdWithItems(int $id): ?UsulanPenghapusan
    {
        return UsulanPenghapusan::with([
            'pembuat.pegawai',
            'verifikator.pegawai',
            'penyetuju.pegawai',
            'items.aset.ruangan',
            'items.aset.pemegang',
        ])->find($id);
    }

    public function getPendingSekcamCount(): int
    {
        return UsulanPenghapusan::where('status', StatusUsulanPenghapusan::DIAJUKAN)->count();
    }

    public function getPendingCamatCount(): int
    {
        return UsulanPenghapusan::where('status', StatusUsulanPenghapusan::DIVERIFIKASI)->count();
    }

    public function getDikembalikanCount(): int
    {
        return UsulanPenghapusan::whereIn('status', [
            StatusUsulanPenghapusan::DIKEMBALIKAN_PENATAUSAHA,
            StatusUsulanPenghapusan::DIKEMBALIKAN_CAMAT,
        ])->count();
    }
}
