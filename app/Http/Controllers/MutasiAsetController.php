<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\StatusAset;
use App\Http\Requests\StoreMutasiRequest;
use App\Models\Aset;
use App\Models\Pegawai;
use App\Models\Ruangan;
use App\Repositories\MutasiAsetRepository;
use App\Services\MutasiAsetService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class MutasiAsetController extends Controller
{
    public function __construct(
        protected MutasiAsetRepository $repository,
        protected MutasiAsetService $service
    ) {}

    public function index(Request $request): InertiaResponse
    {
        $filters = $request->only(['search', 'nomor_bast', 'jenis', 'ruangan_id']);
        $mutasis = $this->repository->getPaginated($filters);
        $ruangans = Ruangan::where('is_active', true)->orderBy('nama')->get(['id', 'nama', 'kode']);

        return Inertia::render('Mutasi/Index', [
            'mutasis' => $mutasis,
            'ruangans' => $ruangans,
            'filters' => $filters,
        ]);
    }

    public function create(Request $request): InertiaResponse
    {
        $selectedIds = $request->query('aset_ids', []);
        if (is_string($selectedIds)) {
            $selectedIds = array_filter(explode(',', $selectedIds));
        }

        $asets = Aset::with(['ruangan', 'pemegang'])
            ->where('status', StatusAset::AKTIF)
            ->orderBy('nama')
            ->get(['id', 'nama', 'kode_barang', 'nomor_register', 'golongan', 'kondisi', 'ruangan_id', 'pemegang_id']);

        $ruangans = Ruangan::where('is_active', true)->orderBy('nama')->get(['id', 'nama', 'kode']);
        $pegawais = Pegawai::where('is_active', true)->orderBy('nama')->get(['id', 'nama', 'nip', 'jabatan']);

        return Inertia::render('Mutasi/Create', [
            'asets' => $asets,
            'ruangans' => $ruangans,
            'pegawais' => $pegawais,
            'preselectedAsetIds' => array_map('intval', (array) $selectedIds),
        ]);
    }

    public function store(StoreMutasiRequest $request): RedirectResponse
    {
        $result = $this->service->prosesMutasi($request->validated(), $request->user());

        return redirect()->route('mutasi.index')->with(
            'success',
            "Mutasi sebanyak {$result['mutasi_count']} aset berhasil diproses. Berita Acara: {$result['nomor_bast']}"
        );
    }

    public function show(Request $request, ?string $nomorBast = null): InertiaResponse
    {
        $nomorBast = $nomorBast ?? (string) $request->query('nomor_bast');
        $items = $this->repository->getByNomorBast($nomorBast);

        if ($items->isEmpty()) {
            abort(404, 'Berita Acara Mutasi tidak ditemukan.');
        }

        return Inertia::render('Mutasi/Show', [
            'nomorBast' => $nomorBast,
            'items' => $items,
            'info' => $items->first(),
        ]);
    }

    public function printBast(Request $request, ?string $nomorBast = null): Response
    {
        $nomorBast = $nomorBast ?? (string) $request->query('nomor_bast');
        return $this->service->generateBastPdf($nomorBast);
    }
}
