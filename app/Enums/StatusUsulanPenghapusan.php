<?php

declare(strict_types=1);

namespace App\Enums;

enum StatusUsulanPenghapusan: string
{
    case DRAFT = 'draft';
    case DIAJUKAN = 'diajukan';
    case DIVERIFIKASI = 'diverifikasi';
    case DIKEMBALIKAN_PENATAUSAHA = 'dikembalikan_penatausaha';
    case DISETUJUI = 'disetujui';
    case DIKEMBALIKAN_CAMAT = 'dikembalikan_camat';
    case SELESAI = 'selesai';

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draft Usulan',
            self::DIAJUKAN => 'Diajukan ke Sekcam',
            self::DIVERIFIKASI => 'Diverifikasi Sekcam',
            self::DIKEMBALIKAN_PENATAUSAHA => 'Dikembalikan oleh Sekcam',
            self::DISETUJUI => 'Disetujui Camat',
            self::DIKEMBALIKAN_CAMAT => 'Dikembalikan oleh Camat',
            self::SELESAI => 'Selesai SK Penghapusan',
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
