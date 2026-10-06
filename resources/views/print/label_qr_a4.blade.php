<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cetak Label QR BMD - {{ $instansi }}</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: Arial, Helvetica, sans-serif;
            background-color: #f3f4f6;
            color: #111827;
            padding: 20px;
        }

        .no-print {
            max-width: 210mm;
            margin: 0 auto 16px auto;
            background: #ffffff;
            padding: 12px 20px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .btn-print {
            background-color: #059669;
            color: #ffffff;
            border: none;
            padding: 8px 18px;
            font-size: 14px;
            font-weight: bold;
            border-radius: 6px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        .btn-print:hover {
            background-color: #047857;
        }

        .btn-back {
            color: #4b5563;
            text-decoration: none;
            font-size: 13px;
            font-weight: 600;
        }

        .a4-sheet {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto 20px auto;
            background: #ffffff;
            padding: 10mm 8mm;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-auto-rows: 64mm;
            gap: 4mm;
            page-break-after: always;
        }

        .label-card {
            border: 1.5px dashed #9ca3af;
            border-radius: 6px;
            padding: 3.5mm 3.5mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: #ffffff;
            position: relative;
            overflow: hidden;
        }

        .label-header {
            border-bottom: 1.2px solid #111827;
            padding-bottom: 2mm;
            margin-bottom: 2mm;
            text-align: center;
        }

        .label-header h5 {
            font-size: 7.5pt;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.2px;
            color: #111827;
            line-height: 1.1;
        }

        .label-header p {
            font-size: 6.5pt;
            font-weight: 700;
            text-transform: uppercase;
            color: #047857;
            margin-top: 1px;
        }

        .label-body {
            display: flex;
            align-items: center;
            gap: 3mm;
            flex: 1;
        }

        .label-qr {
            width: 24mm;
            height: 24mm;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            padding: 1mm;
            background: #ffffff;
        }

        .label-qr img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        .label-info {
            flex: 1;
            min-width: 0;
            font-size: 6.5pt;
            line-height: 1.35;
        }

        .info-row {
            margin-bottom: 1.5px;
        }

        .info-label {
            color: #4b5563;
            font-size: 5.5pt;
            text-transform: uppercase;
            font-weight: bold;
            display: block;
        }

        .info-val {
            font-weight: 700;
            color: #111827;
            word-break: break-word;
        }

        .info-nama {
            font-size: 7pt;
            font-weight: 800;
            color: #0f172a;
            max-height: 2.8em;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }

        .label-footer {
            border-top: 1px solid #e5e7eb;
            margin-top: 2mm;
            padding-top: 1.5mm;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 5.5pt;
            color: #6b7280;
            font-weight: 600;
        }

        .reg-badge {
            background-color: #ecfdf5;
            color: #065f46;
            border: 0.5px solid #a7f3d0;
            padding: 1px 4px;
            border-radius: 3px;
            font-weight: bold;
        }

        @media print {
            body {
                background: none;
                padding: 0;
            }

            .no-print {
                display: none !important;
            }

            .a4-sheet {
                box-shadow: none;
                margin: 0;
                padding: 8mm 6mm;
                width: 100%;
                min-height: auto;
            }

            .label-card {
                border-color: #6b7280;
            }
        }
    </style>
</head>
<body>

    <div class="no-print">
        <div>
            <h3 style="font-size: 16px; font-weight: bold;">Lembar Cetak Stiker QR Label BMD</h3>
            <p style="font-size: 12px; color: #6b7280;">Total {{ count($assets) }} aset terpilih &bull; Format 12 Stiker per Lembar A4</p>
        </div>
        <div style="display: flex; gap: 12px; align-items: center;">
            <a href="javascript:window.close()" class="btn-back">Tutup Halaman</a>
            <button onclick="window.print()" class="btn-print">
                🖨️ Cetak / Simpan PDF
            </button>
        </div>
    </div>

    @foreach($assets->chunk(12) as $chunk)
        <div class="a4-sheet">
            @foreach($chunk as $aset)
                <div class="label-card">
                    <div class="label-header">
                        <h5>{{ $kabupaten }}</h5>
                        <p>{{ $instansi }}</p>
                    </div>

                    <div class="label-body">
                        <div class="label-qr">
                            @if($aset->qr_code_path)
                                <img src="{{ asset('storage/' . $aset->qr_code_path) }}" alt="QR {{ $aset->kode_barang }}">
                            @endif
                        </div>

                        <div class="label-info">
                            <div class="info-row">
                                <span class="info-label">Nama Barang</span>
                                <span class="info-val info-nama">{{ $aset->nama }}</span>
                            </div>

                            <div class="info-row">
                                <span class="info-label">Kode Barang</span>
                                <span class="info-val">{{ $aset->kode_barang }}</span>
                            </div>

                            <div class="info-row">
                                <span class="info-label">Ruangan</span>
                                <span class="info-val">{{ $aset->ruangan?->nama ?? '-' }}</span>
                            </div>

                            <div class="info-row">
                                <span class="info-label">Tahun Perolehan</span>
                                <span class="info-val">{{ $aset->tahun_perolehan }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="label-footer">
                        <span class="reg-badge">REG: {{ $aset->nomor_register }}</span>
                        <span>SIMUKTI BMD</span>
                    </div>
                </div>
            @endforeach
        </div>
    @endforeach

</body>
</html>
