<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\Master\StorePegawaiRequest;
use App\Http\Requests\Master\UpdatePegawaiRequest;
use App\Models\Pegawai;
use App\Models\User;
use App\Repositories\PegawaiRepository;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PegawaiController extends Controller
{
    public function __construct(
        protected PegawaiRepository $pegawaiRepository
    ) {}

    public function index(Request $request): Response
    {
        $search = $request->query('search');

        $query = Pegawai::with('user')
            ->withCount('aset')
            ->orderBy('nama');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                    ->orWhere('nip', 'like', "%{$search}%")
                    ->orWhere('jabatan', 'like', "%{$search}%")
                    ->orWhere('unit_kerja', 'like', "%{$search}%");
            });
        }

        $pegawai = $query->paginate(15)->withQueryString();
        $unlinkedUsers = User::whereDoesntHave('pegawai')->orderBy('name')->get(['id', 'name', 'email']);

        return Inertia::render('Master/Pegawai/Index', [
            'pegawai' => $pegawai,
            'unlinkedUsers' => $unlinkedUsers,
            'filters' => [
                'search' => $search ?? '',
            ],
        ]);
    }

    public function store(StorePegawaiRequest $request): RedirectResponse
    {
        $pegawai = $this->pegawaiRepository->create($request->validated());

        return redirect()
            ->route('master.pegawai.index')
            ->with('success', "Pegawai '{$pegawai->nama}' berhasil ditambahkan.");
    }

    public function update(UpdatePegawaiRequest $request, Pegawai $pegawai): RedirectResponse
    {
        $this->pegawaiRepository->update($pegawai, $request->validated());

        return redirect()
            ->route('master.pegawai.index')
            ->with('success', "Data pegawai '{$pegawai->nama}' berhasil diperbarui.");
    }

    public function destroy(Pegawai $pegawai): RedirectResponse
    {
        if ($pegawai->aset()->count() > 0) {
            return redirect()
                ->route('master.pegawai.index')
                ->with('error', "Pegawai '{$pegawai->nama}' tidak dapat dihapus karena masih tercatat sebagai pemegang {$pegawai->aset()->count()} data aset.");
        }

        if ($pegawai->ruangan()->count() > 0) {
            return redirect()
                ->route('master.pegawai.index')
                ->with('error', "Pegawai '{$pegawai->nama}' tidak dapat dihapus karena tercatat sebagai penanggung jawab ruangan.");
        }

        $this->pegawaiRepository->delete($pegawai);

        return redirect()
            ->route('master.pegawai.index')
            ->with('success', "Pegawai '{$pegawai->nama}' berhasil dihapus.");
    }
}
