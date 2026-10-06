<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Hasil Inventarisasi / Sensus Fisik</title>
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
        <h4>LAPORAN HASIL SENSUS / INVENTARISASI FISIK BMD</h4>
        <span>Status Per Tanggal: {{ now()->translatedFormat('d F Y') }}</span>
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th width="3%">No</th>
                <th width="14%">Kode Barang</th>
                <th width="8%">Register</th>
                <th width="20%">Nama Barang</th>
                <th width="14%">Ruangan Buku</th>
                <th width="11%">Hasil Fisik</th>
                <th width="10%">Kondisi Temuan</th>
                <th width="12%">Ruangan Temuan</th>
                <th width="8%">Pemeriksa</th>
            </tr>
        </thead>
        <tbody>
            @forelse($opnameItems as $index => $item)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td class="text-center font-mono">{{ $item->aset?->kode_barang ?? '-' }}</td>
                    <td class="text-center font-mono">{{ $item->aset?->nomor_register ?? '-' }}</td>
                    <td><strong>{{ $item->aset?->nama_barang ?? '-' }}</strong></td>
                    <td>{{ $item->aset?->ruangan?->nama_ruangan ?? '-' }}</td>
                    <td class="text-center"><strong>{{ strtoupper(str_replace('_', ' ', (string) $item->hasil)) }}</strong></td>
                    <td class="text-center">{{ strtoupper(str_replace('_', ' ', (string) $item->kondisi_temuan)) }}</td>
                    <td>{{ $item->ruanganTemuan?->nama_ruangan ?? ($item->aset?->ruangan?->nama_ruangan ?? '-') }}</td>
                    <td class="text-center">{{ $item->pemeriksa?->name ?? '-' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="9" class="text-center" style="padding: 15px; color: #64748b;">
                        Belum ada item sensus inventarisasi yang dicek.
                    </td>
                </tr>
            @endforelse
        </tbody>
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
        </tr>
    </table>
</body>
</html>
