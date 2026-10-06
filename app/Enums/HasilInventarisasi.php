<?php

declare(strict_types=1);

namespace App\Enums;

enum HasilInventarisasi: string
{
    case BELUM_DICEK = 'belum_dicek';
    case DITEMUKAN = 'ditemukan';
    case TIDAK_DITEMUKAN = 'tidak_ditemukan';

    public function label(): string
    {
        return match ($this) {
            self::BELUM_DICEK => 'Belum Diperiksa',
            self::DITEMUKAN => 'Ditemukan Sesuai',
            self::TIDAK_DITEMUKAN => 'Tidak Ditemukan',
        };
    }

    public static function options(): array
    {
        return array_reduce(self::cases(), function (array $carry, self $item): array {
            $carry[$item->value] = $item->label();
            return $carry;
        }, []);
    }
}
