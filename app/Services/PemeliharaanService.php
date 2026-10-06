<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\AksiRiwayatAset;
use App\Enums\JenisPemeliharaan;
use App\Enums\KondisiAset;
use App\Models\Aset;
use App\Models\Pemeliharaan;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PemeliharaanService
{
    public function __construct(
        protected RiwayatAsetService $riwayatAsetService
    ) {}

    /**
     * Mencatat transaksi pemeliharaan dan memperbarui kondisi fisik aset secara atomik.
     *
     * @param array<string, mixed> $data
     * @throws ValidationException
     */
    public function catat(array $data, User $actor): Pemeliharaan
    {
        $aset = Aset::findOrFail($data['aset_id']);
        $kondisiSebelum = $aset->kondisi;
        $kondisiSesudah = KondisiAset::tryFrom($data['kondisi_sesudah']) ?? $kondisiSebelum;

        return DB::transaction(function () use ($data, $aset, $actor, $kondisiSebelum, $kondisiSesudah) {
            $jenis = JenisPemeliharaan::tryFrom($data['jenis']) ?? JenisPemeliharaan::RUTIN;

            $pemeliharaan = Pemeliharaan::create([
                'aset_id' => $aset->id,
                'tanggal' => $data['tanggal'],
                'jenis' => $jenis,
                'uraian' => $data['uraian'],
                'biaya' => ! empty($data['biaya']) ? (float) $data['biaya'] : null,
                'pelaksana' => $data['pelaksana'] ?? null,
                'kondisi_sebelum' => $kondisiSebelum,
                'kondisi_sesudah' => $kondisiSesudah,
                'dibuat_oleh' => $actor->id,
            ]);

            // Perbarui kondisi fisik aset
            $aset->update([
                'kondisi' => $kondisiSesudah,
            ]);

            $biayaFormatted = ! empty($data['biaya'])
                ? 'Rp ' . number_format((float) $data['biaya'], 0, ',', '.')
                : 'Tanpa Biaya';

            // Catat audit trail riwayat aset
            $this->riwayatAsetService->catat(
                asetId: $aset->id,
                aksi: AksiRiwayatAset::PEMELIHARAAN,
                keterangan: "Pemeliharaan {$jenis->label()}: {$data['uraian']} ({$biayaFormatted}). Kondisi: {$kondisiSebelum->label()} → {$kondisiSesudah->label()}",
                dataSebelum: ['kondisi' => $kondisiSebelum->value],
                dataSesudah: ['kondisi' => $kondisiSesudah->value],
                referensiType: Pemeliharaan::class,
                referensiId: $pemeliharaan->id,
                userId: $actor->id
            );

            return $pemeliharaan;
        });
    }
}
