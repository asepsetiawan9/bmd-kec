<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AsetDetailKdp extends Model
{
    use HasFactory;

    protected $table = 'aset_detail_kdp';

    protected $fillable = [
        'aset_id',
        'bangunan',
        'bertingkat',
        'beton',
        'luas_m2',
        'alamat',
        'tanggal_mulai',
        'status_tanah',
        'nilai_kontrak',
    ];

    protected function casts(): array
    {
        return [
            'bertingkat' => 'boolean',
            'beton' => 'boolean',
            'luas_m2' => 'decimal:2',
            'tanggal_mulai' => 'date',
            'nilai_kontrak' => 'decimal:2',
        ];
    }

    public function aset(): BelongsTo
    {
        return $this->belongsTo(Aset::class, 'aset_id');
    }
}
