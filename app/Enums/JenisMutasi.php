<?php

declare(strict_types=1);

namespace App\Enums;

enum JenisMutasi: string
{
    case PENEMPATAN_AWAL = 'penempatan_awal';
    case PINDAH_RUANGAN = 'pindah_ruangan';
    case GANTI_PEMEGANG = 'ganti_pemegang';
    case PENGEMBALIAN = 'pengembalian';

    public function label(): string
    {
        return match ($this) {
            self::PENEMPATAN_AWAL => 'Penempatan Awal',
            self::PINDAH_RUANGAN => 'Pindah Ruangan / Lokasi',
            self::GANTI_PEMEGANG => 'Alih Penanggung Jawab / Pemegang',
            self::PENGEMBALIAN => 'Pengembalian ke Pengurus Barang',
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
