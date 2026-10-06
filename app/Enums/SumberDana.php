<?php

declare(strict_types=1);

namespace App\Enums;

enum SumberDana: string
{
    case APBD = 'apbd';
    case APBN = 'apbn';
    case DAK = 'dak';
    case HIBAH = 'hibah';
    case LAINNYA = 'lainnya';

    public function label(): string
    {
        return match ($this) {
            self::APBD => 'APBD Kabupaten',
            self::APBN => 'APBN',
            self::DAK => 'DAK (Dana Alokasi Khusus)',
            self::HIBAH => 'Hibah / Bantuan',
            self::LAINNYA => 'Lain-lain Pendapatan Sah',
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
