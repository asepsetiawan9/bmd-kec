<?php

declare(strict_types=1);

namespace App\Enums;

enum JenisPemeliharaan: string
{
    case RUTIN = 'rutin';
    case PERBAIKAN = 'perbaikan';
    case PENGGANTIAN_SUKU_CADANG = 'penggantian_suku_cadang';

    public function label(): string
    {
        return match ($this) {
            self::RUTIN => 'Pemeliharaan Rutin / Berkala',
            self::PERBAIKAN => 'Perbaikan Kerusakan',
            self::PENGGANTIAN_SUKU_CADANG => 'Penggantian Suku Cadang',
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
