<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\KondisiAset;
use App\Enums\StatusAset;
use App\Http\Requests\StoreUsulanPenghapusanRequest;
use App\Models\Aset;
use App\Repositories\UsulanPenghapusanRepository;
use App\Services\UsulanPenghapusanService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class UsulanPenghapusanController extends Controller
{
    public function __construct(
        protected UsulanPenghapusanRepository $repository,
        protected UsulanPenghapusanService $service
    ) {}

    public function index(Request $request): InertiaResponse
    {
        $filters = $request->only(['status', 'search']);
        $usulans = $this->repository->getPaginated($filters);
        
        $pendingSekcam = $this->repository->getPendingSekcamCount();
        $pendingCamat = $this->repository->getPendingCamatCount();
        $dikembalikanCount = $this->repository->getDikembalikanCount();

        return Inertia::render('Penghapusan/Index', [
            'usulans' => $usulans,
            'filters' => $filters,
            'badges' => [
                'pending_sekcam' => $pendingSekcam,
                'pending_camat' => $pendingCamat,
                'dikembalikan' => $dikembalikanCount,
            ],
        ]);
    }

    public function create(): InertiaResponse
    {
        // Utamakan aset yang berstatus aktif dan rusak berat atau rusak ringan
        $kandidatAsets = Aset::with(['ruangan', 'pemegang'])
            ->where('status', StatusAset::AKTIF)
            ->whereIn('kondisi', [KondisiAset::RUSAK_BERAT, KondisiAset::RUSAK_RINGAN])
            ->orderByRaw("CASE WHEN kondisi = 'rusak_berat' THEN 1 ELSE 2 END")
            ->orderBy('nama')
            ->get(['id', 'nama', 'kode_barang', 'nomor_register', 'golongan', 'kondisi', 'nilai_perolehan', 'ruangan_id', 'pemegang_id']);

        return Inertia::render('Penghapusan/Create', [
            'kandidatAsets' => $kandidatAsets,
        ]);
    }

    public function store(StoreUsulanPenghapusanRequest $request): RedirectResponse
    {
        $usulan = $this->service->createUsulan($request->validated(), $request->user());

        return redirect()->route('penghapusan.show', $usulan->id)->with(
            'success',
            "Draft usulan penghapusan '{$usulan->nomor}' berhasil dibuat."
        );
    }

    public function show(int $id): InertiaResponse
    {
        $usulan = $this->repository->findByIdWithItems($id);
        if (! $usulan) {
            abort(404, 'Usulan penghapusan tidak ditemukan.');
        }

        return Inertia::render('Penghapusan/Show', [
            'usulan' => $usulan,
        ]);
    }

    public function ajukan(int $id, Request $request): RedirectResponse
    {
        $this->service->ajukan($id, $request->user());

        return redirect()->back()->with(
            'success',
            'Usulan penghapusan berhasil diajukan ke Sekcam untuk diverifikasi. Aset terkunci dari transaksi mutasi.'
        );
    }

    public function verifikasiSekcam(int $id, Request $request): RedirectResponse
    {
        if (! $request->user()->can('penghapusan.verify')) {
            abort(403, 'Anda tidak memiliki hak akses verifikasi Sekcam.');
        }

        $this->service->verifikasiSekcam($id, $request->user());

        return redirect()->back()->with(
            'success',
            'Usulan penghapusan berhasil diverifikasi dan diteruskan ke Camat untuk persetujuan final.'
        );
    }

    public function kembalikanSekcam(Request $request, int $id): RedirectResponse
    {
        if (! $request->user()->can('penghapusan.verify')) {
            abort(403, 'Anda tidak memiliki hak akses pengembalian usulan.');
        }

        $request->validate([
            'catatan' => ['required', 'string', 'min:10', 'max:1000'],
        ]);

        $this->service->kembalikanSekcam($id, $request->input('catatan'), $request->user());

        return redirect()->back()->with(
            'warning',
            'Usulan penghapusan telah dikembalikan kepada Pengurus Barang untuk direvisi.'
        );
    }

    public function setujuiCamat(int $id, Request $request): RedirectResponse
    {
        if (! $request->user()->can('penghapusan.approve')) {
            abort(403, 'Anda tidak memiliki hak akses persetujuan Camat.');
        }

        $this->service->setujuiCamat($id, $request->user());

        return redirect()->back()->with(
            'success',
            'Usulan penghapusan resmi disetujui oleh Camat. Menunggu penerbitan nomor SK Penghapusan.'
        );
    }

    public function kembalikanCamat(Request $request, int $id): RedirectResponse
    {
        if (! $request->user()->can('penghapusan.approve')) {
            abort(403, 'Anda tidak memiliki hak akses pengembalian Camat.');
        }

        $request->validate([
            'catatan' => ['required', 'string', 'min:10', 'max:1000'],
        ]);

        $this->service->kembalikanCamat($id, $request->input('catatan'), $request->user());

        return redirect()->back()->with(
            'warning',
            'Usulan penghapusan telah dikembalikan oleh Camat dengan catatan revisi.'
        );
    }

    public function selesaikanSk(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'nomor_sk_penghapusan' => ['required', 'string', 'max:100'],
            'tanggal_sk' => ['required', 'date'],
        ]);

        $this->service->selesaikanSk(
            $id,
            $request->input('nomor_sk_penghapusan'),
            $request->input('tanggal_sk'),
            $request->user()
        );

        return redirect()->back()->with(
            'success',
            'SK Penghapusan berhasil dicatat. Status seluruh aset resmi DIHAPUS dari master BMD aktif.'
        );
    }
}
