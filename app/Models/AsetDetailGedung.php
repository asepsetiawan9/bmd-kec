<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AsetDetailGedung extends Model
{
    use HasFactory;

    protected $table = 'aset_detail_gedung';

    protected $fillable = [
        'aset_id',
        'kondisi_bangunan',
        'bertingkat',
        'beton',
        'luas_lantai_m2',
        'alamat',
        'nomor_dokumen',
        'tanggal_dokumen',
        'luas_tanah_m2',
        'status_tanah',
        'kode_tanah',
    ];

    protected function casts(): array
    {
        return [
            'bertingkat' => 'boolean',
            'beton' => 'boolean',
            'luas_lantai_m2' => 'decimal:2',
            'luas_tanah_m2' => 'decimal:2',
            'tanggal_dokumen' => 'date',
        ];
    }

    public function aset(): BelongsTo
    {
        return $this->belongsTo(Aset::class, 'aset_id');
    }
}
