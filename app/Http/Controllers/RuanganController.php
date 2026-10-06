<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\Master\StoreRuanganRequest;
use App\Http\Requests\Master\UpdateRuanganRequest;
use App\Models\Pegawai;
use App\Models\Ruangan;
use App\Repositories\RuanganRepository;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class RuanganController extends Controller
{
    public function __construct(
        protected RuanganRepository $ruanganRepository
    ) {}

    public function index(Request $request): Response
    {
        $search = $request->query('search');

        $query = Ruangan::with(['penanggungJawab'])
            ->withCount('aset')
            ->orderBy('nama');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                    ->orWhere('kode', 'like', "%{$search}%")
                    ->orWhere('gedung', 'like', "%{$search}%");
            });
        }

        $ruangan = $query->paginate(15)->withQueryString();
        $pegawaiList = Pegawai::aktif()->orderBy('nama')->get(['id', 'nama', 'nip', 'jabatan']);

        return Inertia::render('Master/Ruangan/Index', [
            'ruangan' => $ruangan,
            'pegawaiList' => $pegawaiList,
            'filters' => [
                'search' => $search ?? '',
            ],
        ]);
    }

    public function store(StoreRuanganRequest $request): RedirectResponse
    {
        $ruangan = $this->ruanganRepository->create($request->validated());

        return redirect()
            ->route('master.ruangan.index')
            ->with('success', "Ruangan '{$ruangan->nama}' berhasil ditambahkan.");
    }

    public function update(UpdateRuanganRequest $request, Ruangan $ruangan): RedirectResponse
    {
        $this->ruanganRepository->update($ruangan, $request->validated());

        return redirect()
            ->route('master.ruangan.index')
            ->with('success', "Data ruangan '{$ruangan->nama}' berhasil diperbarui.");
    }

    public function destroy(Ruangan $ruangan): RedirectResponse
    {
        if ($ruangan->aset()->count() > 0) {
            return redirect()
                ->route('master.ruangan.index')
                ->with('error', "Ruangan '{$ruangan->nama}' tidak dapat dihapus karena masih terkait dengan {$ruangan->aset()->count()} data aset.");
        }

        $this->ruanganRepository->delete($ruangan);

        return redirect()
            ->route('master.ruangan.index')
            ->with('success', "Ruangan '{$ruangan->nama}' berhasil dihapus.");
    }
}
