<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\AksiRiwayatAset;
use App\Enums\GolonganKib;
use App\Enums\KondisiAset;
use App\Enums\StatusAset;
use App\Models\Aset;
use App\Models\AsetDetailGedung;
use App\Models\AsetDetailJalan;
use App\Models\AsetDetailKdp;
use App\Models\AsetDetailLainnya;
use App\Models\AsetDetailPeralatan;
use App\Models\AsetDetailTanah;
use App\Models\RefKodeBarang;
use App\Repositories\AsetRepository;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AsetService
{
    public function __construct(
        protected AsetRepository $asetRepository,
        protected NomorRegistrasiGeneratorService $nomorRegistrasiService,
        protected RiwayatAsetService $riwayatAsetService
    ) {}

    /**
     * @return LengthAwarePaginator<Aset>
     */
    public function getList(
        int $perPage = 15,
        ?string $search = null,
        ?KondisiAset $kondisi = null,
        ?GolonganKib $golongan = null,
        ?int $ruanganId = null,
        ?int $tahun = null,
        ?StatusAset $status = null,
        bool $overdueOnly = false
    ): LengthAwarePaginator {
        return $this->asetRepository->paginate(
            perPage: $perPage,
            search: $search,
            kondisi: $kondisi,
            golongan: $golongan,
            ruanganId: $ruanganId,
            tahun: $tahun,
            status: $status,
            overdueOnly: $overdueOnly
        );
    }

    public function getStatistics(): array
    {
        return $this->asetRepository->getStatistik();
    }

    public function generateQrCode(Aset $aset): string
    {
        $token = $aset->qr_token ?: (string) Str::ulid();
        $url = url("/scan/{$token}");

        $qrCode = QrCode::create($url)
            ->setSize(320)
            ->setMargin(10);

        $writer = new PngWriter();
        $result = $writer->write($qrCode);

        $filename = "qr_{$token}.png";
        $relativePath = "qr_codes/{$filename}";

        Storage::disk('public')->put($relativePath, $result->getString());

        $aset->updateQuietly([
            'qr_token' => $token,
            'qr_code_path' => $relativePath,
        ]);

        return $relativePath;
    }

    /**
     * Create asset with atomic registration number, subdetail table, and QR generation.
     *
     * @param array<string, mixed> $data
     */
    public function createAset(array $data, ?UploadedFile $foto = null, ?int $userId = null): Aset
    {
        return DB::transaction(function () use ($data, $foto, $userId) {
            if ($foto !== null) {
                $ext = $foto->getClientOriginalExtension();
                $safeName = 'foto_aset_' . time() . '_' . uniqid() . '.' . $ext;
                $data['foto_path'] = $foto->storeAs('aset_fotos', $safeName, 'public');
            }

            // Link ref_kode_barang_id if not explicitly provided
            if (empty($data['ref_kode_barang_id']) && ! empty($data['kode_barang'])) {
                $ref = RefKodeBarang::where('kode', $data['kode_barang'])->first();
                if ($ref) {
                    $data['ref_kode_barang_id'] = $ref->id;
                    if (empty($data['golongan']) && $ref->golongan_kib) {
                        $data['golongan'] = $ref->golongan_kib;
                    }
                }
            }

            if (! isset($data['nomor_register']) || empty($data['nomor_register'])) {
                $data['nomor_register'] = $this->nomorRegistrasiService->generate($data['kode_barang']);
            }

            if (! isset($data['qr_token'])) {
                $data['qr_token'] = (string) Str::ulid();
            }

            $currentUserId = $userId ?? Auth::id();
            $data['created_by'] = $currentUserId;

            // Separate main attributes from detail attributes
            $mainAttributes = $this->extractMainAttributes($data);
            $aset = $this->asetRepository->create($mainAttributes);

            // Save Golongan-specific subdetail
            $golonganValue = $aset->golongan instanceof GolonganKib ? $aset->golongan->value : (string) $aset->golongan;
            $this->saveDetailSubtable($aset, $data, $golonganValue);

            // Generate physical QR Code PNG
            $this->generateQrCode($aset);

            return $aset->fresh([
                'ruangan',
                'pemegang',
                'refKodeBarang',
                'detailTanah',
                'detailPeralatan',
                'detailGedung',
                'detailJalan',
                'detailLainnya',
                'detailKdp',
            ]);
        });
    }

    /**
     * Update asset with subdetail table sync and physical QR regeneration if code changes.
     *
     * @param array<string, mixed> $data
     */
    public function updateAset(Aset $aset, array $data, ?UploadedFile $foto = null): Aset
    {
        return DB::transaction(function () use ($aset, $data, $foto) {
            $dataSebelum = $aset->toArray();
            $kodeChanged = isset($data['kode_barang']) && $data['kode_barang'] !== $aset->kode_barang;

            if ($foto !== null) {
                if ($aset->foto_path && Storage::disk('public')->exists($aset->foto_path)) {
                    Storage::disk('public')->delete($aset->foto_path);
                }

                $ext = $foto->getClientOriginalExtension();
                $safeName = 'foto_aset_' . time() . '_' . uniqid() . '.' . $ext;
                $data['foto_path'] = $foto->storeAs('aset_fotos', $safeName, 'public');
            }

            $data['updated_by'] = Auth::id();

            $mainAttributes = $this->extractMainAttributes($data);
            $this->asetRepository->update($aset, $mainAttributes);

            $golonganValue = $aset->golongan instanceof GolonganKib ? $aset->golongan->value : (string) $aset->golongan;
            $this->saveDetailSubtable($aset, $data, $golonganValue);

            if ($kodeChanged || ! $aset->qr_code_path) {
                $this->generateQrCode($aset);
            }

            return $aset->fresh([
                'ruangan',
                'pemegang',
                'refKodeBarang',
                'detailTanah',
                'detailPeralatan',
                'detailGedung',
                'detailJalan',
                'detailLainnya',
                'detailKdp',
            ]);
        });
    }

    /**
     * Extract attributes destined for the main `aset` table.
     */
    protected function extractMainAttributes(array $data): array
    {
        $fillable = [
            'ref_kode_barang_id',
            'kode_barang',
            'nomor_register',
            'golongan',
            'nama',
            'merk_type',
            'spesifikasi',
            'tanggal_perolehan',
            'tahun_perolehan',
            'cara_perolehan',
            'sumber_dana',
            'nilai_perolehan',
            'satuan',
            'kondisi',
            'status',
            'ruangan_id',
            'pemegang_id',
            'tanggal_verifikasi_fisik',
            'foto_path',
            'qr_token',
            'qr_code_path',
            'keterangan',
            'created_by',
            'updated_by',
        ];

        return array_intersect_key($data, array_flip($fillable));
    }

    /**
     * Save / update the specific subdetail row according to Golongan KIB (A–F).
     */
    protected function saveDetailSubtable(Aset $aset, array $data, string $golongan): void
    {
        match (strtoupper($golongan)) {
            'A' => AsetDetailTanah::updateOrCreate(
                ['aset_id' => $aset->id],
                [
                    'luas_m2' => $data['luas_m2'] ?? null,
                    'alamat' => $data['alamat'] ?? null,
                    'status_hak' => $data['status_hak'] ?? null,
                    'nomor_sertifikat' => $data['nomor_sertifikat'] ?? null,
                    'tanggal_sertifikat' => $data['tanggal_sertifikat'] ?? null,
                    'penggunaan' => $data['penggunaan'] ?? null,
                ]
            ),
            'B' => AsetDetailPeralatan::updateOrCreate(
                ['aset_id' => $aset->id],
                [
                    'ukuran_cc' => $data['ukuran_cc'] ?? null,
                    'bahan' => $data['bahan'] ?? null,
                    'nomor_pabrik' => $data['nomor_pabrik'] ?? null,
                    'nomor_rangka' => $data['nomor_rangka'] ?? null,
                    'nomor_mesin' => $data['nomor_mesin'] ?? null,
                    'nomor_polisi' => $data['nomor_polisi'] ?? null,
                    'nomor_bpkb' => $data['nomor_bpkb'] ?? null,
                    'tanggal_pajak' => $data['tanggal_pajak'] ?? null,
                ]
            ),
            'C' => AsetDetailGedung::updateOrCreate(
                ['aset_id' => $aset->id],
                [
                    'kondisi_bangunan' => $data['kondisi_bangunan'] ?? null,
                    'bertingkat' => isset($data['bertingkat']) ? (bool) $data['bertingkat'] : false,
                    'beton' => isset($data['beton']) ? (bool) $data['beton'] : true,
                    'luas_lantai_m2' => $data['luas_lantai_m2'] ?? null,
                    'alamat' => $data['alamat'] ?? null,
                    'nomor_dokumen' => $data['nomor_dokumen'] ?? null,
                    'tanggal_dokumen' => $data['tanggal_dokumen'] ?? null,
                    'luas_tanah_m2' => $data['luas_tanah_m2'] ?? null,
                    'status_tanah' => $data['status_tanah'] ?? null,
                    'kode_tanah' => $data['kode_tanah'] ?? null,
                ]
            ),
            'D' => AsetDetailJalan::updateOrCreate(
                ['aset_id' => $aset->id],
                [
                    'konstruksi' => $data['konstruksi'] ?? null,
                    'panjang_m' => $data['panjang_m'] ?? null,
                    'lebar_m' => $data['lebar_m'] ?? null,
                    'luas_m2' => $data['luas_m2'] ?? null,
                    'alamat' => $data['alamat'] ?? null,
                    'nomor_dokumen' => $data['nomor_dokumen'] ?? null,
                    'status_tanah' => $data['status_tanah'] ?? null,
                ]
            ),
            'E' => AsetDetailLainnya::updateOrCreate(
                ['aset_id' => $aset->id],
                [
                    'judul_pencipta' => $data['judul_pencipta'] ?? null,
                    'spesifikasi_buku' => $data['spesifikasi_buku'] ?? null,
                    'asal_daerah' => $data['asal_daerah'] ?? null,
                    'pencipta' => $data['pencipta'] ?? null,
                    'bahan' => $data['bahan'] ?? null,
                    'jenis_hewan_tumbuhan' => $data['jenis_hewan_tumbuhan'] ?? null,
                    'ukuran' => $data['ukuran'] ?? null,
                ]
            ),
            'F' => AsetDetailKdp::updateOrCreate(
                ['aset_id' => $aset->id],
                [
                    'bangunan' => $data['bangunan'] ?? null,
                    'bertingkat' => isset($data['bertingkat']) ? (bool) $data['bertingkat'] : false,
                    'beton' => isset($data['beton']) ? (bool) $data['beton'] : true,
                    'luas_m2' => $data['luas_m2'] ?? null,
                    'alamat' => $data['alamat'] ?? null,
                    'tanggal_mulai' => $data['tanggal_mulai'] ?? null,
                    'status_tanah' => $data['status_tanah'] ?? null,
                    'nilai_kontrak' => $data['nilai_kontrak'] ?? null,
                ]
            ),
            default => null,
        };
    }
}
