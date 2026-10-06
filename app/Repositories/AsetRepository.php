<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Enums\GolonganKib;
use App\Enums\KondisiAset;
use App\Enums\StatusAset;
use App\Models\Aset;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class AsetRepository
{
    /**
     * @return LengthAwarePaginator<Aset>
     */
    public function paginate(
        int $perPage = 15,
        ?string $search = null,
        ?KondisiAset $kondisi = null,
        ?GolonganKib $golongan = null,
        ?int $ruanganId = null,
        ?int $tahun = null,
        ?StatusAset $status = null,
        bool $overdueOnly = false
    ): LengthAwarePaginator {
        return Aset::query()
            ->with(['ruangan', 'pemegang', 'refKodeBarang'])
            ->when($search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('nama', 'like', "%{$search}%")
                        ->orWhere('kode_barang', 'like', "%{$search}%")
                        ->orWhere('nomor_register', 'like', "%{$search}%")
                        ->orWhere('merk_type', 'like', "%{$search}%")
                        ->orWhereHas('ruangan', fn ($r) => $r->where('nama', 'like', "%{$search}%"))
                        ->orWhereHas('pemegang', fn ($p) => $p->where('nama', 'like', "%{$search}%"));
                });
            })
            ->when($kondisi, fn ($q) => $q->where('kondisi', $kondisi->value))
            ->when($golongan, fn ($q) => $q->where('golongan', $golongan->value))
            ->when($ruanganId, fn ($q) => $q->where('ruangan_id', $ruanganId))
            ->when($tahun, fn ($q) => $q->where('tahun_perolehan', $tahun))
            ->when($status, fn ($q) => $q->where('status', $status->value))
            ->when($overdueOnly, function ($q) {
                $q->where(function ($sub) {
                    $sub->whereNull('tanggal_verifikasi_fisik')
                        ->orWhere('tanggal_verifikasi_fisik', '<', now()->subDays(90)->toDateString());
                });
            })
            ->latest('id')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function findById(int $id): ?Aset
    {
        return Aset::with([
            'ruangan',
            'pemegang',
            'refKodeBarang',
            'detailTanah',
            'detailPeralatan',
            'detailGedung',
            'detailJalan',
            'detailLainnya',
            'detailKdp',
            'dokumen.uploader',
            'mutasi.dariRuangan',
            'mutasi.keRuangan',
            'mutasi.dariPegawai',
            'mutasi.kePegawai',
            'pemeliharaan',
            'riwayat.user',
        ])->find($id);
    }

    public function findByToken(string $qrToken): ?Aset
    {
        return Aset::with(['ruangan', 'pemegang', 'refKodeBarang'])
            ->where('qr_token', $qrToken)
            ->first();
    }

    public function findByKodeDanRegister(string $kodeBarang, string $nomorRegister): ?Aset
    {
        return Aset::where('kode_barang', $kodeBarang)
            ->where('nomor_register', $nomorRegister)
            ->first();
    }

    /**
     * @param array<string, mixed> $data
     */
    public function create(array $data): Aset
    {
        return Aset::create($data);
    }

    /**
     * @param array<string, mixed> $data
     */
    public function update(Aset $aset, array $data): bool
    {
        return $aset->update($data);
    }

    /**
     * @return Collection<int, Aset>
     */
    public function getRusakBerat(): Collection
    {
        return Aset::where('kondisi', KondisiAset::RUSAK_BERAT->value)->get();
    }

    /**
     * Ringkasan statistik inventarisasi BMD.
     */
    public function getStatistik(): array
    {
        $total = Aset::count();
        $totalNilai = (float) (Aset::sum('nilai_perolehan') ?? 0);
        $baik = Aset::where('kondisi', KondisiAset::BAIK->value)->count();
        $rusakRingan = Aset::where('kondisi', KondisiAset::RUSAK_RINGAN->value)->count();
        $rusakBerat = Aset::where('kondisi', KondisiAset::RUSAK_BERAT->value)->count();
        $overdue = Aset::whereNull('tanggal_verifikasi_fisik')
            ->orWhere('tanggal_verifikasi_fisik', '<', now()->subDays(90)->toDateString())
            ->count();

        return [
            'total' => $total,
            'total_nilai' => $totalNilai,
            'baik' => $baik,
            'rusak_ringan' => $rusakRingan,
            'rusak_berat' => $rusakBerat,
            'overdue' => $overdue,
        ];
    }
}
