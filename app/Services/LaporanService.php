<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\GolonganKib;
use App\Enums\KondisiAset;
use App\Exports\BmdLaporanExport;
use App\Models\Aset;
use App\Models\Inventarisasi;
use App\Models\InventarisasiItem;
use App\Models\MutasiAset;
use App\Models\Pengaturan;
use App\Models\Ruangan;
use App\Models\UsulanPenghapusan;
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
     * Ambil data laporan BMD sesuai filter dan jenis laporan yang dipilih.
     *
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function getLaporanData(array $filters = []): array
    {
        $settings = $this->getSettings();
        $jenisLaporan = (string) ($filters['jenis_laporan'] ?? 'rekap');

        // Handle Mutasi report
        if ($jenisLaporan === 'mutasi') {
            $mutasiQuery = MutasiAset::with(['aset', 'dariRuangan', 'keRuangan', 'dariPegawai', 'kePegawai'])
                ->latest('tanggal');

            if (!empty($filters['tahun_perolehan'])) {
                $mutasiQuery->whereYear('tanggal', (int) $filters['tahun_perolehan']);
            }
            if (!empty($filters['search'])) {
                $search = (string) $filters['search'];
                $mutasiQuery->where(function ($q) use ($search) {
                    $q->where('nomor_bast', 'like', "%{$search}%")
                      ->orWhereHas('aset', fn ($sub) => $sub->where('nama_barang', 'like', "%{$search}%"));
                });
            }

            $mutasiList = $mutasiQuery->get();

            return [
                'filters' => $filters,
                'settings' => $settings,
                'mutasiList' => $mutasiList,
                'summary' => [
                    'total_mutasi' => $mutasiList->count(),
                ],
            ];
        }

        // Handle Usulan Penghapusan report
        if ($jenisLaporan === 'penghapusan') {
            $usulanQuery = UsulanPenghapusan::with(['items.aset', 'creator'])
                ->latest('tanggal');

            if (!empty($filters['tahun_perolehan'])) {
                $usulanQuery->whereYear('tanggal', (int) $filters['tahun_perolehan']);
            }
            if (!empty($filters['search'])) {
                $search = (string) $filters['search'];
                $usulanQuery->where(function ($q) use ($search) {
                    $q->where('nomor', 'like', "%{$search}%")
                      ->orWhere('alasan_umum', 'like', "%{$search}%");
                });
            }

            $usulanList = $usulanQuery->get();

            return [
                'filters' => $filters,
                'settings' => $settings,
                'usulanList' => $usulanList,
                'summary' => [
                    'total_usulan' => $usulanList->count(),
                ],
            ];
        }

        // Handle Sensus / Inventarisasi report
        if ($jenisLaporan === 'inventarisasi') {
            $activeOpname = Inventarisasi::latest()->first();
            $opnameQuery = InventarisasiItem::with(['aset.ruangan', 'ruanganTemuan', 'pemeriksa'])
                ->when($activeOpname, fn ($q) => $q->where('inventarisasi_id', $activeOpname->id));

            if (!empty($filters['search'])) {
                $search = (string) $filters['search'];
                $opnameQuery->whereHas('aset', fn ($q) => $q->where('nama_barang', 'like', "%{$search}%")->orWhere('kode_barang', 'like', "%{$search}%"));
            }

            $opnameItems = $opnameQuery->get();

            return [
                'filters' => $filters,
                'settings' => $settings,
                'opnameSession' => $activeOpname,
                'opnameItems' => $opnameItems,
                'summary' => [
                    'total_dicek' => $opnameItems->where('hasil', '!=', 'belum_dicek')->count(),
                    'total_item' => $opnameItems->count(),
                ],
            ];
        }

        // Default: Aset based reports (KIB A-F, KIR, Buku Inventaris / Rekap)
        $query = Aset::with([
            'ruangan.penanggungJawab',
            'pegawai',
            'kodeBarangRef',
            'detailTanah',
            'detailPeralatan',
            'detailGedung',
            'detailJalan',
            'detailLainnya',
            'detailKdp',
        ]);

        // Auto map KIB jenis to Golongan
        $golonganMap = [
            'kib_a' => 'A',
            'kib_b' => 'B',
            'kib_c' => 'C',
            'kib_d' => 'D',
            'kib_e' => 'E',
            'kib_f' => 'F',
        ];

        if (isset($golonganMap[$jenisLaporan])) {
            $query->where('golongan', $golonganMap[$jenisLaporan]);
        } elseif (!empty($filters['golongan'])) {
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

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = (string) $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('nama_barang', 'like', "%{$search}%")
                  ->orWhere('kode_barang', 'like', "%{$search}%")
                  ->orWhere('nomor_register', 'like', "%{$search}%")
                  ->orWhere('merk_tipe', 'like', "%{$search}%");
            });
        }

        $asetList = $query->orderBy('kode_barang')->orderBy('nomor_register')->get();

        $selectedRuangan = !empty($filters['ruangan_id'])
            ? Ruangan::with('penanggungJawab')->find((int) $filters['ruangan_id'])
            : null;

        $summary = [
            'total_aset' => $asetList->count(),
            'total_nilai' => (float) $asetList->sum('nilai_perolehan'),
            'baik' => $asetList->where('kondisi', KondisiAset::BAIK)->count(),
            'rusak_ringan' => $asetList->where('kondisi', KondisiAset::RUSAK_RINGAN)->count(),
            'rusak_berat' => $asetList->where('kondisi', KondisiAset::RUSAK_BERAT)->count(),
        ];

        return [
            'filters' => array_merge([
                'jenis_laporan' => $jenisLaporan,
                'golongan' => $filters['golongan'] ?? ($golonganMap[$jenisLaporan] ?? null),
                'kondisi' => $filters['kondisi'] ?? null,
                'ruangan_id' => $filters['ruangan_id'] ?? null,
                'tahun_perolehan' => $filters['tahun_perolehan'] ?? null,
                'search' => $filters['search'] ?? null,
            ], $filters),
            'settings' => $settings,
            'summary' => $summary,
            'asetList' => $asetList,
            'ruangan' => $selectedRuangan,
        ];
    }

    /**
     * Generate PDF resmi BMD Mekarmukti.
     *
     * @param array<string, mixed> $filters
     */
    public function exportPdf(array $filters): DomPdfInstance
    {
        $data = $this->getLaporanData($filters);
        $jenis = (string) ($filters['jenis_laporan'] ?? 'rekap');

        if ($jenis === 'mutasi') {
            $pdf = Pdf::loadView('pdf.laporan_mutasi', [
                'mutasiList' => $data['mutasiList'],
                'settings' => $data['settings'],
                'filters' => $data['filters'],
            ]);
            $pdf->setPaper('a4', 'landscape');
            return $pdf;
        }

        if ($jenis === 'penghapusan') {
            $pdf = Pdf::loadView('pdf.laporan_penghapusan', [
                'usulanList' => $data['usulanList'],
                'settings' => $data['settings'],
                'filters' => $data['filters'],
            ]);
            $pdf->setPaper('a4', 'landscape');
            return $pdf;
        }

        if ($jenis === 'inventarisasi') {
            $pdf = Pdf::loadView('pdf.laporan_inventarisasi', [
                'opnameItems' => $data['opnameItems'],
                'opnameSession' => $data['opnameSession'] ?? null,
                'settings' => $data['settings'],
                'filters' => $data['filters'],
            ]);
            $pdf->setPaper('a4', 'landscape');
            return $pdf;
        }

        if ($jenis === 'kir') {
            $pdf = Pdf::loadView('pdf.kir_ruangan', [
                'asetList' => $data['asetList'],
                'ruangan' => $data['ruangan'],
                'settings' => $data['settings'],
                'filters' => $data['filters'],
            ]);
            $pdf->setPaper('a4', 'landscape');
            return $pdf;
        }

        if (in_array($jenis, ['kib_a', 'kib_b', 'kib_c', 'kib_d', 'kib_e', 'kib_f'])) {
            $golonganNames = [
                'kib_a' => 'KIB A - TANAH',
                'kib_b' => 'KIB B - PERALATAN DAN MESIN',
                'kib_c' => 'KIB C - GEDUNG DAN BANGUNAN',
                'kib_d' => 'KIB D - JALAN, IRIGASI DAN JARINGAN',
                'kib_e' => 'KIB E - ASET TETAP LAINNYA',
                'kib_f' => 'KIB F - KONSTRUKSI DALAM PENGERJAAN',
            ];

            $pdf = Pdf::loadView('pdf.kib_golongan', [
                'asetList' => $data['asetList'],
                'settings' => $data['settings'],
                'filters' => $data['filters'],
                'jenisLaporan' => $jenis,
                'judulLaporan' => $golonganNames[$jenis] ?? 'KARTU INVENTARIS BARANG',
                'golonganLabel' => $golonganNames[$jenis] ?? 'Golongan',
            ]);
            $pdf->setPaper('legal', 'landscape');
            return $pdf;
        }

        // Default: Rekapitulasi Umum / Buku Inventaris
        $pdf = Pdf::loadView('pdf.rekap_aset', [
            'asetList' => $data['asetList'],
            'summary' => $data['summary'],
            'settings' => $data['settings'],
            'filters' => $data['filters'],
        ]);
        $pdf->setPaper('a4', 'landscape');

        return $pdf;
    }

    /**
     * Generate Excel laporan BMD Mekarmukti.
     *
     * @param array<string, mixed> $filters
     */
    public function exportExcel(array $filters): BinaryFileResponse
    {
        $data = $this->getLaporanData($filters);
        $jenis = (string) ($filters['jenis_laporan'] ?? 'rekap');
        $timestamp = now()->format('Ymd_His');

        $fileName = "Laporan_BMD_Mekarmukti_{$jenis}_{$timestamp}.xlsx";

        return Excel::download(new BmdLaporanExport($data), $fileName);
    }
}
