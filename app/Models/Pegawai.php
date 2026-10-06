<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pegawai extends Model
{
    use HasFactory;

    protected $table = 'pegawai';

    protected $fillable = [
        'nip',
        'nama',
        'jabatan',
        'unit_kerja',
        'no_hp',
        'user_id',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function aset(): HasMany
    {
        return $this->hasMany(Aset::class, 'pemegang_id');
    }

    public function ruangan(): HasMany
    {
        return $this->hasMany(Ruangan::class, 'penanggung_jawab_id');
    }

    public function scopeAktif($query)
    {
        return $query->where('is_active', true);
    }
}
