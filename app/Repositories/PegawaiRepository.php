<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Pegawai;
use Illuminate\Database\Eloquent\Collection;

class PegawaiRepository
{
    public function all(): Collection
    {
        return Pegawai::with('user')->orderBy('nama')->get();
    }

    public function allAktif(): Collection
    {
        return Pegawai::with('user')->aktif()->orderBy('nama')->get();
    }

    public function findById(int $id): ?Pegawai
    {
        return Pegawai::with(['user', 'aset', 'ruangan'])->find($id);
    }

    public function create(array $data): Pegawai
    {
        return Pegawai::create($data);
    }

    public function update(Pegawai $pegawai, array $data): bool
    {
        return $pegawai->update($data);
    }

    public function delete(Pegawai $pegawai): bool
    {
        return $pegawai->delete();
    }
}
