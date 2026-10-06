<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Ruangan;
use Illuminate\Database\Eloquent\Collection;

class RuanganRepository
{
    public function all(): Collection
    {
        return Ruangan::with('penanggungJawab')->orderBy('nama')->get();
    }

    public function allAktif(): Collection
    {
        return Ruangan::with('penanggungJawab')->aktif()->orderBy('nama')->get();
    }

    public function findById(int $id): ?Ruangan
    {
        return Ruangan::with(['penanggungJawab', 'aset'])->find($id);
    }

    public function create(array $data): Ruangan
    {
        return Ruangan::create($data);
    }

    public function update(Ruangan $ruangan, array $data): bool
    {
        return $ruangan->update($data);
    }

    public function delete(Ruangan $ruangan): bool
    {
        return $ruangan->delete();
    }
}
