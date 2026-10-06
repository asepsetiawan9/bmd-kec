<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NomorUrut extends Model
{
    protected $table = 'nomor_urut';

    public $timestamps = false;

    protected $fillable = [
        'kunci',
        'nilai_terakhir',
        'updated_at',
    ];

    protected function casts(): array
    {
        return [
            'nilai_terakhir' => 'integer',
            'updated_at' => 'datetime',
        ];
    }
}
