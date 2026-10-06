<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreInventarisasiRequest;
use App\Models\Ruangan;
use App\Repositories\InventarisasiRepository;
use App\Services\InventarisasiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class InventarisasiController extends Controller
{
    public function __construct(
        protected InventarisasiRepository $repository,
        protected InventarisasiService $service
    ) {}

    public function index(Request $request): InertiaResponse
    {
        $filters = $request->only(['status', 'search']);
        $sessions = $this->repository->getPaginated($filters);
        $activeSession = $this->repository->getActiveSession();
        $activeProgress = $activeSession ? $this->repository->getProgress($activeSession->id) : null;
        $ruangans = Ruangan::where('is_active', true)->orderBy('nama')->get(['id', 'nama', 'kode']);

        return Inertia::render('Inventarisasi/Index', [
            'sessions' => $sessions,
            'activeSession' => $activeSession,
            'activeProgress' => $activeProgress,
            'ruangans' => $ruangans,
            'filters' => $filters,
        ]);
    }

    public function store(StoreInventarisasiRequest $request): RedirectResponse
    {
        $session = $this->service->createSesi($request->validated(), $request->user());

        return redirect()->route('inventarisasi.show', $session->id)->with(
            'success',
            "Sesi sensus '{$session->nama}' berhasil dibuat dan seluruh aset aktif telah di-snapshot."
        );
    }

    public function show(int $id, Request $request): InertiaResponse
    {
        $session = $this->repository->findById($id);
        if (! $session) {
            abort(404, 'Sesi inventarisasi tidak ditemukan.');
        }

        $filters = $request->only(['hasil', 'ruangan_id', 'search']);
        $items = $this->repository->getItems($id, $filters);
        $progress = $this->repository->getProgress($id);
        $ruangans = Ruangan::where('is_active', true)->orderBy('nama')->get(['id', 'nama', 'kode']);

        return Inertia::render('Inventarisasi/Show', [
            'session' => $session,
            'items' => $items,
            'progress' => $progress,
            'ruangans' => $ruangans,
            'filters' => $filters,
        ]);
    }

    public function sensusLapangan(int $id): InertiaResponse
    {
        $session = $this->repository->findById($id);
        if (! $session) {
            abort(404, 'Sesi inventarisasi tidak ditemukan.');
        }

        $progress = $this->repository->getProgress($id);
        $ruangans = Ruangan::where('is_active', true)->orderBy('nama')->get(['id', 'nama', 'kode']);

        return Inertia::render('Inventarisasi/SensusLapangan', [
            'session' => $session,
            'progress' => $progress,
            'ruangans' => $ruangans,
        ]);
    }

    public function searchItem(Request $request, int $id): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));
        if ($q === '') {
            return response()->json(['item' => null]);
        }

        $item = \App\Models\InventarisasiItem::with(['aset.ruangan', 'ruanganTemuan'])
            ->where('inventarisasi_id', $id)
            ->whereHas('aset', function ($sub) use ($q) {
                $sub->where('qr_token', $q)
                    ->orWhere('nomor_register', $q)
                    ->orWhere('kode_barang', $q)
                    ->orWhere('nama', 'like', "%{$q}%");
            })
            ->first();

        return response()->json(['item' => $item]);
    }

    public function checkItem(Request $request, int $id, int $asetId): JsonResponse|RedirectResponse
    {
        $request->validate([
            'hasil' => ['required', 'string', 'in:ditemukan,tidak_ditemukan'],
            'kondisi_temuan' => ['nullable', 'string', 'in:baik,rusak_ringan,rusak_berat'],
            'ruangan_temuan_id' => ['nullable', 'integer', 'exists:ruangan,id'],
            'catatan' => ['nullable', 'string', 'max:500'],
        ]);

        $item = $this->service->periksaItem($id, $asetId, $request->all(), $request->user());

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Status pemeriksaan aset berhasil diperbarui.',
                'item' => $item,
            ]);
        }

        return redirect()->back()->with('success', 'Status pemeriksaan fisik berhasil dicatat.');
    }

    public function tutup(int $id, Request $request): RedirectResponse
    {
        $this->service->tutupSesi($id, $request->user());

        return redirect()->route('inventarisasi.show', $id)->with(
            'success',
            'Sesi inventarisasi resmi ditutup. Kondisi dan verifikasi fisik seluruh aset telah disinkronkan ke master data.'
        );
    }
}
