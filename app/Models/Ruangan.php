<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ruangan extends Model
{
    use HasFactory;

    protected $table = 'ruangan';

    protected $fillable = [
        'kode',
        'nama',
        'gedung',
        'lantai',
        'penanggung_jawab_id',
        'keterangan',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function penanggungJawab(): BelongsTo
    {
        return $this->belongsTo(Pegawai::class, 'penanggung_jawab_id');
    }

    public function aset(): HasMany
    {
        return $this->hasMany(Aset::class, 'ruangan_id');
    }

    public function scopeAktif($query)
    {
        return $query->where('is_active', true);
    }

    public function getNamaRuanganAttribute(): string
    {
        return (string) ($this->nama ?? '');
    }

    public function getKodeRuanganAttribute(): string
    {
        return (string) ($this->kode ?? '');
    }
}
