<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\StatusInventarisasi;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Inventarisasi extends Model
{
    use HasFactory;

    protected $table = 'inventarisasi';

    protected $fillable = [
        'kode',
        'nama',
        'tanggal_mulai',
        'tanggal_selesai',
        'status',
        'ruangan_scope',
        'dibuat_oleh',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_mulai' => 'date',
            'tanggal_selesai' => 'date',
            'status' => StatusInventarisasi::class,
        ];
    }

    public function ruanganScope(): BelongsTo
    {
        return $this->belongsTo(Ruangan::class, 'ruangan_scope');
    }

    public function pembuat(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }

    public function items(): HasMany
    {
        return $this->hasMany(InventarisasiItem::class, 'inventarisasi_id');
    }
}
