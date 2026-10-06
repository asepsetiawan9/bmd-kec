import React from 'react';

const golonganConfig = {
    A: {
        label: 'KIB A - Tanah',
        short: 'KIB A',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        badge: 'bg-emerald-600 text-white',
    },
    B: {
        label: 'KIB B - Peralatan & Mesin',
        short: 'KIB B',
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        badge: 'bg-blue-600 text-white',
    },
    C: {
        label: 'KIB C - Gedung & Bangunan',
        short: 'KIB C',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        badge: 'bg-amber-600 text-white',
    },
    D: {
        label: 'KIB D - Jalan & Jaringan',
        short: 'KIB D',
        bg: 'bg-purple-50 text-purple-700 border-purple-200',
        badge: 'bg-purple-600 text-white',
    },
    E: {
        label: 'KIB E - Aset Tetap Lainnya',
        short: 'KIB E',
        bg: 'bg-teal-50 text-teal-700 border-teal-200',
        badge: 'bg-teal-600 text-white',
    },
    F: {
        label: 'KIB F - KDP (Konstruksi)',
        short: 'KIB F',
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        badge: 'bg-rose-600 text-white',
    },
};

export default function GolonganBadge({ golongan, full = false, className = '' }) {
    const key = (golongan || '').toUpperCase();
    const config = golonganConfig[key] || {
        label: `KIB ${key}`,
        short: `KIB ${key}`,
        bg: 'bg-neutral-100 text-neutral-700 border-neutral-200',
        badge: 'bg-neutral-600 text-white',
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-md border shadow-2xs ${config.bg} ${className}`}
        >
            <span className={`w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center ${config.badge}`}>
                {key}
            </span>
            <span>{full ? config.label : config.short}</span>
        </span>
    );
}
