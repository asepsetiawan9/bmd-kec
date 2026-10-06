<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>{{ $judulLaporan ?? 'KARTU INVENTARIS BARANG' }}</title>
    <style>
        @page {
            size: legal landscape;
            margin: 12mm 10mm 15mm 10mm;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 8pt;
            color: #0f172a;
            line-height: 1.3;
            margin: 0;
            padding: 0;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 6px;
            margin-bottom: 10px;
        }
        .header h3 {
            margin: 0;
            font-size: 10.5pt;
            text-transform: uppercase;
            font-weight: 600;
        }
        .header h2 {
            margin: 2px 0;
            font-size: 13pt;
            font-weight: bold;
            text-transform: uppercase;
        }
        .header p {
            margin: 0;
            font-size: 7.5pt;
            color: #475569;
        }
        .title-box {
            text-align: center;
            margin-bottom: 12px;
        }
        .title-box h4 {
            margin: 0;
            font-size: 11pt;
            text-transform: uppercase;
            font-weight: bold;
            text-decoration: underline;
        }
        .title-box span {
            font-size: 8pt;
            color: #475569;
        }
        table.meta-table {
            width: 100%;
            margin-bottom: 8px;
            font-size: 7.5pt;
        }
        table.meta-table td {
            padding: 2px 4px;
        }
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        table.data-table th, table.data-table td {
            border: 1px solid #475569;
            padding: 4px 5px;
            font-size: 7.5pt;
        }
        table.data-table th {
            background-color: #f1f5f9;
            font-weight: bold;
            text-align: center;
            vertical-align: middle;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .footer-signatures {
            width: 100%;
            margin-top: 20px;
            page-break-inside: avoid;
        }
        .footer-signatures td {
            width: 50%;
            text-align: center;
            vertical-align: top;
            font-size: 8pt;
        }
        .signature-space {
            height: 55px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h3>{{ $settings['kabupaten_nama'] ?? 'PEMERINTAH KABUPATEN GARUT' }}</h3>
        <h2>{{ $settings['instansi_nama'] ?? 'KECAMATAN MEKARMUKTI' }}</h2>
        <p>{{ $settings['instansi_alamat'] ?? 'Jalan Raya Mekarmukti No. 01, Kecamatan Mekarmukti, Kabupaten Garut, Jawa Barat 44165' }}</p>
    </div>

    <div class="title-box">
        <h4>{{ $judulLaporan ?? 'KARTU INVENTARIS BARANG (KIB)' }}</h4>
        <span>Periode / Status Per: {{ now()->translatedFormat('d F Y') }}</span>
    </div>

    <table class="meta-table">
        <tr>
            <td width="15%"><strong>SKPD / Unit Kerja</strong></td>
            <td width="35%">: {{ $settings['instansi_nama'] ?? 'Kecamatan Mekarmukti' }}</td>
            <td width="15%"><strong>Kode Lokasi</strong></td>
            <td width="35%">: {{ $settings['kode_lokasi'] ?? '12.05.26.01' }}</td>
        </tr>
        <tr>
            <td><strong>Klasifikasi Golongan</strong></td>
            <td>: {{ $golonganLabel ?? 'Semua Golongan' }}</td>
            <td><strong>Tahun Anggaran</strong></td>
            <td>: {{ $settings['tahun_aktif'] ?? date('Y') }}</td>
        </tr>
    </table>

    <table class="data-table">
        <thead>
            @if(($jenisLaporan ?? '') === 'kib_a')
                <tr>
                    <th rowspan="2" width="3%">No</th>
                    <th rowspan="2" width="12%">Nama Barang / Jenis</th>
                    <th colspan="2" width="18%">Nomor</th>
                    <th rowspan="2" width="7%">Luas (m²)</th>
                    <th rowspan="2" width="6%">Tahun Perolehan</th>
                    <th rowspan="2" width="16%">Letak / Alamat</th>
                    <th colspan="3" width="18%">Status Tanah</th>
                    <th rowspan="2" width="10%">Penggunaan</th>
                    <th rowspan="2" width="10%">Nilai Perolehan (Rp)</th>
                </tr>
                <tr>
                    <th>Kode Barang</th>
                    <th>Register</th>
                    <th>Hak</th>
                    <th>Tgl Sertifikat</th>
                    <th>Nomor Sertifikat</th>
                </tr>
            @elseif(($jenisLaporan ?? '') === 'kib_b')
                <tr>
                    <th rowspan="2" width="3%">No</th>
                    <th rowspan="2" width="13%">Nama Barang / Jenis</th>
                    <th colspan="2" width="16%">Nomor</th>
                    <th rowspan="2" width="12%">Merk / Tipe</th>
                    <th rowspan="2" width="8%">Ukuran / CC</th>
                    <th rowspan="2" width="7%">Bahan</th>
                    <th rowspan="2" width="5%">Tahun</th>
                    <th colspan="2" width="16%">Nomor Kendaraan / Mesin</th>
                    <th rowspan="2" width="8%">Kondisi</th>
                    <th rowspan="2" width="10%">Nilai Perolehan (Rp)</th>
                </tr>
                <tr>
                    <th>Kode Barang</th>
                    <th>Register</th>
                    <th>No Polisi</th>
                    <th>No Rangka / Mesin</th>
                </tr>
            @elseif(($jenisLaporan ?? '') === 'kib_c')
                <tr>
                    <th rowspan="2" width="3%">No</th>
                    <th rowspan="2" width="14%">Nama Barang / Gedung</th>
                    <th colspan="2" width="16%">Nomor</th>
                    <th rowspan="2" width="8%">Kondisi</th>
                    <th colspan="2" width="14%">Konstruksi Bangunan</th>
                    <th rowspan="2" width="7%">Luas Lantai (m²)</th>
                    <th rowspan="2" width="16%">Letak / Lokasi</th>
                    <th rowspan="2" width="6%">Tahun</th>
                    <th rowspan="2" width="10%">Nilai Perolehan (Rp)</th>
                </tr>
                <tr>
                    <th>Kode Barang</th>
                    <th>Register</th>
                    <th>Bertingkat</th>
                    <th>Beton</th>
                </tr>
            @elseif(($jenisLaporan ?? '') === 'kib_d')
                <tr>
                    <th rowspan="2" width="3%">No</th>
                    <th rowspan="2" width="15%">Nama Barang / Jaringan</th>
                    <th colspan="2" width="18%">Nomor</th>
                    <th rowspan="2" width="10%">Konstruksi</th>
                    <th rowspan="2" width="8%">Panjang (Km/m)</th>
                    <th rowspan="2" width="7%">Lebar (m)</th>
                    <th rowspan="2" width="15%">Letak / Lokasi</th>
                    <th rowspan="2" width="6%">Tahun</th>
                    <th rowspan="2" width="8%">Kondisi</th>
                    <th rowspan="2" width="10%">Nilai Perolehan (Rp)</th>
                </tr>
                <tr>
                    <th>Kode Barang</th>
                    <th>Register</th>
                </tr>
            @else
                <tr>
                    <th width="3%">No</th>
                    <th width="12%">Kode Barang</th>
                    <th width="8%">Register</th>
                    <th width="18%">Nama Barang</th>
                    <th width="12%">Merk / Spesifikasi</th>
                    <th width="6%">Tahun</th>
                    <th width="8%">Kondisi</th>
                    <th width="13%">Ruangan</th>
                    <th width="10%">Penanggung Jawab</th>
                    <th width="10%">Nilai Perolehan (Rp)</th>
                </tr>
            @endif
        </thead>
        <tbody>
            @php $totalNilai = 0; @endphp
            @forelse($asetList as $index => $aset)
                @php $totalNilai += (float) $aset->nilai_perolehan; @endphp
                @if(($jenisLaporan ?? '') === 'kib_a')
                    @php $detail = $aset->detailTanah; @endphp
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td><strong>{{ $aset->nama_barang }}</strong></td>
                        <td class="text-center">{{ $aset->kode_barang }}</td>
                        <td class="text-center">{{ $aset->nomor_register }}</td>
                        <td class="text-right">{{ number_format($detail?->luas_m2 ?? 0, 0, ',', '.') }}</td>
                        <td class="text-center">{{ $aset->tahun_perolehan }}</td>
                        <td>{{ $detail?->alamat_letak ?? '-' }}</td>
                        <td class="text-center">{{ $detail?->hak_tanah ?? '-' }}</td>
                        <td class="text-center">{{ $detail?->tanggal_sertifikat ? date('d/m/Y', strtotime($detail->tanggal_sertifikat)) : '-' }}</td>
                        <td>{{ $detail?->nomor_sertifikat ?? '-' }}</td>
                        <td>{{ $detail?->penggunaan ?? '-' }}</td>
                        <td class="text-right">{{ number_format((float) $aset->nilai_perolehan, 0, ',', '.') }}</td>
                    </tr>
                @elseif(($jenisLaporan ?? '') === 'kib_b')
                    @php $detail = $aset->detailPeralatan; @endphp
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td><strong>{{ $aset->nama_barang }}</strong></td>
                        <td class="text-center">{{ $aset->kode_barang }}</td>
                        <td class="text-center">{{ $aset->nomor_register }}</td>
                        <td>{{ $detail?->merk ?? ($aset->merk_tipe ?? '-') }}</td>
                        <td class="text-center">{{ $detail?->kapasitas_cc ?? '-' }}</td>
                        <td class="text-center">{{ $detail?->bahan ?? '-' }}</td>
                        <td class="text-center">{{ $aset->tahun_perolehan }}</td>
                        <td class="text-center">{{ $detail?->nomor_polisi ?? '-' }}</td>
                        <td>{{ $detail?->nomor_rangka ? 'Rangka: ' . $detail->nomor_rangka : ($detail?->nomor_mesin ? 'Mesin: ' . $detail->nomor_mesin : '-') }}</td>
                        <td class="text-center">{{ strtoupper($aset->kondisi instanceof \BackedEnum ? $aset->kondisi->label() : (string) $aset->kondisi) }}</td>
                        <td class="text-right">{{ number_format((float) $aset->nilai_perolehan, 0, ',', '.') }}</td>
                    </tr>
                @elseif(($jenisLaporan ?? '') === 'kib_c')
                    @php $detail = $aset->detailGedung; @endphp
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td><strong>{{ $aset->nama_barang }}</strong></td>
                        <td class="text-center">{{ $aset->kode_barang }}</td>
                        <td class="text-center">{{ $aset->nomor_register }}</td>
                        <td class="text-center">{{ strtoupper($aset->kondisi instanceof \BackedEnum ? $aset->kondisi->label() : (string) $aset->kondisi) }}</td>
                        <td class="text-center">{{ $detail?->bertingkat ? 'Ya' : 'Tidak' }}</td>
                        <td class="text-center">{{ $detail?->beton ? 'Beton' : 'Bukan' }}</td>
                        <td class="text-right">{{ number_format($detail?->luas_lantai_m2 ?? 0, 0, ',', '.') }}</td>
                        <td>{{ $detail?->lokasi ?? '-' }}</td>
                        <td class="text-center">{{ $aset->tahun_perolehan }}</td>
                        <td class="text-right">{{ number_format((float) $aset->nilai_perolehan, 0, ',', '.') }}</td>
                    </tr>
                @elseif(($jenisLaporan ?? '') === 'kib_d')
                    @php $detail = $aset->detailJalan; @endphp
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td><strong>{{ $aset->nama_barang }}</strong></td>
                        <td class="text-center">{{ $aset->kode_barang }}</td>
                        <td class="text-center">{{ $aset->nomor_register }}</td>
                        <td>{{ $detail?->konstruksi ?? '-' }}</td>
                        <td class="text-right">{{ number_format($detail?->panjang ?? 0, 0, ',', '.') }}</td>
                        <td class="text-right">{{ number_format($detail?->lebar ?? 0, 0, ',', '.') }}</td>
                        <td>{{ $detail?->lokasi ?? '-' }}</td>
                        <td class="text-center">{{ $aset->tahun_perolehan }}</td>
                        <td class="text-center">{{ strtoupper($aset->kondisi instanceof \BackedEnum ? $aset->kondisi->label() : (string) $aset->kondisi) }}</td>
                        <td class="text-right">{{ number_format((float) $aset->nilai_perolehan, 0, ',', '.') }}</td>
                    </tr>
                @else
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td class="text-center font-mono">{{ $aset->kode_barang }}</td>
                        <td class="text-center font-mono">{{ $aset->nomor_register }}</td>
                        <td><strong>{{ $aset->nama_barang }}</strong></td>
                        <td>{{ $aset->merk_tipe ?? '-' }}</td>
                        <td class="text-center">{{ $aset->tahun_perolehan }}</td>
                        <td class="text-center">{{ strtoupper($aset->kondisi instanceof \BackedEnum ? $aset->kondisi->label() : (string) $aset->kondisi) }}</td>
                        <td>{{ $aset->ruangan?->nama_ruangan ?? '-' }}</td>
                        <td>{{ $aset->pegawai?->nama ?? '-' }}</td>
                        <td class="text-right font-mono">{{ number_format((float) $aset->nilai_perolehan, 0, ',', '.') }}</td>
                    </tr>
                @endif
            @empty
                <tr>
                    <td colspan="12" class="text-center" style="padding: 15px; color: #64748b;">
                        Tidak ada data aset ditemukan untuk kriteria laporan ini.
                    </td>
                </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr style="background-color: #f8fafc; font-weight: bold;">
                <td colspan="{{ in_array(($jenisLaporan ?? ''), ['kib_a', 'kib_b', 'kib_c', 'kib_d']) ? 10 : 9 }}" class="text-right">
                    TOTAL NILAI PEROLEHAN BMD:
                </td>
                <td class="text-right" style="font-weight: bold;">
                    Rp {{ number_format($totalNilai, 0, ',', '.') }}
                </td>
            </tr>
        </tfoot>
    </table>

    <table class="footer-signatures">
        <tr>
            <td>
                Mengetahui,<br>
                <strong>CAMAT MEKARMUKTI</strong><br>
                Selaku Pengguna Barang
                <div class="signature-space"></div>
                <strong><u>{{ $settings['camat_nama'] ?? 'Drs. H. DUDUNG SUDRAJAT, M.Si' }}</u></strong><br>
                Pembina Tingkat I<br>
                NIP. {{ $settings['camat_nip'] ?? '19680512 199303 1 004' }}
            </td>
            <td>
                Mekarmukti, {{ now()->translatedFormat('d F Y') }}<br>
                <strong>PENGURUS BARANG PENGGUNA</strong><br>
                Kecamatan Mekarmukti
                <div class="signature-space"></div>
                <strong><u>{{ $settings['pengurus_barang_nama'] ?? 'ASEP SETIAWAN, S.IP' }}</u></strong><br>
                Penata Muda<br>
                NIP. {{ $settings['pengurus_barang_nip'] ?? '19870815 201101 1 002' }}
            </td>
        </tr>
    </table>
</body>
</html>
