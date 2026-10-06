<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AsetDetailTanah extends Model
{
    use HasFactory;

    protected $table = 'aset_detail_tanah';

    protected $fillable = [
        'aset_id',
        'luas_m2',
        'alamat',
        'status_hak',
        'nomor_sertifikat',
        'tanggal_sertifikat',
        'penggunaan',
    ];

    protected function casts(): array
    {
        return [
            'luas_m2' => 'decimal:2',
            'tanggal_sertifikat' => 'date',
        ];
    }

    public function aset(): BelongsTo
    {
        return $this->belongsTo(Aset::class, 'aset_id');
    }
}
