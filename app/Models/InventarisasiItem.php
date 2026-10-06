<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\HasilInventarisasi;
use App\Enums\KondisiAset;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventarisasiItem extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $table = 'inventarisasi_item';

    protected $fillable = [
        'inventarisasi_id',
        'aset_id',
        'hasil',
        'kondisi_temuan',
        'ruangan_temuan_id',
        'catatan',
        'diperiksa_oleh',
        'diperiksa_pada',
    ];

    protected function casts(): array
    {
        return [
            'hasil' => HasilInventarisasi::class,
            'kondisi_temuan' => KondisiAset::class,
            'diperiksa_pada' => 'datetime',
        ];
    }

    public function inventarisasi(): BelongsTo
    {
        return $this->belongsTo(Inventarisasi::class, 'inventarisasi_id');
    }

    public function aset(): BelongsTo
    {
        return $this->belongsTo(Aset::class, 'aset_id');
    }

    public function ruanganTemuan(): BelongsTo
    {
        return $this->belongsTo(Ruangan::class, 'ruangan_temuan_id');
    }

    public function pemeriksa(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diperiksa_oleh');
    }
}
