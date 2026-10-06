<?php

declare(strict_types=1);

namespace App\Enums;

enum CaraPerolehan: string
{
    case PEMBELIAN = 'pembelian';
    case HIBAH = 'hibah';
    case SUMBANGAN = 'sumbangan';
    case PRODUKSI_SENDIRI = 'produksi_sendiri';
    case TRANSFER_MASUK = 'transfer_masuk';
    case LAINNYA = 'lainnya';

    public function label(): string
    {
        return match ($this) {
            self::PEMBELIAN => 'Pembelian / Pengadaan',
            self::HIBAH => 'Hibah',
            self::SUMBANGAN => 'Sumbangan',
            self::PRODUKSI_SENDIRI => 'Produksi Sendiri',
            self::TRANSFER_MASUK => 'Transfer Masuk Antar SKPD',
            self::LAINNYA => 'Lainnya',
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
