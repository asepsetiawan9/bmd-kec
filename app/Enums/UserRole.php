<?php

declare(strict_types=1);

namespace App\Enums;

enum UserRole: string
{
    case SUPER_ADMIN = 'super_admin';
    case PENGURUS_BARANG = 'pengurus_barang';
    case PENATAUSAHA = 'penatausaha';
    case CAMAT = 'camat';
    case PEMEGANG = 'pemegang';

    public function label(): string
    {
        return match ($this) {
            self::SUPER_ADMIN => 'Super Administrator',
            self::PENGURUS_BARANG => 'Pengurus Barang',
            self::PENATAUSAHA => 'Pejabat Penatausahaan (Sekcam)',
            self::CAMAT => 'Pengguna Barang (Camat)',
            self::PEMEGANG => 'Pemegang Barang',
        };
    }

    /**
     * @return array<string, string>
     */
    public static function options(): array
    {
        return array_reduce(self::cases(), function (array $carry, self $item): array {
            $carry[$item->value] = $item->label();
            return $carry;
        }, []);
    }
}
