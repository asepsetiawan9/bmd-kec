<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\StatusUsulanPenghapusan;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UsulanPenghapusan extends Model
{
    use HasFactory;

    protected $table = 'usulan_penghapusan';

    protected $fillable = [
        'nomor',
        'tanggal',
        'alasan_umum',
        'status',
        'catatan_penatausaha',
        'catatan_camat',
        'diajukan_pada',
        'diverifikasi_pada',
        'disetujui_pada',
        'dibuat_oleh',
        'diverifikasi_oleh',
        'disetujui_oleh',
        'nomor_sk_penghapusan',
        'tanggal_sk',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
            'status' => StatusUsulanPenghapusan::class,
            'diajukan_pada' => 'datetime',
            'diverifikasi_pada' => 'datetime',
            'disetujui_pada' => 'datetime',
            'tanggal_sk' => 'date',
        ];
    }

    public function pembuat(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }

    public function verifikator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diverifikasi_oleh');
    }

    public function penyetuju(): BelongsTo
    {
        return $this->belongsTo(User::class, 'disetujui_oleh');
    }

    public function items(): HasMany
    {
        return $this->hasMany(UsulanPenghapusanItem::class, 'usulan_id');
    }
}
