<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Berita Acara Serah Terima Mutasi - {{ $nomorBast }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 1.5cm 1.8cm 1.5cm 1.8cm;
        }
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11pt;
            line-height: 1.35;
            color: #000;
            margin: 0;
            padding: 0;
        }
        .kop {
            text-align: center;
            border-bottom: 3px double #000;
            padding-bottom: 8px;
            margin-bottom: 16px;
        }
        .kop h2 {
            font-size: 13pt;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: bold;
        }
        .kop h1 {
            font-size: 15pt;
            margin: 2px 0;
            text-transform: uppercase;
            font-weight: bold;
        }
        .kop p {
            font-size: 9.5pt;
            margin: 2px 0 0 0;
            font-style: italic;
        }
        .judul {
            text-align: center;
            margin: 12px 0 16px 0;
        }
        .judul h3 {
            font-size: 12pt;
            margin: 0;
            text-decoration: underline;
            text-transform: uppercase;
        }
        .judul p {
            font-size: 11pt;
            margin: 2px 0 0 0;
        }
        .narasi {
            text-align: justify;
            margin-bottom: 12px;
            text-indent: 28px;
        }
        .pihak-box {
            margin: 8px 0 12px 0;
            padding-left: 20px;
        }
        .pihak-box table {
            width: 100%;
            border-collapse: collapse;
        }
        .pihak-box td {
            padding: 2px 4px;
            vertical-align: top;
        }
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin: 14px 0;
            font-size: 10pt;
        }
        table.data-table th, table.data-table td {
            border: 1px solid #000;
            padding: 5px 6px;
        }
        table.data-table th {
            background-color: #f2f2f2;
            text-align: center;
            font-weight: bold;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .ttd-container {
            width: 100%;
            margin-top: 25px;
            border-collapse: collapse;
        }
        .ttd-container td {
            width: 50%;
            vertical-align: top;
            text-align: center;
        }
        .mengetahui {
            width: 100%;
            margin-top: 15px;
            text-align: center;
        }
    </style>
</head>
<body>

    <div class="kop">
        <h2>{{ $pengaturan['kabupaten'] }}</h2>
        <h1>{{ $pengaturan['nama_instansi'] }}</h1>
        <p>{{ $pengaturan['alamat_kantor'] }}</p>
    </div>

    <div class="judul">
        <h3>BERITA ACARA SERAH TERIMA BARANG MILIK DAERAH</h3>
        <p>Nomor: <strong>{{ $nomorBast }}</strong></p>
    </div>

    <div class="narasi">
        Pada hari ini, tanggal <strong>{{ \Carbon\Carbon::parse($tanggal)->translatedFormat('d F Y') }}</strong>, bertempat di Kantor {{ $pengaturan['nama_instansi'] }}, kami yang bertanda tangan di bawah ini:
    </div>

    <div class="pihak-box">
        <table>
            <tr>
                <td style="width: 25px;">1.</td>
                <td style="width: 120px;">Nama</td>
                <td style="width: 10px;">:</td>
                <td><strong>{{ $pertama->dariPegawai?->nama ?? $pengaturan['nama_pengurus_barang'] }}</strong></td>
            </tr>
            <tr>
                <td></td>
                <td>NIP</td>
                <td>:</td>
                <td>{{ $pertama->dariPegawai?->nip ?? $pengaturan['nip_pengurus_barang'] }}</td>
            </tr>
            <tr>
                <td></td>
                <td>Jabatan / Ruangan</td>
                <td>:</td>
                <td>{{ $pertama->dariPegawai?->jabatan ?? 'Pengurus Barang' }} / {{ $pertama->dariRuangan?->nama ?? '-' }}</td>
            </tr>
            <tr>
                <td></td>
                <td colspan="3" style="padding-top: 2px; font-style: italic;">Selanjutnya disebut sebagai <strong>PIHAK PERTAMA (Yang Menyerahkan)</strong>.</td>
            </tr>
            <tr><td colspan="4" style="height: 6px;"></td></tr>
            <tr>
                <td>2.</td>
                <td>Nama</td>
                <td>:</td>
                <td><strong>{{ $pertama->kePegawai?->nama ?? ($pertama->keRuangan?->nama ? 'Penanggung Jawab ' . $pertama->keRuangan->nama : '-') }}</strong></td>
            </tr>
            <tr>
                <td></td>
                <td>NIP</td>
                <td>:</td>
                <td>{{ $pertama->kePegawai?->nip ?? '-' }}</td>
            </tr>
            <tr>
                <td></td>
                <td>Jabatan / Ruangan</td>
                <td>:</td>
                <td>{{ $pertama->kePegawai?->jabatan ?? '-' }} / {{ $pertama->keRuangan?->nama ?? '-' }}</td>
            </tr>
            <tr>
                <td></td>
                <td colspan="3" style="padding-top: 2px; font-style: italic;">Selanjutnya disebut sebagai <strong>PIHAK KEDUA (Yang Menerima)</strong>.</td>
            </tr>
        </table>
    </div>

    <div class="narasi">
        PIHAK PERTAMA telah menyerahkan kepada PIHAK KEDUA dan PIHAK KEDUA telah menerima dari PIHAK PERTAMA sejumlah Barang Milik Daerah (BMD) dengan rincian sebagai berikut:
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 30px;">No</th>
                <th style="width: 110px;">Kode Barang</th>
                <th style="width: 65px;">Register</th>
                <th>Nama Barang / Spesifikasi</th>
                <th style="width: 60px;">Kondisi</th>
                <th style="width: 120px;">Tujuan Ruangan</th>
            </tr>
        </thead>
        <tbody>
            @foreach($mutasis as $index => $m)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td class="text-center">{{ $m->aset->kode_barang }}</td>
                <td class="text-center">{{ $m->aset->nomor_register }}</td>
                <td>
                    <strong>{{ $m->aset->nama }}</strong>
                    @if($m->aset->merk_type)
                        <br><span style="font-size: 9pt; color: #333;">Merk: {{ $m->aset->merk_type }}</span>
                    @endif
                </td>
                <td class="text-center">{{ $m->aset->kondisi->label() }}</td>
                <td class="text-center">{{ $m->keRuangan?->nama ?? '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="narasi">
        Demikian Berita Acara Serah Terima ini dibuat dalam rangkap yang cukup dan mempunyai kekuatan hukum yang sama untuk dapat dipergunakan sebagaimana mestinya.
    </div>

    <table class="ttd-container">
        <tr>
            <td>
                Yang Menerima,<br>
                <strong>PIHAK KEDUA</strong>
                <br><br><br><br>
                <u><strong>{{ $pertama->kePegawai?->nama ?? '__________________________' }}</strong></u><br>
                NIP. {{ $pertama->kePegawai?->nip ?? '-' }}
            </td>
            <td>
                Yang Menyerahkan,<br>
                <strong>PIHAK PERTAMA</strong>
                <br><br><br><br>
                <u><strong>{{ $pertama->dariPegawai?->nama ?? $pengaturan['nama_pengurus_barang'] }}</strong></u><br>
                NIP. {{ $pertama->dariPegawai?->nip ?? $pengaturan['nip_pengurus_barang'] }}
            </td>
        </tr>
    </table>

    <div class="mengetahui">
        Mengetahui,<br>
        <strong>CAMAT MEKARMUKTI</strong><br>
        Selaku Pengguna Barang
        <br><br><br><br>
        <u><strong>{{ $pengaturan['nama_camat'] }}</strong></u><br>
        NIP. {{ $pengaturan['nip_camat'] }}
    </div>

</body>
</html>
