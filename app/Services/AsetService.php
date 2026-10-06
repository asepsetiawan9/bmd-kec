<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\GolonganKib;
use App\Enums\KondisiAset;
use App\Enums\StatusAset;
use App\Models\Aset;
use App\Models\Pengaturan;
use App\Repositories\AsetRepository;
use Barryvdh\DomPDF\Facade\Pdf;
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
        protected NomorRegistrasiGeneratorService $nomorRegistrasiService
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
        $url = url("/a/{$token}");

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
     * Create asset with atomic registration number & QR code generation.
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

            if (! isset($data['nomor_register']) || empty($data['nomor_register'])) {
                $data['nomor_register'] = $this->nomorRegistrasiService->generate($data['kode_barang']);
            }

            if (! isset($data['qr_token'])) {
                $data['qr_token'] = (string) Str::ulid();
            }

            $data['created_by'] = $userId ?? Auth::id();

            $aset = $this->asetRepository->create($data);

            $this->generateQrCode($aset);

            return $aset->fresh(['ruangan', 'pemegang', 'refKodeBarang']);
        });
    }

    /**
     * Update asset with automatic QR regeneration and physical check tracking.
     *
     * @param array<string, mixed> $data
     */
    public function updateAset(Aset $aset, array $data, ?UploadedFile $foto = null): Aset
    {
        return DB::transaction(function () use ($aset, $data, $foto) {
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
            $this->asetRepository->update($aset, $data);

            if ($kodeChanged || ! $aset->qr_code_path) {
                $this->generateQrCode($aset);
            }

            return $aset->fresh(['ruangan', 'pemegang', 'refKodeBarang']);
        });
    }
}
