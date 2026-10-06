<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StorePemeliharaanRequest;
use App\Models\Aset;
use App\Repositories\PemeliharaanRepository;
use App\Services\PemeliharaanService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class PemeliharaanController extends Controller
{
    public function __construct(
        protected PemeliharaanRepository $repository,
        protected PemeliharaanService $service
    ) {}

    public function index(Request $request): InertiaResponse
    {
        $filters = $request->only(['search', 'jenis', 'tahun', 'aset_id']);
        $pemeliharaans = $this->repository->getPaginated($filters);
        $totalBiayaTahunIni = $this->repository->getTotalBiaya((int) date('Y'));
        $totalBiayaSemua = $this->repository->getTotalBiaya();

        $asets = Aset::whereNull('deleted_at')
            ->orderBy('nama')
            ->get(['id', 'nama', 'kode_barang', 'nomor_register', 'kondisi']);

        return Inertia::render('Pemeliharaan/Index', [
            'pemeliharaans' => $pemeliharaans,
            'totalBiayaTahunIni' => $totalBiayaTahunIni,
            'totalBiayaSemua' => $totalBiayaSemua,
            'asets' => $asets,
            'filters' => $filters,
        ]);
    }

    public function store(StorePemeliharaanRequest $request): RedirectResponse
    {
        $this->service->catat($request->validated(), $request->user());

        return redirect()->back()->with('success', 'Catatan pemeliharaan aset berhasil disimpan.');
    }
}
