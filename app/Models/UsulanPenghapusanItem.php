<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UsulanPenghapusanItem extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $table = 'usulan_penghapusan_item';

    protected $fillable = [
        'usulan_id',
        'aset_id',
        'alasan',
        'keterangan',
    ];

    public function usulan(): BelongsTo
    {
        return $this->belongsTo(UsulanPenghapusan::class, 'usulan_id');
    }

    public function aset(): BelongsTo
    {
        return $this->belongsTo(Aset::class, 'aset_id');
    }
}
