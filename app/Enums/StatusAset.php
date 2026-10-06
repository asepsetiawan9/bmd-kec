<?php

declare(strict_types=1);

namespace App\Enums;

enum StatusAset: string
{
    case AKTIF = 'aktif';
    case DIPINJAM = 'dipinjam';
    case DALAM_PERBAIKAN = 'dalam_perbaikan';
    case DIUSULKAN_HAPUS = 'diusulkan_hapus';
    case DIHAPUS = 'dihapus';
    case HILANG = 'hilang';

    public function label(): string
    {
        return match ($this) {
            self::AKTIF => 'Aktif Digunakan',
            self::DIPINJAM => 'Dipinjam',
            self::DALAM_PERBAIKAN => 'Dalam Perbaikan',
            self::DIUSULKAN_HAPUS => 'Diusulkan Hapus',
            self::DIHAPUS => 'Dihapuskan',
            self::HILANG => 'Hilang',
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
