import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import KondisiBadge from '@/Components/KondisiBadge';
import GolonganBadge from '@/Components/GolonganBadge';
import StatCard from '@/Components/StatCard';
import EmptyState from '@/Components/EmptyState';
import { formatRupiah } from '@/Utils/formatRupiah';
import {
    Box,
    Plus,
    Search,
    Filter,
    RotateCcw,
    Printer,
    Download,
    Eye,
    Edit3,
    Calendar,
    DoorClosed,
    Users,
    CheckSquare,
    Square,
    DollarSign,
    CheckCircle2,
    AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Index({
    assets,
    statistics = {},
    ruanganList = [],
    filters = {},
}) {
    const { auth } = usePage().props;
    const userRole = auth?.user?.role;
    const permissions = auth?.user?.permissions || auth?.permissions || [];
    const canCreate = permissions.includes('aset.create') || ['pengurus_barang', 'super_admin'].includes(userRole);
    const canUpdate = permissions.includes('aset.update') || ['pengurus_barang', 'super_admin'].includes(userRole);
    const canPrintLabel = permissions.includes('aset.label.print') || ['pengurus_barang', 'super_admin', 'camat', 'penatausaha'].includes(userRole);

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [kondisi, setKondisi] = useState(filters.kondisi || '');
    const [golongan, setGolongan] = useState(filters.golongan || '');
    const [ruanganId, setRuanganId] = useState(filters.ruangan_id || '');
    const [tahun, setTahun] = useState(filters.tahun || '');

    // Bulk selection state
    const [selectedIds, setSelectedIds] = useState([]);

    // Debounced search
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                applyFilters({ search: searchTerm });
            }
        }, 350);

        return () => clearTimeout(timeout);
    }, [searchTerm]);

    const applyFilters = (newFilters = {}) => {
        router.get(
            '/aset',
            {
                search: searchTerm,
                kondisi: kondisi || undefined,
                golongan: golongan || undefined,
                ruangan_id: ruanganId || undefined,
                tahun: tahun || undefined,
                ...newFilters,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const handleGolonganFilter = (g) => {
        setGolongan(g);
        applyFilters({ golongan: g || undefined });
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setKondisi('');
        setGolongan('');
        setRuanganId('');
        setTahun('');
        router.get('/aset', {}, { replace: true });
    };

    // Bulk selection helpers
    const allIdsOnPage = assets?.data ? assets.data.map((item) => item.id) : [];
    const isAllSelected = allIdsOnPage.length > 0 && allIdsOnPage.every((id) => selectedIds.includes(id));

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds(selectedIds.filter((id) => !allIdsOnPage.includes(id)));
        } else {
            const combined = Array.from(new Set([...selectedIds, ...allIdsOnPage]));
            setSelectedIds(combined);
        }
    };

    const toggleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((item) => item !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkPrintLabel = () => {
        if (selectedIds.length === 0) {
            toast.warning('Pilih setidaknya 1 aset untuk dicetak labelnya.');
            return;
        }
        window.open(`/aset/cetak-label?ids=${selectedIds.join(',')}`, '_blank');
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
        <AuthenticatedLayout title="Daftar Aset BMD">
            <Head title="Daftar Aset BMD - SIMUKTI Mekarmukti" />

            <div className="space-y-6">
                {/* Stats Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Unit Aset"
                        value={`${statistics.total || 0} Unit`}
                        subtitle="Tercatat di sistem SIMUKTI"
                        icon={Box}
                        color="emerald"
                    />
                    <StatCard
                        title="Total Nilai Perolehan"
                        value={formatRupiah(statistics.total_nilai || 0)}
                        subtitle="Valuasi kekayaan daerah"
                        icon={DollarSign}
                        color="blue"
                    />
                    <StatCard
                        title="Kondisi Baik"
                        value={`${statistics.baik || 0} Unit`}
                        subtitle="Siap operasional pelayanan"
                        icon={CheckCircle2}
                        color="emerald"
                    />
                    <StatCard
                        title="Rusak / Perlu Servis"
                        value={`${(statistics.rusak_ringan || 0) + (statistics.rusak_berat || 0)} Unit`}
                        subtitle={`${statistics.rusak_berat || 0} rusak berat`}
                        icon={AlertTriangle}
                        color="rose"
                    />
                </div>

                {/* Header & Bulk Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
                    <div>
                        <h2 className="text-lg font-bold text-neutral-900 leading-tight">
                            Pengelolaan Aset Milik Daerah
                        </h2>
                        <p className="text-xs text-neutral-500">
                            Inventarisasi dan status fisik BMD Kecamatan Mekarmukti
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {canPrintLabel && selectedIds.length > 0 && (
                            <button
                                type="button"
                                onClick={handleBulkPrintLabel}
                                className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-neutral-800 hover:bg-neutral-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all animate-in fade-in"
                            >
                                <Printer className="w-4 h-4 text-emerald-400" />
                                Cetak Label QR ({selectedIds.length})
                            </button>
                        )}

                        {canCreate && (
                            <Link
                                href="/aset/create"
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                Tambah Aset Baru
                            </Link>
                        )}
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
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'bg-white hover:bg-neutral-50 text-neutral-600 border border-neutral-200/80'
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-xs space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                        {/* Search Input */}
                        <div className="lg:col-span-2 relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Cari nama barang, kode, nomor register, pemegang..."
                                className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>

                        {/* Ruangan Filter */}
                        <div>
                            <select
                                value={ruanganId}
                                onChange={(e) => {
                                    setRuanganId(e.target.value);
                                    applyFilters({ ruangan_id: e.target.value || undefined });
                                }}
                                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            >
                                <option value="">Semua Ruangan</option>
                                {ruanganList.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.nama}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Kondisi Filter */}
                        <div>
                            <select
                                value={kondisi}
                                onChange={(e) => {
                                    setKondisi(e.target.value);
                                    applyFilters({ kondisi: e.target.value || undefined });
                                }}
                                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            >
                                <option value="">Semua Kondisi</option>
                                <option value="baik">Baik</option>
                                <option value="rusak_ringan">Rusak Ringan</option>
                                <option value="rusak_berat">Rusak Berat</option>
                            </select>
                        </div>

                        {/* Reset Filter Button */}
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                placeholder="Tahun"
                                value={tahun}
                                onChange={(e) => {
                                    setTahun(e.target.value);
                                    applyFilters({ tahun: e.target.value || undefined });
                                }}
                                className="w-24 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white font-mono"
                            />
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="p-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-500 rounded-xl transition-colors"
                                title="Reset Filter"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table Data Card */}
                <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 font-semibold uppercase tracking-wider text-[11px]">
                                    <th className="px-4 py-3.5 w-10 text-center">
                                        <button
                                            type="button"
                                            onClick={toggleSelectAll}
                                            className="text-neutral-500 hover:text-neutral-800"
                                            title="Pilih Semua di Halaman Ini"
                                        >
                                            {isAllSelected ? (
                                                <CheckSquare className="w-4 h-4 text-emerald-600" />
                                            ) : (
                                                <Square className="w-4 h-4 text-neutral-300" />
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3.5">Identitas & Nama Barang</th>
                                    <th className="px-4 py-3.5 text-center">Golongan</th>
                                    <th className="px-4 py-3.5">Lokasi / Pemegang</th>
                                    <th className="px-4 py-3.5 text-center">Tahun</th>
                                    <th className="px-4 py-3.5 text-right">Nilai Perolehan</th>
                                    <th className="px-4 py-3.5 text-center">Kondisi</th>
                                    <th className="px-4 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {assets.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-12 text-center text-neutral-400">
                                            <EmptyState
                                                title="Tidak ada aset ditemukan"
                                                description="Sesuaikan filter pencarian atau daftarkan aset baru ke dalam sistem."
                                            />
                                        </td>
                                    </tr>
                                ) : (
                                    assets.data.map((item) => {
                                        const isSelected = selectedIds.includes(item.id);
                                        return (
                                            <tr
                                                key={item.id}
                                                className={`transition-colors ${
                                                    isSelected ? 'bg-emerald-50/50 hover:bg-emerald-50' : 'hover:bg-neutral-50/70'
                                                }`}
                                            >
                                                {/* Checkbox */}
                                                <td className="px-4 py-3.5 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleSelectOne(item.id)}
                                                        className="text-neutral-400 hover:text-neutral-800"
                                                    >
                                                        {isSelected ? (
                                                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                                                        ) : (
                                                            <Square className="w-4 h-4 text-neutral-300" />
                                                        )}
                                                    </button>
                                                </td>

                                                {/* Nama & Kode */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 flex items-center justify-center">
                                                            {item.foto_path ? (
                                                                <img
                                                                    src={`/storage/${item.foto_path}`}
                                                                    alt={item.nama}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <Box className="w-5 h-5 text-neutral-400" />
                                                            )}
                                                        </div>
                                                        <div className="space-y-0.5 min-w-0">
                                                            <Link
                                                                href={`/aset/${item.id}`}
                                                                className="font-bold text-neutral-900 hover:text-emerald-700 transition-colors block truncate max-w-sm"
                                                            >
                                                                {item.nama}
                                                            </Link>
                                                            <div className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-500">
                                                                <span>{item.kode_barang}</span>
                                                                <span>&bull;</span>
                                                                <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 rounded">
                                                                    REG: {item.nomor_register}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Golongan */}
                                                <td className="px-4 py-3.5 text-center">
                                                    <GolonganBadge golongan={item.golongan?.value || item.golongan} />
                                                </td>

                                                {/* Lokasi & Pemegang */}
                                                <td className="px-4 py-3.5 text-neutral-700">
                                                    <div className="space-y-0.5">
                                                        <div className="flex items-center gap-1 text-neutral-800 font-medium truncate">
                                                            <DoorClosed className="w-3 h-3 text-neutral-400 shrink-0" />
                                                            <span>{item.ruangan?.nama || '-'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[11px] text-neutral-500 truncate">
                                                            <Users className="w-3 h-3 text-neutral-400 shrink-0" />
                                                            <span>{item.pemegang?.nama || 'Umum'}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Tahun */}
                                                <td className="px-4 py-3.5 text-center font-mono text-neutral-700">
                                                    {item.tahun_perolehan}
                                                </td>

                                                {/* Nilai Perolehan */}
                                                <td className="px-4 py-3.5 text-right font-mono font-bold text-neutral-900">
                                                    {formatRupiah(item.nilai_perolehan || 0)}
                                                </td>

                                                {/* Kondisi */}
                                                <td className="px-4 py-3.5 text-center">
                                                    <KondisiBadge kondisi={item.kondisi?.value || item.kondisi} />
                                                </td>

                                                {/* Aksi */}
                                                <td className="px-4 py-3.5 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link
                                                            href={`/aset/${item.id}`}
                                                            className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-600 hover:text-emerald-700 transition-colors"
                                                            title="Lihat Detail Aset"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        {canUpdate && (
                                                            <Link
                                                                href={`/aset/${item.id}/edit`}
                                                                className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-600 hover:text-blue-700 transition-colors"
                                                                title="Edit Spesifikasi Aset"
                                                            >
                                                                <Edit3 className="w-4 h-4" />
                                                            </Link>
                                                        )}
                                                        <a
                                                            href={`/aset/${item.id}/qr`}
                                                            className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-600 hover:text-purple-700 transition-colors"
                                                            title="Unduh Berkas QR Code"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </a>
                                                        <a
                                                            href={`/aset/cetak-label?ids=${item.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-600 hover:text-emerald-700 transition-colors"
                                                            title="Cetak Label Stiker A4"
                                                        >
                                                            <Printer className="w-4 h-4" />
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {assets.links && assets.links.length > 3 && (
                        <div className="p-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <span className="text-xs text-neutral-500">
                                Menampilkan {assets.from || 0} - {assets.to || 0} dari {assets.total} unit aset
                            </span>
                            <div className="flex gap-1 flex-wrap">
                                {assets.links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        disabled={!link.url || link.active}
                                        onClick={() => router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                                            link.active
                                                ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
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
