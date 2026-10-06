import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GolonganBadge from '@/Components/GolonganBadge';
import {
    BookOpen,
    Search,
    Copy,
    Check,
    Layers,
    Box,
    Filter,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Index({ kodeBarang, filters = {} }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [golongan, setGolongan] = useState(filters.golongan || '');
    const [copiedKode, setCopiedKode] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            '/master/kode-barang',
            { search: searchTerm, golongan: golongan || undefined },
            { preserveState: true, replace: true }
        );
    };

    const handleGolonganFilter = (g) => {
        setGolongan(g);
        router.get(
            '/master/kode-barang',
            { search: searchTerm, golongan: g || undefined },
            { preserveState: true, replace: true }
        );
    };

    const copyToClipboard = (kode) => {
        navigator.clipboard.writeText(kode);
        setCopiedKode(kode);
        toast.success(`Kode '${kode}' disalin ke clipboard.`);
        setTimeout(() => setCopiedKode(null), 2000);
    };

    const golonganTabs = [
        { key: '', label: 'Semua Golongan' },
        { key: 'A', label: 'KIB A (Tanah)' },
        { key: 'B', label: 'KIB B (Peralatan)' },
        { key: 'C', label: 'KIB C (Gedung)' },
        { key: 'D', label: 'KIB D (Jalan/Jaringan)' },
        { key: 'E', label: 'KIB E (Aset Lainnya)' },
        { key: 'F', label: 'KIB F (KDP)' },
    ];

    return (
        <AuthenticatedLayout title="Kodefikasi Barang Permendagri 108">
            <Head title="Kodefikasi Barang 108 - SIMUKTI BMD" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-neutral-900 leading-tight">
                                Kodefikasi Barang Permendagri 108/2016
                            </h2>
                            <p className="text-xs text-neutral-500">
                                Standar klasifikasi dan nomenklatur kodefikasi Barang Milik Daerah resmi
                            </p>
                        </div>
                    </div>

                    <div className="text-xs text-neutral-500 bg-neutral-50 px-3.5 py-2 rounded-xl border border-neutral-200 font-medium">
                        Total Kode Terdaftar: <span className="font-bold text-neutral-900">{kodeBarang.total}</span>
                    </div>
                </div>

                {/* Golongan Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {golonganTabs.map((tab) => {
                        const active = golongan === tab.key;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => handleGolonganFilter(tab.key)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                                    active
                                        ? 'bg-purple-600 text-white shadow-xs'
                                        : 'bg-white hover:bg-neutral-50 text-neutral-600 border border-neutral-200/80'
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
                    <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                        <form onSubmit={handleSearch} className="relative w-full sm:w-96">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Cari nomor kode (cth: 02.03) atau nama barang..."
                                className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                            />
                        </form>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 font-semibold uppercase tracking-wider text-[11px]">
                                    <th className="px-5 py-3.5">Kodefikasi Barang</th>
                                    <th className="px-5 py-3.5">Uraian / Nama Nomenklatur</th>
                                    <th className="px-5 py-3.5 text-center">Golongan KIB</th>
                                    <th className="px-5 py-3.5 text-center">Masa Manfaat</th>
                                    <th className="px-5 py-3.5 text-center">Aset Tercatat</th>
                                    <th className="px-5 py-3.5 text-right">Salin</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {kodeBarang.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center text-neutral-400">
                                            Tidak ada kode barang yang cocok dengan pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    kodeBarang.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 border border-neutral-200">
                                                    {item.kode}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 font-semibold text-neutral-900">
                                                {item.uraian}
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                {item.golongan_kib ? (
                                                    <GolonganBadge golongan={item.golongan_kib} />
                                                ) : (
                                                    <span className="text-neutral-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-center text-neutral-600">
                                                {item.masa_manfaat ? `${item.masa_manfaat} Thn` : '-'}
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 font-bold text-[11px]">
                                                    <Box className="w-3 h-3 text-neutral-400" />
                                                    {item.aset_count || 0}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => copyToClipboard(item.kode)}
                                                    className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-purple-600 transition-colors"
                                                    title="Salin Kodefikasi"
                                                >
                                                    {copiedKode === item.kode ? (
                                                        <Check className="w-4 h-4 text-emerald-600" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {kodeBarang.links && kodeBarang.links.length > 3 && (
                        <div className="p-4 border-t border-neutral-100 flex items-center justify-between">
                            <span className="text-xs text-neutral-500">
                                Menampilkan {kodeBarang.from || 0} - {kodeBarang.to || 0} dari {kodeBarang.total} data
                            </span>
                            <div className="flex gap-1">
                                {kodeBarang.links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        disabled={!link.url || link.active}
                                        onClick={() => router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                                            link.active
                                                ? 'bg-purple-600 text-white border-purple-600 font-bold'
                                                : link.url
                                                ? 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
                                                : 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
