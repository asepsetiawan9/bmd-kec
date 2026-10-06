<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\AksiRiwayatAset;
use App\Enums\HasilInventarisasi;
use App\Enums\KondisiAset;
use App\Enums\StatusAset;
use App\Enums\StatusInventarisasi;
use App\Models\Aset;
use App\Models\Inventarisasi;
use App\Models\InventarisasiItem;
use App\Models\NomorUrut;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InventarisasiService
{
    public function __construct(
        protected RiwayatAsetService $riwayatAsetService
    ) {}

    /**
     * Membuat sesi inventarisasi (stock opname) baru dan snapshot seluruh aset aktif.
     *
     * @param array<string, mixed> $data
     * @throws ValidationException
     */
    public function createSesi(array $data, User $actor): Inventarisasi
    {
        // BR-OPN-01: Hanya boleh ada satu sesi opname berstatus berjalan
        $activeSession = Inventarisasi::where('status', StatusInventarisasi::BERJALAN)->first();
        if ($activeSession) {
            throw ValidationException::withMessages([
                'status' => "Masih terdapat sesi inventarisasi yang sedang berjalan: '{$activeSession->nama}'. Tutup sesi tersebut terlebih dahulu.",
            ]);
        }

        $tahun = (int) date('Y');

        return DB::transaction(function () use ($data, $actor, $tahun) {
            // Generate kode unik opname
            $key = "opname:{$tahun}";
            $counter = NomorUrut::where('kunci', $key)->lockForUpdate()->first();
            if (! $counter) {
                $counter = NomorUrut::create(['kunci' => $key, 'nilai_terakhir' => 1]);
                $nextVal = 1;
            } else {
                $nextVal = $counter->nilai_terakhir + 1;
                $counter->update(['nilai_terakhir' => $nextVal]);
            }
            $kode = sprintf('OPN-%d-%03d', $tahun, $nextVal);

            $inventarisasi = Inventarisasi::create([
                'kode' => $kode,
                'nama' => $data['nama'],
                'tanggal_mulai' => $data['tanggal_mulai'] ?? date('Y-m-d'),
                'status' => StatusInventarisasi::BERJALAN,
                'ruangan_scope' => ! empty($data['ruangan_scope']) ? (int) $data['ruangan_scope'] : null,
                'dibuat_oleh' => $actor->id,
            ]);

            // BR-OPN-02: Snapshot aset aktif ke inventarisasi_item
            $asetQuery = Aset::where('status', StatusAset::AKTIF);
            if (! empty($data['ruangan_scope'])) {
                $asetQuery->where('ruangan_id', (int) $data['ruangan_scope']);
            }

            $asets = $asetQuery->get(['id']);
            $items = [];
            foreach ($asets as $aset) {
                $items[] = [
                    'inventarisasi_id' => $inventarisasi->id,
                    'aset_id' => $aset->id,
                    'hasil' => HasilInventarisasi::BELUM_DICEK->value,
                    'kondisi_temuan' => null,
                    'ruangan_temuan_id' => null,
                    'catatan' => null,
                    'diperiksa_oleh' => null,
                    'diperiksa_pada' => null,
                ];
            }

            if (! empty($items)) {
                // Chunk insert
                foreach (array_chunk($items, 200) as $chunk) {
                    InventarisasiItem::insert($chunk);
                }
            }

            return $inventarisasi;
        });
    }

    /**
     * Memperbarui hasil pemeriksaan fisik satu aset pada sesi opname.
     *
     * @param array<string, mixed> $payload
     */
    public function periksaItem(int $inventarisasiId, int $asetId, array $payload, User $actor): InventarisasiItem
    {
        $sesi = Inventarisasi::findOrFail($inventarisasiId);
        if ($sesi->status !== StatusInventarisasi::BERJALAN) {
            throw ValidationException::withMessages([
                'status' => 'Sesi inventarisasi ini sudah selesai dan tidak dapat diubah lagi.',
            ]);
        }

        $item = InventarisasiItem::where('inventarisasi_id', $inventarisasiId)
            ->where('aset_id', $asetId)
            ->firstOrFail();

        $hasil = HasilInventarisasi::tryFrom($payload['hasil'] ?? 'ditemukan') ?? HasilInventarisasi::DITEMUKAN;
        $kondisiTemuan = ! empty($payload['kondisi_temuan'])
            ? (KondisiAset::tryFrom($payload['kondisi_temuan']) ?? KondisiAset::BAIK)
            : KondisiAset::BAIK;

        $item->update([
            'hasil' => $hasil,
            'kondisi_temuan' => $kondisiTemuan,
            'ruangan_temuan_id' => ! empty($payload['ruangan_temuan_id']) ? (int) $payload['ruangan_temuan_id'] : null,
            'catatan' => $payload['catatan'] ?? null,
            'diperiksa_oleh' => $actor->id,
            'diperiksa_pada' => now(),
        ]);

        return $item->fresh(['aset.ruangan', 'ruanganTemuan', 'pemeriksa']);
    }

    /**
     * Menutup sesi inventarisasi dan menyinkronkan kondisi aktual fisik ke master aset.
     *
     * @throws ValidationException
     */
    public function tutupSesi(int $inventarisasiId, User $actor): Inventarisasi
    {
        $sesi = Inventarisasi::with('items.aset')->findOrFail($inventarisasiId);

        if ($sesi->status === StatusInventarisasi::SELESAI) {
            throw ValidationException::withMessages([
                'status' => 'Sesi inventarisasi ini sudah berstatus selesai.',
            ]);
        }

        return DB::transaction(function () use ($sesi, $actor) {
            $sesi->update([
                'status' => StatusInventarisasi::SELESAI,
                'tanggal_selesai' => date('Y-m-d'),
            ]);

            // BR-OPN-03: Update kondisi & tanggal_verifikasi_fisik aset dari hasil temuan
            foreach ($sesi->items as $item) {
                $aset = $item->aset;
                if (! $aset) continue;

                if ($item->hasil === HasilInventarisasi::DITEMUKAN) {
                    $kondisiLama = $aset->kondisi;
                    $kondisiBaru = $item->kondisi_temuan ?? $kondisiLama;
                    $ruanganBaru = $item->ruangan_temuan_id ?? $aset->ruangan_id;

                    $aset->update([
                        'kondisi' => $kondisiBaru,
                        'ruangan_id' => $ruanganBaru,
                        'tanggal_verifikasi_fisik' => now()->toDateString(),
                    ]);

                    $this->riwayatAsetService->catat(
                        asetId: $aset->id,
                        aksi: AksiRiwayatAset::OPNAME,
                        keterangan: "Sensus fisik '{$sesi->nama}': Aset terverifikasi fisik dengan kondisi {$kondisiBaru->label()}.",
                        dataSebelum: ['kondisi' => $kondisiLama->value],
                        dataSesudah: ['kondisi' => $kondisiBaru->value],
                        referensiType: Inventarisasi::class,
                        referensiId: $sesi->id,
                        userId: $actor->id
                    );
                } elseif ($item->hasil === HasilInventarisasi::TIDAK_DITEMUKAN) {
                    // BR-OPN-04: Catat temuan aset hilang / tidak ditemukan
                    $this->riwayatAsetService->catat(
                        asetId: $aset->id,
                        aksi: AksiRiwayatAset::OPNAME,
                        keterangan: "Sensus fisik '{$sesi->nama}': ASET TIDAK DITEMUKAN di lapangan saat pemeriksaan fisik.",
                        dataSebelum: ['kondisi' => $aset->kondisi->value],
                        dataSesudah: ['hasil_opname' => 'tidak_ditemukan'],
                        referensiType: Inventarisasi::class,
                        referensiId: $sesi->id,
                        userId: $actor->id
                    );
                }
            }

            return $sesi->fresh();
        });
    }
}
