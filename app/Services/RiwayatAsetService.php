<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\AksiRiwayatAset;
use App\Models\RiwayatAset;
use Illuminate\Support\Facades\Auth;

class RiwayatAsetService
{
    /**
     * Catat audit trail riwayat mutasi / lifecycle pada aset.
     */
    public function catat(
        int $asetId,
        AksiRiwayatAset $aksi,
        string $keterangan,
        ?array $dataSebelum = null,
        ?array $dataSesudah = null,
        ?string $referensiType = null,
        ?int $referensiId = null,
        ?int $userId = null
    ): RiwayatAset {
        return RiwayatAset::create([
            'aset_id' => $asetId,
            'aksi' => $aksi,
            'keterangan' => $keterangan,
            'data_sebelum' => $dataSebelum,
            'data_sesudah' => $dataSesudah,
            'referensi_type' => $referensiType,
            'referensi_id' => $referensiId,
            'user_id' => $userId ?? Auth::id(),
        ]);
    }
}
