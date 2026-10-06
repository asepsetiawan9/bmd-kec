<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\JenisMutasi;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MutasiAset extends Model
{
    use HasFactory;

    protected $table = 'mutasi_aset';

    protected $fillable = [
        'nomor_bast',
        'aset_id',
        'jenis',
        'dari_ruangan_id',
        'ke_ruangan_id',
        'dari_pegawai_id',
        'ke_pegawai_id',
        'tanggal',
        'alasan',
        'dibuat_oleh',
    ];

    protected function casts(): array
    {
        return [
            'jenis' => JenisMutasi::class,
            'tanggal' => 'date',
        ];
    }

    public function aset(): BelongsTo
    {
        return $this->belongsTo(Aset::class, 'aset_id');
    }

    public function dariRuangan(): BelongsTo
    {
        return $this->belongsTo(Ruangan::class, 'dari_ruangan_id');
    }

    public function keRuangan(): BelongsTo
    {
        return $this->belongsTo(Ruangan::class, 'ke_ruangan_id');
    }

    public function dariPegawai(): BelongsTo
    {
        return $this->belongsTo(Pegawai::class, 'dari_pegawai_id');
    }

    public function kePegawai(): BelongsTo
    {
        return $this->belongsTo(Pegawai::class, 'ke_pegawai_id');
    }

    public function pembuat(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }
}
