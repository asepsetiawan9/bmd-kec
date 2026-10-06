<?php

declare(strict_types=1);

namespace App\Exports;

use App\Models\Aset;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class RekapAsetExport implements FromArray, WithHeadings, ShouldAutoSize, WithStyles, WithTitle
{
    /**
     * @param array<string, mixed> $data
     */
    public function __construct(
        private readonly array $data
    ) {}

    public function title(): string
    {
        return 'Rekapitulasi BMD';
    }

    public function headings(): array
    {
        return [
            ['PEMERINTAH KABUPATEN GARUT - KECAMATAN MEKARMUKTI'],
            ['REKAPITULASI INVENTARIS BARANG MILIK DAERAH (BMD)'],
            ['Status Per: ' . now()->translatedFormat('d F Y')],
            [],
            [
                'No',
                'Kode Barang',
                'Nomor Register',
                'Nama Barang',
                'Merk / Tipe',
                'Golongan',
                'Tahun',
                'Kondisi',
                'Ruangan / Lokasi',
                'Nilai Perolehan (Rp)',
                'Pemegang / Penanggung Jawab',
            ],
        ];
    }

    public function array(): array
    {
        $rows = [];
        $asetList = $this->data['asetList'] ?? [];
        $totalNilai = 0.0;

        foreach ($asetList as $index => $aset) {
            /** @var Aset $aset */
            $nilai = (float) $aset->nilai_perolehan;
            $totalNilai += $nilai;
            $kondisi = $aset->kondisi instanceof \BackedEnum ? $aset->kondisi->label() : (string) $aset->kondisi;
            $golongan = $aset->golongan instanceof \BackedEnum ? $aset->golongan->value : (string) $aset->golongan;

            $rows[] = [
                $index + 1,
                $aset->kode_barang,
                $aset->nomor_register,
                $aset->nama_barang,
                $aset->merk_tipe ?? '-',
                "Golongan {$golongan}",
                $aset->tahun_perolehan,
                strtoupper($kondisi),
                $aset->ruangan?->nama_ruangan ?? '-',
                $nilai,
                $aset->pegawai?->nama ?? '-',
            ];
        }

        $rows[] = [
            '',
            '',
            '',
            'TOTAL NILAI BMD',
            '',
            '',
            '',
            '',
            '',
            $totalNilai,
            '',
        ];

        return $rows;
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 13]],
            2 => ['font' => ['bold' => true, 'size' => 11]],
            3 => ['font' => ['italic' => true, 'size' => 9]],
            5 => ['font' => ['bold' => true], 'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'startColor' => ['rgb' => 'E2E8F0']]],
        ];
    }
}
