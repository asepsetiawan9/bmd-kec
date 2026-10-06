<?php

declare(strict_types=1);

namespace App\Enums;

enum SumberDana: string
{
    case APBD = 'apbd';
    case APBD_KABUPATEN = 'apbd_kabupaten';
    case APBD_PROVINSI = 'apbd_provinsi';
    case APBN = 'apbn';
    case DAK = 'dak';
    case HIBAH = 'hibah';
    case PAD = 'pad';
    case BTT = 'btt';
    case LAINNYA = 'lainnya';

    public function label(): string
    {
        return match ($this) {
            self::APBD, self::APBD_KABUPATEN => 'APBD Kabupaten',
            self::APBD_PROVINSI => 'APBD Provinsi',
            self::APBN => 'APBN',
            self::DAK => 'DAK (Dana Alokasi Khusus)',
            self::HIBAH => 'Hibah / Bantuan',
            self::PAD => 'Pendapatan Asli Daerah (PAD)',
            self::BTT => 'Belanja Tidak Terduga (BTT)',
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
