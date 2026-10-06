<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\GolonganKib;
use App\Enums\KondisiAset;
use App\Models\Ruangan;
use App\Services\LaporanService;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class LaporanController extends Controller
{
    public function __construct(
        private readonly LaporanService $laporanService
    ) {}

    /**
     * Tampilkan halaman pelaporan BMD Mekarmukti.
     */
    public function index(Request $request): Response
    {
        abort_unless($request->user()->can('laporan.view'), 403, 'Akses tidak diizinkan untuk melihat laporan.');

        $filters = $request->only([
            'golongan',
            'kondisi',
            'ruangan_id',
            'tahun_perolehan',
            'search',
        ]);

        $reportData = $this->laporanService->getLaporanData($filters);

        $golonganOptions = array_map(fn (GolonganKib $g) => [
            'value' => $g->value,
            'label' => "Golongan {$g->value} ({$g->label()})",
        ], GolonganKib::cases());

        $kondisiOptions = array_map(fn (KondisiAset $k) => [
            'value' => $k->value,
            'label' => $k->label(),
        ], KondisiAset::cases());

        $ruanganOptions = Ruangan::select('id', 'nama_ruangan', 'kode_ruangan')
            ->orderBy('nama_ruangan')
            ->get()
            ->map(fn (Ruangan $r) => [
                'id' => $r->id,
                'nama' => "[{$r->kode_ruangan}] {$r->nama_ruangan}",
            ]);

        return Inertia::render('Laporan/Index', [
            'reportData' => $reportData,
            'golonganOptions' => $golonganOptions,
            'kondisiOptions' => $kondisiOptions,
            'ruanganOptions' => $ruanganOptions,
        ]);
    }

    /**
     * Ekspor rekapitulasi aset BMD ke format PDF.
     */
    public function exportPdf(Request $request): HttpResponse
    {
        abort_unless($request->user()->can('laporan.export'), 403, 'Akses tidak diizinkan untuk mengekspor laporan.');

        $filters = $request->all();
        $pdf = $this->laporanService->exportPdf($filters);

        $timestamp = now()->format('Ymd_His');
        $fileName = "Rekapitulasi_Aset_BMD_Mekarmukti_{$timestamp}.pdf";

        return $pdf->download($fileName);
    }

    /**
     * Ekspor rekapitulasi aset BMD ke format Excel (.xlsx).
     */
    public function exportExcel(Request $request): BinaryFileResponse
    {
        abort_unless($request->user()->can('laporan.export'), 403, 'Akses tidak diizinkan untuk mengekspor laporan.');

        return $this->laporanService->exportExcel($request->all());
    }
}
