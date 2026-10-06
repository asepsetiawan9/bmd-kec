<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Aset;
use App\Models\Pengaturan;
use App\Services\AsetService;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class LabelCetakController extends Controller
{
    public function __construct(
        protected AsetService $asetService
    ) {}

    /**
     * Print QR code labels for one or multiple assets.
     */
    public function print(Request $request): HttpResponse
    {
        $rawIds = $request->input('ids', $request->query('ids', []));

        if (is_string($rawIds)) {
            $ids = array_filter(array_map('intval', explode(',', $rawIds)));
        } elseif (is_array($rawIds)) {
            $ids = array_filter(array_map('intval', $rawIds));
        } else {
            $ids = [];
        }

        if (empty($ids) && $request->has('aset_id')) {
            $ids = [(int) $request->input('aset_id')];
        }

        abort_if(empty($ids), 400, 'Tidak ada aset yang dipilih untuk dicetak labelnya.');

        $assets = Aset::with(['ruangan', 'pemegang', 'refKodeBarang'])
            ->whereIn('id', $ids)
            ->orderBy('kode_barang')
            ->orderBy('nomor_register')
            ->get();

        abort_if($assets->isEmpty(), 404, 'Data aset tidak ditemukan.');

        // Ensure QR code image exists for every selected asset
        foreach ($assets as $aset) {
            if (! $aset->qr_code_path || ! Storage::disk('public')->exists($aset->qr_code_path)) {
                $this->asetService->generateQrCode($aset);
                $aset->refresh();
            }
        }

        $instansi = Pengaturan::get('nama_instansi', 'Kecamatan Mekarmukti');
        $kabupaten = Pengaturan::get('kabupaten', 'Kabupaten Garut');

        return response()->view('print.label_qr_a4', [
            'assets' => $assets,
            'instansi' => $instansi,
            'kabupaten' => $kabupaten,
        ]);
    }
}
