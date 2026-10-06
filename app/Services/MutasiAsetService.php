<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\AksiRiwayatAset;
use App\Enums\JenisMutasi;
use App\Enums\StatusAset;
use App\Models\Aset;
use App\Models\MutasiAset;
use App\Models\Pengaturan;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MutasiAsetService
{
    public function __construct(
        protected NomorBastGeneratorService $bastGenerator,
        protected RiwayatAsetService $riwayatAsetService
    ) {}

    /**
     * Memproses mutasi aset secara atomik.
     *
     * @param array<string, mixed> $data
     * @return array{nomor_bast: string, mutasi_count: int}
     * @throws ValidationException
     */
    public function prosesMutasi(array $data, User $actor): array
    {
        $asetIds = $data['aset_ids'];
        $asets = Aset::with(['ruangan', 'pemegang'])->whereIn('id', $asetIds)->get();

        if ($asets->count() !== count($asetIds)) {
            throw ValidationException::withMessages([
                'aset_ids' => 'Satu atau lebih aset yang dipilih tidak ditemukan dalam sistem.',
            ]);
        }

        // BR-MUT-02: Aset berstatus diusulkan_hapus, dihapus, hilang tidak bisa dimutasi.
        foreach ($asets as $aset) {
            if (in_array($aset->status, [StatusAset::DIUSULKAN_HAPUS, StatusAset::DIHAPUS, StatusAset::HILANG], true)) {
                throw ValidationException::withMessages([
                    'aset_ids' => "Aset '{$aset->nama}' (Register: {$aset->nomor_register}) berstatus {$aset->status->label()} sehingga tidak dapat dimutasi.",
                ]);
            }

            // BR-MUT-01: Tujuan mutasi tidak boleh sama dengan lokasi & pemegang saat ini
            $samaRuangan = ! empty($data['ke_ruangan_id']) && (int) $aset->ruangan_id === (int) $data['ke_ruangan_id'];
            $samaPegawai = ! empty($data['ke_pegawai_id']) && (int) $aset->pemegang_id === (int) $data['ke_pegawai_id'];

            if ($samaRuangan && (empty($data['ke_pegawai_id']) || $samaPegawai)) {
                throw ValidationException::withMessages([
                    'ke_ruangan_id' => "Aset '{$aset->nama}' sudah berada di ruangan tujuan tersebut.",
                ]);
            }
        }

        $tanggal = $data['tanggal'] ?? date('Y-m-d');
        $tahun = (int) date('Y', strtotime($tanggal));
        $bulan = (int) date('n', strtotime($tanggal));

        return DB::transaction(function () use ($data, $asets, $actor, $tanggal, $tahun, $bulan) {
            $nomorBast = $this->bastGenerator->generate($tahun, $bulan);
            $jenis = JenisMutasi::tryFrom($data['jenis'] ?? 'pindah_ruangan') ?? JenisMutasi::PINDAH_RUANGAN;

            foreach ($asets as $aset) {
                $dariRuanganId = $aset->ruangan_id;
                $dariPegawaiId = $aset->pemegang_id;
                $keRuanganId = ! empty($data['ke_ruangan_id']) ? (int) $data['ke_ruangan_id'] : $dariRuanganId;
                $kePegawaiId = array_key_exists('ke_pegawai_id', $data)
                    ? ($data['ke_pegawai_id'] ? (int) $data['ke_pegawai_id'] : null)
                    : $dariPegawaiId;

                $dataSebelum = [
                    'ruangan_id' => $dariRuanganId,
                    'ruangan' => $aset->ruangan?->nama,
                    'pemegang_id' => $dariPegawaiId,
                    'pemegang' => $aset->pemegang?->nama,
                ];

                // Update lokasi dan pemegang aset induk
                $aset->update([
                    'ruangan_id' => $keRuanganId,
                    'pemegang_id' => $kePegawaiId,
                ]);

                // Simpan transaksi mutasi
                $mutasi = MutasiAset::create([
                    'nomor_bast' => $nomorBast,
                    'aset_id' => $aset->id,
                    'jenis' => $jenis,
                    'dari_ruangan_id' => $dariRuanganId,
                    'ke_ruangan_id' => $keRuanganId,
                    'dari_pegawai_id' => $dariPegawaiId,
                    'ke_pegawai_id' => $kePegawaiId,
                    'tanggal' => $tanggal,
                    'alasan' => $data['alasan'] ?? null,
                    'dibuat_oleh' => $actor->id,
                ]);

                $aset->load(['ruangan', 'pemegang']);
                $dataSesudah = [
                    'ruangan_id' => $keRuanganId,
                    'ruangan' => $aset->ruangan?->nama,
                    'pemegang_id' => $kePegawaiId,
                    'pemegang' => $aset->pemegang?->nama,
                ];

                // Catat audit trail riwayat aset
                $this->riwayatAsetService->catat(
                    asetId: $aset->id,
                    aksi: AksiRiwayatAset::MUTASI,
                    keterangan: "Mutasi aset ({$jenis->label()}) dengan Berita Acara: {$nomorBast}. " . ($data['alasan'] ?? ''),
                    dataSebelum: $dataSebelum,
                    dataSesudah: $dataSesudah,
                    referensiType: MutasiAset::class,
                    referensiId: $mutasi->id,
                    userId: $actor->id
                );
            }

            return [
                'nomor_bast' => $nomorBast,
                'mutasi_count' => $asets->count(),
            ];
        });
    }

    /**
     * Menghasilkan dokumen cetak Berita Acara Serah Terima (BAST) resmi dalam format PDF.
     */
    public function generateBastPdf(string $nomorBast): Response
    {
        $mutasis = MutasiAset::with([
            'aset.ruangan',
            'aset.pemegang',
            'dariRuangan',
            'keRuangan',
            'dariPegawai',
            'kePegawai',
            'pembuat.pegawai',
        ])
            ->where('nomor_bast', $nomorBast)
            ->get();

        if ($mutasis->isEmpty()) {
            abort(404, 'Data Berita Acara Serah Terima (BAST) tidak ditemukan.');
        }

        $pertama = $mutasis->first();
        $pengaturan = [
            'nama_instansi' => Pengaturan::get('nama_instansi', 'Pemerintah Kecamatan Mekarmukti'),
            'kabupaten' => Pengaturan::get('kabupaten', 'Kabupaten Garut'),
            'alamat_kantor' => Pengaturan::get('alamat_kantor', 'Jl. Raya Mekarmukti No. 1, Garut'),
            'nama_camat' => Pengaturan::get('nama_camat', 'Drs. H. Agus Mulyana, M.Si'),
            'nip_camat' => Pengaturan::get('nip_camat', '197508122000031002'),
            'nama_pengurus_barang' => Pengaturan::get('nama_pengurus_barang', 'Ahmad Supriatna'),
            'nip_pengurus_barang' => Pengaturan::get('nip_pengurus_barang', '198804152011011003'),
        ];

        $pdf = Pdf::loadView('print.bast_mutasi', [
            'nomorBast' => $nomorBast,
            'mutasis' => $mutasis,
            'pertama' => $pertama,
            'pengaturan' => $pengaturan,
            'tanggal' => $pertama->tanggal,
        ])->setPaper('a4', 'portrait');

        $safeName = str_replace(['/', '\\'], '_', $nomorBast);

        return $pdf->stream("BAST-{$safeName}.pdf");
    }
}
