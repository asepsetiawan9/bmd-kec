<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\GolonganKib;
use App\Enums\KondisiAset;
use App\Exports\RekapAsetExport;
use App\Models\Aset;
use App\Models\Pengaturan;
use Barryvdh\DomPDF\Facade\Pdf;
use Barryvdh\DomPDF\PDF as DomPdfInstance;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class LaporanService
{
    /**
     * Ambil pengaturan sistem untuk header / metadata laporan.
     *
     * @return array<string, string>
     */
    public function getSettings(): array
    {
        return Pengaturan::all()->pluck('value', 'key')->toArray();
    }

    /**
     * Ambil data laporan BMD sesuai filter yang dipilih.
     *
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function getLaporanData(array $filters = []): array
    {
        $settings = $this->getSettings();

        $query = Aset::with(['ruangan', 'pegawai', 'kodeBarangRef']);

        if (!empty($filters['golongan'])) {
            $query->where('golongan', $filters['golongan']);
        }

        if (!empty($filters['kondisi'])) {
            $query->where('kondisi', $filters['kondisi']);
        }

        if (!empty($filters['ruangan_id'])) {
            $query->where('ruangan_id', (int) $filters['ruangan_id']);
        }

        if (!empty($filters['tahun_perolehan'])) {
            $query->where('tahun_perolehan', (int) $filters['tahun_perolehan']);
        }

        if (!empty($filters['search'])) {
            $search = (string) $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('nama_barang', 'like', "%{$search}%")
                  ->orWhere('kode_barang', 'like', "%{$search}%")
                  ->orWhere('nomor_register', 'like', "%{$search}%");
            });
        }

        $asetList = $query->orderBy('kode_barang')->orderBy('nomor_register')->get();

        $summary = [
            'total_aset' => $asetList->count(),
            'total_nilai' => (float) $asetList->sum('nilai_perolehan'),
            'baik' => $asetList->where('kondisi', KondisiAset::BAIK)->count(),
            'rusak_ringan' => $asetList->where('kondisi', KondisiAset::RUSAK_RINGAN)->count(),
            'rusak_berat' => $asetList->where('kondisi', KondisiAset::RUSAK_BERAT)->count(),
        ];

        return [
            'filters' => [
                'golongan' => $filters['golongan'] ?? null,
                'kondisi' => $filters['kondisi'] ?? null,
                'ruangan_id' => $filters['ruangan_id'] ?? null,
                'tahun_perolehan' => $filters['tahun_perolehan'] ?? null,
                'search' => $filters['search'] ?? null,
            ],
            'settings' => $settings,
            'summary' => $summary,
            'asetList' => $asetList,
        ];
    }

    /**
     * Generate PDF Rekapitulasi Aset BMD Mekarmukti.
     *
     * @param array<string, mixed> $filters
     */
    public function exportPdf(array $filters): DomPdfInstance
    {
        $data = $this->getLaporanData($filters);

        $viewData = [
            'asetList' => $data['asetList'],
            'summary' => $data['summary'],
            'settings' => $data['settings'],
            'filters' => $data['filters'],
        ];

        $pdf = Pdf::loadView('pdf.rekap_aset', $viewData);
        $pdf->setPaper('a4', 'landscape');

        return $pdf;
    }

    /**
     * Generate Excel Rekapitulasi Aset BMD Mekarmukti.
     *
     * @param array<string, mixed> $filters
     */
    public function exportExcel(array $filters): BinaryFileResponse
    {
        $data = $this->getLaporanData($filters);
        $timestamp = now()->format('Ymd_His');

        $exportData = [
            'asetList' => $data['asetList'],
            'summary' => $data['summary'],
            'settings' => $data['settings'],
        ];

        $fileName = "Rekapitulasi_Aset_BMD_Mekarmukti_{$timestamp}.xlsx";

        return Excel::download(new RekapAsetExport($exportData), $fileName);
    }
}
