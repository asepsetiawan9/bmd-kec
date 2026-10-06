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
        abort_unless(
            $request->user()->can('laporan.view') || in_array($request->user()->role?->value ?? (string) $request->user()->role, ['super_admin', 'pengurus_barang', 'penatausaha', 'camat']),
            403,
            'Akses tidak diizinkan untuk melihat laporan.'
        );

        $filters = $request->only([
            'jenis_laporan',
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

        $jenisLaporanOptions = [
            ['value' => 'rekap', 'label' => 'Buku Inventaris (Rekap Seluruh Aset)'],
            ['value' => 'kir', 'label' => 'KIR (Kartu Inventaris Ruangan)'],
            ['value' => 'kib_a', 'label' => 'KIB A (Tanah)'],
            ['value' => 'kib_b', 'label' => 'KIB B (Peralatan & Mesin)'],
            ['value' => 'kib_c', 'label' => 'KIB C (Gedung & Bangunan)'],
            ['value' => 'kib_d', 'label' => 'KIB D (Jalan, Irigasi & Jaringan)'],
            ['value' => 'kib_e', 'label' => 'KIB E (Aset Tetap Lainnya)'],
            ['value' => 'kib_f', 'label' => 'KIB F (Konstruksi Dalam Pengerjaan)'],
            ['value' => 'mutasi', 'label' => 'Laporan Mutasi Barang'],
            ['value' => 'penghapusan', 'label' => 'Daftar Usulan Penghapusan'],
            ['value' => 'inventarisasi', 'label' => 'Hasil Sensus / Inventarisasi'],
        ];

        return Inertia::render('Laporan/Index', [
            'reportData' => $reportData,
            'golonganOptions' => $golonganOptions,
            'kondisiOptions' => $kondisiOptions,
            'ruanganOptions' => $ruanganOptions,
            'jenisLaporanOptions' => $jenisLaporanOptions,
        ]);
    }

    /**
     * Ekspor laporan BMD ke format PDF resmi landscape.
     */
    public function exportPdf(Request $request): HttpResponse
    {
        abort_unless(
            $request->user()->can('laporan.export') || in_array($request->user()->role?->value ?? (string) $request->user()->role, ['super_admin', 'pengurus_barang', 'penatausaha', 'camat']),
            403,
            'Akses tidak diizinkan untuk mengekspor laporan.'
        );

        $filters = $request->all();
        $pdf = $this->laporanService->exportPdf($filters);

        $jenis = (string) ($filters['jenis_laporan'] ?? 'rekap');
        $timestamp = now()->format('Ymd_His');
        $fileName = "Laporan_BMD_Mekarmukti_{$jenis}_{$timestamp}.pdf";

        return $pdf->download($fileName);
    }

    /**
     * Ekspor laporan BMD ke format Excel (.xlsx).
     */
    public function exportExcel(Request $request): BinaryFileResponse
    {
        abort_unless(
            $request->user()->can('laporan.export') || in_array($request->user()->role?->value ?? (string) $request->user()->role, ['super_admin', 'pengurus_barang', 'penatausaha', 'camat']),
            403,
            'Akses tidak diizinkan untuk mengekspor laporan.'
        );

        return $this->laporanService->exportExcel($request->all());
    }
}
