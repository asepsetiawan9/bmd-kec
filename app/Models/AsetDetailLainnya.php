<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AsetDetailLainnya extends Model
{
    use HasFactory;

    protected $table = 'aset_detail_lainnya';

    protected $fillable = [
        'aset_id',
        'judul_pencipta',
        'spesifikasi_buku',
        'asal_daerah',
        'pencipta',
        'bahan',
        'jenis_hewan_tumbuhan',
        'ukuran',
    ];

    public function aset(): BelongsTo
    {
        return $this->belongsTo(Aset::class, 'aset_id');
    }
}
