<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\GolonganKib;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RefKodeBarang extends Model
{
    use HasFactory;

    protected $table = 'ref_kode_barang';

    protected $fillable = [
        'parent_id',
        'kode',
        'uraian',
        'level',
        'golongan_kib',
        'masa_manfaat',
        'is_selectable',
    ];

    protected function casts(): array
    {
        return [
            'level' => 'integer',
            'golongan_kib' => GolonganKib::class,
            'masa_manfaat' => 'integer',
            'is_selectable' => 'boolean',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function aset(): HasMany
    {
        return $this->hasMany(Aset::class, 'ref_kode_barang_id');
    }

    public function scopeSelectable($query)
    {
        return $query->where('is_selectable', true);
    }
}
