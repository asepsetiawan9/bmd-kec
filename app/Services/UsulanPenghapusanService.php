<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\AksiRiwayatAset;
use App\Enums\StatusAset;
use App\Enums\StatusUsulanPenghapusan;
use App\Models\Aset;
use App\Models\NomorUrut;
use App\Models\UsulanPenghapusan;
use App\Models\UsulanPenghapusanItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UsulanPenghapusanService
{
    public function __construct(
        protected RiwayatAsetService $riwayatAsetService
    ) {}

    /**
     * Membuat draft usulan penghapusan baru.
     *
     * @param array<string, mixed> $data
     * @throws ValidationException
     */
    public function createUsulan(array $data, User $actor): UsulanPenghapusan
    {
        $asetIds = array_column($data['items'], 'aset_id');

        // BR-HPS-02: Satu aset hanya boleh ada di satu usulan aktif
        $conflictAset = UsulanPenghapusanItem::whereIn('aset_id', $asetIds)
            ->whereHas('usulan', function ($q) {
                $q->whereNotIn('status', [
                    StatusUsulanPenghapusan::SELESAI,
                    StatusUsulanPenghapusan::DIKEMBALIKAN_PENATAUSAHA,
                    StatusUsulanPenghapusan::DIKEMBALIKAN_CAMAT,
                ]);
            })
            ->with('aset')
            ->first();

        if ($conflictAset) {
            throw ValidationException::withMessages([
                'items' => "Aset '{$conflictAset->aset->nama}' sedang dalam proses usulan penghapusan aktif lain.",
            ]);
        }

        $tahun = (int) date('Y');

        return DB::transaction(function () use ($data, $actor, $tahun) {
            // Counter nomor usulan
            $key = "usulan:{$tahun}";
            $counter = NomorUrut::where('kunci', $key)->lockForUpdate()->first();
            if (! $counter) {
                $counter = NomorUrut::create(['kunci' => $key, 'nilai_terakhir' => 1]);
                $nextVal = 1;
            } else {
                $nextVal = $counter->nilai_terakhir + 1;
                $counter->update(['nilai_terakhir' => $nextVal]);
            }
            $nomor = sprintf('USL-BMD/%d/%03d', $tahun, $nextVal);

            $usulan = UsulanPenghapusan::create([
                'nomor' => $nomor,
                'tanggal' => $data['tanggal'] ?? date('Y-m-d'),
                'alasan_umum' => $data['alasan_umum'],
                'status' => StatusUsulanPenghapusan::DRAFT,
                'dibuat_oleh' => $actor->id,
            ]);

            foreach ($data['items'] as $itemData) {
                UsulanPenghapusanItem::create([
                    'usulan_id' => $usulan->id,
                    'aset_id' => (int) $itemData['aset_id'],
                    'alasan' => $itemData['alasan'] ?? 'rusak_berat',
                    'keterangan' => $itemData['keterangan'] ?? null,
                ]);
            }

            return $usulan;
        });
    }

    /**
     * Pengurus barang mengajukan usulan penghapusan ke Sekcam.
     * Mengunci seluruh aset ke status diusulkan_hapus (freeze).
     */
    public function ajukan(int $id, User $actor): UsulanPenghapusan
    {
        $usulan = UsulanPenghapusan::with('items.aset')->findOrFail($id);

        if (! in_array($usulan->status, [
            StatusUsulanPenghapusan::DRAFT,
            StatusUsulanPenghapusan::DIKEMBALIKAN_PENATAUSAHA,
            StatusUsulanPenghapusan::DIKEMBALIKAN_CAMAT,
        ], true)) {
            throw ValidationException::withMessages([
                'status' => 'Hanya usulan draft atau yang dikembalikan yang dapat diajukan.',
            ]);
        }

        return DB::transaction(function () use ($usulan, $actor) {
            $usulan->update([
                'status' => StatusUsulanPenghapusan::DIAJUKAN,
                'diajukan_pada' => now(),
            ]);

            // Kunci aset ke status diusulkan_hapus
            foreach ($usulan->items as $item) {
                $item->aset?->update(['status' => StatusAset::DIUSULKAN_HAPUS]);

                $this->riwayatAsetService->catat(
                    asetId: $item->aset_id,
                    aksi: AksiRiwayatAset::USUL_HAPUS,
                    keterangan: "Diusulkan penghapusan ke Sekcam (Nomor Usulan: {$usulan->nomor}). Alasan: {$item->alasan}",
                    referensiType: UsulanPenghapusan::class,
                    referensiId: $usulan->id,
                    userId: $actor->id
                );
            }

            return $usulan->fresh();
        });
    }

    /**
     * Sekcam (Penatausaha) memverifikasi usulan penghapusan.
     */
    public function verifikasiSekcam(int $id, User $actor): UsulanPenghapusan
    {
        $usulan = UsulanPenghapusan::findOrFail($id);

        if ($usulan->status !== StatusUsulanPenghapusan::DIAJUKAN) {
            throw ValidationException::withMessages([
                'status' => 'Hanya usulan dengan status Diajukan yang dapat diverifikasi oleh Sekcam.',
            ]);
        }

        $usulan->update([
            'status' => StatusUsulanPenghapusan::DIVERIFIKASI,
            'diverifikasi_pada' => now(),
            'diverifikasi_oleh' => $actor->id,
        ]);

        return $usulan;
    }

    /**
     * Sekcam (Penatausaha) mengembalikan usulan dengan catatan revisi wajib.
     */
    public function kembalikanSekcam(int $id, string $catatan, User $actor): UsulanPenghapusan
    {
        if (mb_strlen(trim($catatan)) < 10) {
            throw ValidationException::withMessages([
                'catatan' => 'Catatan pengembalian wajib diisi minimal 10 karakter.',
            ]);
        }

        $usulan = UsulanPenghapusan::with('items.aset')->findOrFail($id);

        if ($usulan->status !== StatusUsulanPenghapusan::DIAJUKAN) {
            throw ValidationException::withMessages([
                'status' => 'Hanya usulan dengan status Diajukan yang dapat dikembalikan.',
            ]);
        }

        return DB::transaction(function () use ($usulan, $catatan) {
            $usulan->update([
                'status' => StatusUsulanPenghapusan::DIKEMBALIKAN_PENATAUSAHA,
                'catatan_penatausaha' => $catatan,
            ]);

            // Pulihkan status aset ke aktif
            foreach ($usulan->items as $item) {
                $item->aset?->update(['status' => StatusAset::AKTIF]);
            }

            return $usulan->fresh();
        });
    }

    /**
     * Camat menyetujui usulan penghapusan.
     */
    public function setujuiCamat(int $id, User $actor): UsulanPenghapusan
    {
        $usulan = UsulanPenghapusan::findOrFail($id);

        if ($usulan->status !== StatusUsulanPenghapusan::DIVERIFIKASI) {
            throw ValidationException::withMessages([
                'status' => 'Hanya usulan yang telah diverifikasi Sekcam yang dapat disetujui Camat.',
            ]);
        }

        $usulan->update([
            'status' => StatusUsulanPenghapusan::DISETUJUI,
            'disetujui_pada' => now(),
            'disetujui_oleh' => $actor->id,
        ]);

        return $usulan;
    }

    /**
     * Camat mengembalikan usulan dengan catatan revisi wajib.
     */
    public function kembalikanCamat(int $id, string $catatan, User $actor): UsulanPenghapusan
    {
        if (mb_strlen(trim($catatan)) < 10) {
            throw ValidationException::withMessages([
                'catatan' => 'Catatan pengembalian wajib diisi minimal 10 karakter.',
            ]);
        }

        $usulan = UsulanPenghapusan::with('items.aset')->findOrFail($id);

        if ($usulan->status !== StatusUsulanPenghapusan::DIVERIFIKASI) {
            throw ValidationException::withMessages([
                'status' => 'Hanya usulan yang diverifikasi yang dapat dikembalikan oleh Camat.',
            ]);
        }

        return DB::transaction(function () use ($usulan, $catatan) {
            $usulan->update([
                'status' => StatusUsulanPenghapusan::DIKEMBALIKAN_CAMAT,
                'catatan_camat' => $catatan,
            ]);

            // Pulihkan status aset ke aktif
            foreach ($usulan->items as $item) {
                $item->aset?->update(['status' => StatusAset::AKTIF]);
            }

            return $usulan->fresh();
        });
    }

    /**
     * Menyelesaikan usulan penghapusan dengan menginput Nomor & Tanggal SK Penghapusan.
     * Mengubah status aset secara permanen menjadi dihapus.
     */
    public function selesaikanSk(int $id, string $nomorSk, string $tanggalSk, User $actor): UsulanPenghapusan
    {
        $usulan = UsulanPenghapusan::with('items.aset')->findOrFail($id);

        if ($usulan->status !== StatusUsulanPenghapusan::DISETUJUI) {
            throw ValidationException::withMessages([
                'status' => 'SK Penghapusan hanya dapat diterbitkan setelah usulan disetujui Camat.',
            ]);
        }

        return DB::transaction(function () use ($usulan, $nomorSk, $tanggalSk, $actor) {
            $usulan->update([
                'status' => StatusUsulanPenghapusan::SELESAI,
                'nomor_sk_penghapusan' => $nomorSk,
                'tanggal_sk' => $tanggalSk,
            ]);

            // Final: Ubah status aset menjadi dihapus
            foreach ($usulan->items as $item) {
                $item->aset?->update(['status' => StatusAset::DIHAPUS]);

                $this->riwayatAsetService->catat(
                    asetId: $item->aset_id,
                    aksi: AksiRiwayatAset::DIHAPUS,
                    keterangan: "Aset resmi DIHAPUSKAN dari daftar BMD aktif berdasarkan SK: {$nomorSk} tanggal {$tanggalSk}.",
                    referensiType: UsulanPenghapusan::class,
                    referensiId: $usulan->id,
                    userId: $actor->id
                );
            }

            return $usulan->fresh();
        });
    }
}
