<?php

declare(strict_types=1);

namespace App\Enums;

enum StatusInventarisasi: string
{
    case BERJALAN = 'berjalan';
    case SELESAI = 'selesai';

    public function label(): string
    {
        return match ($this) {
            self::BERJALAN => 'Sedang Berjalan',
            self::SELESAI => 'Selesai',
        };
    }
}
