<?php

declare(strict_types=1);

namespace App\Enums;

enum JenisDokumenAset: string
{
    case FOTO = 'foto';
    case SERTIFIKAT = 'sertifikat';
    case BPKB = 'bpkb';
    case STNK = 'stnk';
    case BAST = 'bast';
    case FAKTUR = 'faktur';
    case KONTRAK = 'kontrak';
    case LAINNYA = 'lainnya';

    public function label(): string
    {
        return match ($this) {
            self::FOTO => 'Foto Fisik',
            self::SERTIFIKAT => 'Sertifikat Tanah',
            self::BPKB => 'BPKB',
            self::STNK => 'STNK',
            self::BAST => 'Berita Acara Serah Terima (BAST)',
            self::FAKTUR => 'Faktur / Kwitansi Pembelian',
            self::KONTRAK => 'Surat Perjanjian / Kontrak',
            self::LAINNYA => 'Dokumen Legalitas Lainnya',
        };
    }

    public function disk(): string
    {
        return match ($this) {
            self::FOTO => 'public',
            default => 'local',
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
