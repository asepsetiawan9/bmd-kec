<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AksiRiwayatAset;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class RiwayatAset extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $table = 'riwayat_aset';

    protected $fillable = [
        'aset_id',
        'aksi',
        'keterangan',
        'data_sebelum',
        'data_sesudah',
        'referensi_type',
        'referensi_id',
        'user_id',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'aksi' => AksiRiwayatAset::class,
            'data_sebelum' => 'array',
            'data_sesudah' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function aset(): BelongsTo
    {
        return $this->belongsTo(Aset::class, 'aset_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function referensi(): MorphTo
    {
        return $this->morphTo();
    }
}
