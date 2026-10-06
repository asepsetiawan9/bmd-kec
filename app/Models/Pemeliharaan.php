<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\JenisPemeliharaan;
use App\Enums\KondisiAset;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pemeliharaan extends Model
{
    use HasFactory;

    protected $table = 'pemeliharaan';

    protected $fillable = [
        'aset_id',
        'tanggal',
        'jenis',
        'uraian',
        'biaya',
        'pelaksana',
        'kondisi_sebelum',
        'kondisi_sesudah',
        'dibuat_oleh',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
            'jenis' => JenisPemeliharaan::class,
            'biaya' => 'decimal:2',
            'kondisi_sebelum' => KondisiAset::class,
            'kondisi_sesudah' => KondisiAset::class,
        ];
    }

    public function aset(): BelongsTo
    {
        return $this->belongsTo(Aset::class, 'aset_id');
    }

    public function pembuat(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }
}
