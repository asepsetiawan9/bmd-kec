<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>KIR - {{ $ruangan->nama_ruangan ?? 'KARTU INVENTARIS RUANGAN' }}</title>
    <style>
        @page {
            size: a4 landscape;
            margin: 12mm 10mm 15mm 10mm;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 8.5pt;
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
            font-size: 11pt;
            text-transform: uppercase;
            font-weight: 600;
        }
        .header h2 {
            margin: 2px 0;
            font-size: 13.5pt;
            font-weight: bold;
            text-transform: uppercase;
        }
        .header p {
            margin: 0;
            font-size: 8pt;
            color: #475569;
        }
        .title-box {
            text-align: center;
            margin-bottom: 12px;
        }
        .title-box h4 {
            margin: 0;
            font-size: 11.5pt;
            text-transform: uppercase;
            font-weight: bold;
            text-decoration: underline;
        }
        .meta-table {
            width: 100%;
            margin-bottom: 10px;
            font-size: 8pt;
        }
        .meta-table td {
            padding: 2px 4px;
        }
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        table.data-table th, table.data-table td {
            border: 1px solid #475569;
            padding: 4px 6px;
            font-size: 8pt;
        }
        table.data-table th {
            background-color: #f1f5f9;
            font-weight: bold;
            text-align: center;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .footer-signatures {
            width: 100%;
            margin-top: 20px;
            page-break-inside: avoid;
        }
        .footer-signatures td {
            width: 33.33%;
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
        <h4>KARTU INVENTARIS RUANGAN (KIR)</h4>
        <span>Status Inventaris Per Tanggal: {{ now()->translatedFormat('d F Y') }}</span>
    </div>

    <table class="meta-table">
        <tr>
            <td width="15%"><strong>Nama Ruangan</strong></td>
            <td width="35%">: <strong>{{ $ruangan->nama_ruangan ?? '-' }}</strong></td>
            <td width="18%"><strong>Kode Ruangan</strong></td>
            <td width="32%">: {{ $ruangan->kode_ruangan ?? '-' }}</td>
        </tr>
        <tr>
            <td><strong>Penanggung Jawab</strong></td>
            <td>: {{ $ruangan->penanggungJawab?->nama ?? '-' }}</td>
            <td><strong>NIP Penanggung Jawab</strong></td>
            <td>: {{ $ruangan->penanggungJawab?->nip ?? '-' }}</td>
        </tr>
    </table>

    <table class="data-table">
        <thead>
            <tr>
                <th width="4%">No</th>
                <th width="14%">Kode Barang</th>
                <th width="9%">Nomor Register</th>
                <th width="24%">Nama Barang / Jenis</th>
                <th width="15%">Merk / Tipe / Spesifikasi</th>
                <th width="6%">Tahun</th>
                <th width="8%">Kondisi</th>
                <th width="10%">Nilai Perolehan (Rp)</th>
                <th width="10%">Keterangan</th>
            </tr>
        </thead>
        <tbody>
            @php $totalNilai = 0; @endphp
            @forelse($asetList as $index => $aset)
                @php $totalNilai += (float) $aset->nilai_perolehan; @endphp
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td class="text-center font-mono">{{ $aset->kode_barang }}</td>
                    <td class="text-center font-mono">{{ $aset->nomor_register }}</td>
                    <td><strong>{{ $aset->nama_barang }}</strong></td>
                    <td>{{ $aset->merk_tipe ?? '-' }}</td>
                    <td class="text-center">{{ $aset->tahun_perolehan }}</td>
                    <td class="text-center">{{ strtoupper($aset->kondisi instanceof \BackedEnum ? $aset->kondisi->label() : (string) $aset->kondisi) }}</td>
                    <td class="text-right font-mono">{{ number_format((float) $aset->nilai_perolehan, 0, ',', '.') }}</td>
                    <td>{{ $aset->pegawai?->nama ? 'Pemegang: ' . $aset->pegawai->nama : '-' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="9" class="text-center" style="padding: 15px; color: #64748b;">
                        Belum ada barang milik daerah yang terdaftar di ruangan ini.
                    </td>
                </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr style="background-color: #f8fafc; font-weight: bold;">
                <td colspan="7" class="text-right">TOTAL NILAI BARANG DI RUANGAN:</td>
                <td class="text-right font-mono">Rp {{ number_format($totalNilai, 0, ',', '.') }}</td>
                <td></td>
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
                NIP. {{ $settings['camat_nip'] ?? '19680512 199303 1 004' }}
            </td>
            <td>
                Mekarmukti, {{ now()->translatedFormat('d F Y') }}<br>
                <strong>PENGURUS BARANG PENGGUNA</strong><br>
                Kecamatan Mekarmukti
                <div class="signature-space"></div>
                <strong><u>{{ $settings['pengurus_barang_nama'] ?? 'ASEP SETIAWAN, S.IP' }}</u></strong><br>
                NIP. {{ $settings['pengurus_barang_nip'] ?? '19870815 201101 1 002' }}
            </td>
            <td>
                Penanggung Jawab Ruangan,<br>
                <strong>{{ $ruangan->nama_ruangan ?? 'Ruangan' }}</strong><br>
                Kecamatan Mekarmukti
                <div class="signature-space"></div>
                <strong><u>{{ $ruangan->penanggungJawab?->nama ?? '( ........................................ )' }}</u></strong><br>
                NIP. {{ $ruangan->penanggungJawab?->nip ?? '-' }}
            </td>
        </tr>
    </table>
</body>
</html>
