<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\JenisDokumenAset;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AsetDokumen extends Model
{
    use HasFactory;

    protected $table = 'aset_dokumen';

    protected $fillable = [
        'aset_id',
        'jenis',
        'nama_dokumen',
        'disk',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
        'nomor_dokumen',
        'uploaded_by',
    ];

    protected function casts(): array
    {
        return [
            'jenis' => JenisDokumenAset::class,
            'file_size' => 'integer',
        ];
    }

    public function aset(): BelongsTo
    {
        return $this->belongsTo(Aset::class, 'aset_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
