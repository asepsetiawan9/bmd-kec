<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AsetDetailPeralatan extends Model
{
    use HasFactory;

    protected $table = 'aset_detail_peralatan';

    protected $fillable = [
        'aset_id',
        'ukuran_cc',
        'bahan',
        'nomor_pabrik',
        'nomor_rangka',
        'nomor_mesin',
        'nomor_polisi',
        'nomor_bpkb',
        'tanggal_pajak',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_pajak' => 'date',
        ];
    }

    public function aset(): BelongsTo
    {
        return $this->belongsTo(Aset::class, 'aset_id');
    }
}
