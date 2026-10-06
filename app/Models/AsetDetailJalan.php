<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AsetDetailJalan extends Model
{
    use HasFactory;

    protected $table = 'aset_detail_jalan';

    protected $fillable = [
        'aset_id',
        'konstruksi',
        'panjang_m',
        'lebar_m',
        'luas_m2',
        'alamat',
        'nomor_dokumen',
        'status_tanah',
    ];

    protected function casts(): array
    {
        return [
            'panjang_m' => 'decimal:2',
            'lebar_m' => 'decimal:2',
            'luas_m2' => 'decimal:2',
        ];
    }

    public function aset(): BelongsTo
    {
        return $this->belongsTo(Aset::class, 'aset_id');
    }
}
