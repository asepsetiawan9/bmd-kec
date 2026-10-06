<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\GolonganKib;
use App\Enums\KondisiAset;
use App\Enums\StatusAset;
use App\Models\Aset;
use App\Models\LogAktivitas;
use App\Models\Pegawai;
use App\Models\Ruangan;
use App\Services\AsetService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AsetController extends Controller
{
    public function __construct(
        protected AsetService $asetService
    ) {}

    /**
     * Display a listing of assets.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Aset::class);

        $search = $request->query('search');
        $kondisiParam = $request->query('kondisi');
        $kondisi = $kondisiParam ? KondisiAset::tryFrom((string) $kondisiParam) : null;
        $golonganParam = $request->query('golongan');
        $golongan = $golonganParam ? GolonganKib::tryFrom((string) $golonganParam) : null;
        $ruanganId = $request->query('ruangan_id') ? (int) $request->query('ruangan_id') : null;
        $tahun = $request->query('tahun') ? (int) $request->query('tahun') : null;
        $statusParam = $request->query('status');
        $status = $statusParam ? StatusAset::tryFrom((string) $statusParam) : null;
        $overdueOnly = $request->boolean('overdue');

        $assets = $this->asetService->getList(
            perPage: 15,
            search: $search ? (string) $search : null,
            kondisi: $kondisi,
            golongan: $golongan,
            ruanganId: $ruanganId,
            tahun: $tahun,
            status: $status,
            overdueOnly: $overdueOnly
        );

        $statistics = $this->asetService->getStatistics();
        $ruanganList = Ruangan::aktif()->orderBy('nama')->get(['id', 'nama', 'kode']);

        return Inertia::render('Aset/Index', [
            'assets' => $assets,
            'statistics' => $statistics,
            'ruanganList' => $ruanganList,
            'filters' => [
                'search' => $search ?? '',
                'kondisi' => $kondisiParam ?? '',
                'golongan' => $golonganParam ?? '',
                'ruangan_id' => $ruanganId ? (string) $ruanganId : '',
                'tahun' => $tahun ? (string) $tahun : '',
                'status' => $statusParam ?? '',
                'overdue' => $overdueOnly,
            ],
        ]);
    }

    /**
     * Show the form for creating a new asset.
     */
    /**
     * Show the form for creating a new asset.
     */
    public function create(): Response
    {
        Gate::authorize('create', Aset::class);

        $pegawaiList = Pegawai::aktif()->orderBy('nama')->get(['id', 'nama', 'nip', 'jabatan']);
        $ruanganList = Ruangan::aktif()->orderBy('nama')->get(['id', 'nama', 'kode']);

        return Inertia::render('Aset/Form', [
            'isEdit' => false,
            'pegawaiList' => $pegawaiList,
            'ruanganList' => $ruanganList,
            'golonganOptions' => GolonganKib::options(),
        ]);
    }

    /**
     * Store a newly created asset.
     */
    public function store(\App\Http\Requests\Aset\StoreAsetRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $foto = $request->file('foto');
        unset($validated['foto']);

        $aset = $this->asetService->createAset(
            data: $validated,
            foto: $foto,
            userId: (int) $request->user()->id
        );

        return redirect()
            ->route('aset.show', $aset->id)
            ->with('success', "Aset '{$aset->nama}' berhasil didaftarkan dengan nomor register {$aset->nomor_register}.");
    }

    /**
     * Display the specified asset. Read-only (no write on GET).
     */
    public function show(Aset $aset): Response
    {
        Gate::authorize('view', $aset);

        $aset->loadMissing([
            'ruangan',
            'pemegang',
            'refKodeBarang',
            'detailTanah',
            'detailPeralatan',
            'detailGedung',
            'detailJalan',
            'detailLainnya',
            'detailKdp',
            'dokumen.uploader',
            'mutasi.dariRuangan',
            'mutasi.keRuangan',
            'mutasi.dariPegawai',
            'mutasi.kePegawai',
            'pemeliharaan',
            'riwayat.user',
        ]);

        $pegawaiList = Pegawai::aktif()->orderBy('nama')->get(['id', 'nama', 'nip', 'jabatan']);
        $ruanganList = Ruangan::aktif()->orderBy('nama')->get(['id', 'nama', 'kode']);

        return Inertia::render('Aset/Detail', [
            'aset' => $aset,
            'pegawaiList' => $pegawaiList,
            'ruanganList' => $ruanganList,
        ]);
    }

    /**
     * Show the form for editing the asset.
     */
    public function edit(Aset $aset): Response
    {
        Gate::authorize('update', $aset);

        $aset->loadMissing([
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

        $pegawaiList = Pegawai::aktif()->orderBy('nama')->get(['id', 'nama', 'nip', 'jabatan']);
        $ruanganList = Ruangan::aktif()->orderBy('nama')->get(['id', 'nama', 'kode']);

        return Inertia::render('Aset/Form', [
            'isEdit' => true,
            'aset' => $aset,
            'pegawaiList' => $pegawaiList,
            'ruanganList' => $ruanganList,
            'golonganOptions' => GolonganKib::options(),
        ]);
    }

    /**
     * Update the specified asset.
     */
    public function update(\App\Http\Requests\Aset\UpdateAsetRequest $request, Aset $aset): RedirectResponse
    {
        $validated = $request->validated();

        $foto = $request->file('foto');
        unset($validated['foto']);

        $this->asetService->updateAset($aset, $validated, $foto);

        return redirect()
            ->route('aset.show', $aset->id)
            ->with('success', "Data aset '{$aset->nama}' berhasil diperbarui.");
    }

    /**
     * Download QR code PNG.
     */
    public function downloadQr(Aset $aset): BinaryFileResponse
    {
        Gate::authorize('view', $aset);

        if (! $aset->qr_code_path || ! Storage::disk('public')->exists($aset->qr_code_path)) {
            $this->asetService->generateQrCode($aset);
            $aset->refresh();
        }

        $fullPath = Storage::disk('public')->path($aset->qr_code_path);
        $downloadName = "QR_{$aset->kode_barang}_{$aset->nomor_register}.png";

        return response()->download($fullPath, $downloadName);
    }
}
