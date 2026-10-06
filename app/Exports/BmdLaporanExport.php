<?php

declare(strict_types=1);

namespace App\Exports;

use App\Enums\GolonganKib;
use App\Models\Aset;
use App\Models\MutasiAset;
use App\Models\UsulanPenghapusan;
use App\Models\InventarisasiItem;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class BmdLaporanExport implements FromArray, WithHeadings, ShouldAutoSize, WithStyles, WithTitle
{
    /**
     * @param array<string, mixed> $reportData
     */
    public function __construct(
        private readonly array $reportData
    ) {}

    public function title(): string
    {
        $jenis = (string) ($this->reportData['filters']['jenis_laporan'] ?? 'rekap');
        return match ($jenis) {
            'kib_a' => 'KIB A - Tanah',
            'kib_b' => 'KIB B - Peralatan',
            'kib_c' => 'KIB C - Gedung',
            'kib_d' => 'KIB D - Jalan',
            'kib_e' => 'KIB E - Aset Lainnya',
            'kib_f' => 'KIB F - KDP',
            'kir' => 'KIR Ruangan',
            'mutasi' => 'Laporan Mutasi',
            'penghapusan' => 'Usulan Penghapusan',
            'inventarisasi' => 'Hasil Sensus',
            default => 'Buku Inventaris BMD',
        };
    }

    public function headings(): array
    {
        $instansi = $this->reportData['settings']['instansi_nama'] ?? 'PEMERINTAH KECAMATAN MEKARMUKTI';
        $kabupaten = $this->reportData['settings']['kabupaten_nama'] ?? 'KABUPATEN GARUT';
        $title = mb_strtoupper($this->title());
        $tanggal = now()->translatedFormat('d F Y');
        $jenis = (string) ($this->reportData['filters']['jenis_laporan'] ?? 'rekap');

        $headerRows = [
            ["{$instansi} - {$kabupaten}"],
            ["LAPORAN RESMI {$title}"],
            ["Status Data per Tanggal: {$tanggal}"],
            [],
        ];

        if ($jenis === 'mutasi') {
            $headerRows[] = [
                'No', 'Nomor BAST', 'Tanggal', 'Nama Barang', 'Kode Barang', 'Dari Ruangan', 'Ke Ruangan', 'Dari Pemegang', 'Ke Pemegang', 'Alasan Mutasi'
            ];
        } elseif ($jenis === 'penghapusan') {
            $headerRows[] = [
                'No', 'Nomor Usulan', 'Tanggal', 'Status Approval', 'Alasan Umum', 'Jumlah Barang', 'Nomor SK', 'Tanggal SK'
            ];
        } elseif ($jenis === 'inventarisasi') {
            $headerRows[] = [
                'No', 'Kode Barang', 'Nomor Register', 'Nama Barang', 'Ruangan Terdaftar', 'Hasil Cek Fisik', 'Kondisi Temuan', 'Ruangan Temuan', 'Pemeriksa'
            ];
        } elseif ($jenis === 'kir') {
            $headerRows[] = [
                'No', 'Kode Barang', 'Nomor Register', 'Nama Barang', 'Merk / Model', 'Tahun', 'Kondisi', 'Penanggung Jawab Ruangan', 'Nilai Perolehan (Rp)'
            ];
        } elseif ($jenis === 'kib_a') {
            $headerRows[] = [
                'No', 'Kode Barang', 'Nomor Register', 'Nama Barang', 'Luas (m²)', 'Tahun', 'Letak / Alamat', 'Hak Tanah', 'No Sertifikat', 'Penggunaan', 'Nilai Perolehan (Rp)'
            ];
        } elseif ($jenis === 'kib_b') {
            $headerRows[] = [
                'No', 'Kode Barang', 'Nomor Register', 'Nama Barang', 'Merk / Tipe', 'Ukuran / CC', 'Bahan', 'Tahun', 'No Polisi / Rangka', 'Kondisi', 'Ruangan', 'Nilai Perolehan (Rp)'
            ];
        } elseif ($jenis === 'kib_c') {
            $headerRows[] = [
                'No', 'Kode Barang', 'Nomor Register', 'Nama Barang', 'Kondisi Bangunan', 'Konstruksi Bertingkat', 'Konstruksi Beton', 'Luas Lantai (m²)', 'Lokasi', 'Tahun', 'Nilai Perolehan (Rp)'
            ];
        } elseif ($jenis === 'kib_d') {
            $headerRows[] = [
                'No', 'Kode Barang', 'Nomor Register', 'Nama Barang', 'Konstruksi', 'Panjang (km/m)', 'Lebar (m)', 'Lokasi', 'Tahun', 'Kondisi', 'Nilai Perolehan (Rp)'
            ];
        } elseif ($jenis === 'kib_e') {
            $headerRows[] = [
                'No', 'Kode Barang', 'Nomor Register', 'Nama Barang', 'Judul / Pencipta', 'Spesifikasi', 'Jumlah', 'Tahun', 'Kondisi', 'Ruangan', 'Nilai Perolehan (Rp)'
            ];
        } elseif ($jenis === 'kib_f') {
            $headerRows[] = [
                'No', 'Kode Barang', 'Nomor Register', 'Nama Bangunan', 'Bangunan Bertingkat', 'Beton / Tidak', 'Luas (m²)', 'Lokasi', 'Tgl Mulai', 'Nilai Kontrak / Realisasi (Rp)'
            ];
        } else {
            // Buku Inventaris / Rekapitulasi Umum
            $headerRows[] = [
                'No', 'Kode Barang', 'Nomor Register', 'Nama Barang', 'Merk / Tipe', 'Golongan', 'Tahun', 'Kondisi', 'Ruangan / Lokasi', 'Pemegang', 'Nilai Perolehan (Rp)'
            ];
        }

        return $headerRows;
    }

    public function array(): array
    {
        $jenis = (string) ($this->reportData['filters']['jenis_laporan'] ?? 'rekap');
        $rows = [];
        $totalNilai = 0.0;

        if ($jenis === 'mutasi') {
            $mutasiList = $this->reportData['mutasiList'] ?? [];
            foreach ($mutasiList as $idx => $m) {
                /** @var MutasiAset $m */
                $rows[] = [
                    $idx + 1,
                    $m->nomor_bast,
                    $m->tanggal?->format('d/m/Y') ?? '-',
                    $m->aset?->nama_barang ?? '-',
                    $m->aset?->kode_barang ?? '-',
                    $m->dariRuangan?->nama_ruangan ?? '-',
                    $m->keRuangan?->nama_ruangan ?? '-',
                    $m->dariPegawai?->nama ?? '-',
                    $m->kePegawai?->nama ?? '-',
                    $m->alasan ?? '-',
                ];
            }
            return $rows;
        }

        if ($jenis === 'penghapusan') {
            $usulanList = $this->reportData['usulanList'] ?? [];
            foreach ($usulanList as $idx => $u) {
                /** @var UsulanPenghapusan $u */
                $rows[] = [
                    $idx + 1,
                    $u->nomor,
                    $u->tanggal?->format('d/m/Y') ?? '-',
                    strtoupper(str_replace('_', ' ', $u->status instanceof \BackedEnum ? $u->status->value : (string) $u->status)),
                    $u->alasan_umum ?? '-',
                    $u->items?->count() ?? 0,
                    $u->nomor_sk_penghapusan ?? '-',
                    $u->tanggal_sk?->format('d/m/Y') ?? '-',
                ];
            }
            return $rows;
        }

        if ($jenis === 'inventarisasi') {
            $itemList = $this->reportData['opnameItems'] ?? [];
            foreach ($itemList as $idx => $item) {
                /** @var InventarisasiItem $item */
                $rows[] = [
                    $idx + 1,
                    $item->aset?->kode_barang ?? '-',
                    $item->aset?->nomor_register ?? '-',
                    $item->aset?->nama_barang ?? '-',
                    $item->aset?->ruangan?->nama_ruangan ?? '-',
                    strtoupper(str_replace('_', ' ', (string) $item->hasil)),
                    strtoupper(str_replace('_', ' ', (string) $item->kondisi_temuan)),
                    $item->ruanganTemuan?->nama_ruangan ?? ($item->aset?->ruangan?->nama_ruangan ?? '-'),
                    $item->pemeriksa?->name ?? '-',
                ];
            }
            return $rows;
        }

        // Aset Base (KIB A-F, KIR, Buku Inventaris)
        $asetList = $this->reportData['asetList'] ?? [];
        foreach ($asetList as $idx => $a) {
            /** @var Aset $a */
            $nilai = (float) $a->nilai_perolehan;
            $totalNilai += $nilai;
            $kondisi = $a->kondisi instanceof \BackedEnum ? $a->kondisi->label() : (string) $a->kondisi;
            $golongan = $a->golongan instanceof \BackedEnum ? $a->golongan->value : (string) $a->golongan;

            if ($jenis === 'kir') {
                $rows[] = [
                    $idx + 1,
                    $a->kode_barang,
                    $a->nomor_register,
                    $a->nama_barang,
                    $a->merk_tipe ?? '-',
                    $a->tahun_perolehan,
                    strtoupper($kondisi),
                    $a->pegawai?->nama ?? ($a->ruangan?->penanggungJawab?->nama ?? '-'),
                    $nilai,
                ];
            } elseif ($jenis === 'kib_a') {
                $detail = $a->detailTanah;
                $rows[] = [
                    $idx + 1,
                    $a->kode_barang,
                    $a->nomor_register,
                    $a->nama_barang,
                    $detail?->luas_m2 ?? '-',
                    $a->tahun_perolehan,
                    $detail?->alamat_letak ?? '-',
                    $detail?->hak_tanah ?? '-',
                    $detail?->nomor_sertifikat ?? '-',
                    $detail?->penggunaan ?? '-',
                    $nilai,
                ];
            } elseif ($jenis === 'kib_b') {
                $detail = $a->detailPeralatan;
                $rows[] = [
                    $idx + 1,
                    $a->kode_barang,
                    $a->nomor_register,
                    $a->nama_barang,
                    $detail?->merk ?? ($a->merk_tipe ?? '-'),
                    $detail?->kapasitas_cc ?? '-',
                    $detail?->bahan ?? '-',
                    $a->tahun_perolehan,
                    $detail?->nomor_polisi ?? ($detail?->nomor_rangka ?? '-'),
                    strtoupper($kondisi),
                    $a->ruangan?->nama_ruangan ?? '-',
                    $nilai,
                ];
            } elseif ($jenis === 'kib_c') {
                $detail = $a->detailGedung;
                $rows[] = [
                    $idx + 1,
                    $a->kode_barang,
                    $a->nomor_register,
                    $a->nama_barang,
                    strtoupper($kondisi),
                    $detail?->bertingkat ? 'Bertingkat' : 'Tidak',
                    $detail?->beton ? 'Beton' : 'Bukan Beton',
                    $detail?->luas_lantai_m2 ?? '-',
                    $detail?->lokasi ?? '-',
                    $a->tahun_perolehan,
                    $nilai,
                ];
            } elseif ($jenis === 'kib_d') {
                $detail = $a->detailJalan;
                $rows[] = [
                    $idx + 1,
                    $a->kode_barang,
                    $a->nomor_register,
                    $a->nama_barang,
                    $detail?->konstruksi ?? '-',
                    $detail?->panjang ?? '-',
                    $detail?->lebar ?? '-',
                    $detail?->lokasi ?? '-',
                    $a->tahun_perolehan,
                    strtoupper($kondisi),
                    $nilai,
                ];
            } elseif ($jenis === 'kib_e') {
                $detail = $a->detailLainnya;
                $rows[] = [
                    $idx + 1,
                    $a->kode_barang,
                    $a->nomor_register,
                    $a->nama_barang,
                    $detail?->judul_buku_pencipta ?? ($detail?->asal_usul ?? '-'),
                    $detail?->spesifikasi ?? '-',
                    $detail?->jumlah ?? 1,
                    $a->tahun_perolehan,
                    strtoupper($kondisi),
                    $a->ruangan?->nama_ruangan ?? '-',
                    $nilai,
                ];
            } elseif ($jenis === 'kib_f') {
                $detail = $a->detailKdp;
                $rows[] = [
                    $idx + 1,
                    $a->kode_barang,
                    $a->nomor_register,
                    $a->nama_barang,
                    $detail?->bertingkat ? 'Bertingkat' : 'Tidak',
                    $detail?->beton ? 'Beton' : 'Bukan Beton',
                    $detail?->luas_m2 ?? '-',
                    $detail?->lokasi ?? '-',
                    $detail?->tanggal_mulai?->format('d/m/Y') ?? '-',
                    $nilai,
                ];
            } else {
                // Buku Inventaris
                $rows[] = [
                    $idx + 1,
                    $a->kode_barang,
                    $a->nomor_register,
                    $a->nama_barang,
                    $a->merk_tipe ?? '-',
                    "Golongan {$golongan}",
                    $a->tahun_perolehan,
                    strtoupper($kondisi),
                    $a->ruangan?->nama_ruangan ?? '-',
                    $a->pegawai?->nama ?? '-',
                    $nilai,
                ];
            }
        }

        // Summary row for financial totals
        if (in_array($jenis, ['kib_a', 'kib_b', 'kib_c', 'kib_d', 'kib_e', 'kib_f', 'kir', 'buku_inventaris', 'rekap'])) {
            $totalColIndex = ($jenis === 'kib_a' || $jenis === 'kib_b' || $jenis === 'kib_c' || $jenis === 'kib_d' || $jenis === 'kib_e' || $jenis === 'kib_f' || $jenis === 'buku_inventaris' || $jenis === 'rekap') ? 11 : 9;
            $emptyCols = array_fill(0, $totalColIndex - 2, '');
            $rows[] = array_merge(['', 'TOTAL NILAI BMD'], $emptyCols, [$totalNilai]);
        }

        return $rows;
    }

    public function styles(Worksheet $sheet): array
    {
        $sheet->getStyle('A1:L3')->getFont()->setBold(true);
        $sheet->getStyle('A1')->getFont()->setSize(13);
        $sheet->getStyle('A2')->getFont()->setSize(11);
        $sheet->getStyle('A5:L5')->getFont()->setBold(true);
        $sheet->getStyle('A5:L5')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFE2F0D9');
        $sheet->getStyle('A5:L5')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        return [];
    }
}
