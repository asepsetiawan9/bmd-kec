<?php

declare(strict_types=1);

namespace App\Enums;

enum GolonganKib: string
{
    case A = 'A';
    case B = 'B';
    case C = 'C';
    case D = 'D';
    case E = 'E';
    case F = 'F';

    public function label(): string
    {
        return match ($this) {
            self::A => 'KIB A - Tanah',
            self::B => 'KIB B - Peralatan dan Mesin',
            self::C => 'KIB C - Gedung dan Bangunan',
            self::D => 'KIB D - Jalan, Irigasi dan Jaringan',
            self::E => 'KIB E - Aset Tetap Lainnya',
            self::F => 'KIB F - Konstruksi Dalam Pengerjaan',
        };
    }

    public function nama(): string
    {
        return match ($this) {
            self::A => 'Tanah',
            self::B => 'Peralatan dan Mesin',
            self::C => 'Gedung dan Bangunan',
            self::D => 'Jalan, Irigasi dan Jaringan',
            self::E => 'Aset Tetap Lainnya',
            self::F => 'Konstruksi Dalam Pengerjaan',
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
