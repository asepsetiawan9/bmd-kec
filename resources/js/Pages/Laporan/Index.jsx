import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import KondisiBadge from '@/Components/KondisiBadge';
import GolonganBadge from '@/Components/GolonganBadge';
import { formatRupiah } from '@/Utils/formatRupiah';
import { toast } from 'sonner';
import {
    FileSpreadsheet,
    FileText,
    Filter,
    RotateCcw,
    Download,
    Calendar,
    DoorClosed,
    Package,
    Search,
    BookOpen,
    Layers,
    ArrowLeftRight,
    Trash2,
    ClipboardCheck,
    CheckCircle2,
    AlertTriangle,
    XCircle,
} from 'lucide-react';

export default function LaporanIndex({
    reportData = {},
    golonganOptions = [],
    kondisiOptions = [],
    ruanganOptions = [],
    jenisLaporanOptions = [],
}) {
    const { auth } = usePage().props;
    const userRole = auth?.user?.role;
    const permissions = auth?.user?.permissions || [];
    const canExport = permissions.includes('laporan.export') || ['super_admin', 'pengurus_barang', 'penatausaha', 'camat'].includes(userRole);

    const filters = reportData.filters || {};
    const [activeJenis, setActiveJenis] = useState(filters.jenis_laporan || 'rekap');

    const [formFilters, setFormFilters] = useState({
        jenis_laporan: filters.jenis_laporan || 'rekap',
        golongan: filters.golongan || '',
        kondisi: filters.kondisi || '',
        ruangan_id: filters.ruangan_id || '',
        tahun_perolehan: filters.tahun_perolehan || '',
        search: filters.search || '',
    });

    const handleSelectJenis = (jenis) => {
        setActiveJenis(jenis);
        const updated = { ...formFilters, jenis_laporan: jenis };
        setFormFilters(updated);
        router.get('/laporan', updated, { preserveState: true, replace: true });
        toast.info(`Beralih ke ${jenisLaporanOptions.find((j) => j.value === jenis)?.label || 'Laporan'}`);
    };

    const handleApplyFilter = (e) => {
        e?.preventDefault();
        router.get('/laporan', formFilters, { preserveState: true, replace: true });
        toast.info('Filter laporan diterapkan');
    };

    const handleResetFilter = () => {
        const reset = {
            jenis_laporan: activeJenis,
            golongan: '',
            kondisi: '',
            ruangan_id: '',
            tahun_perolehan: '',
            search: '',
        };
        setFormFilters(reset);
        router.get('/laporan', reset, { preserveState: true, replace: true });
        toast.info('Filter dibersihkan');
    };

    const buildExportUrl = (type) => {
        const params = new URLSearchParams();
        Object.entries(formFilters).forEach(([key, val]) => {
            if (val) params.append(key, val);
        });
        return `/laporan/export/${type}?${params.toString()}`;
    };

    const handleExport = (type) => {
        const url = buildExportUrl(type);
        toast.success(`Memproses unduhan file ${type.toUpperCase()} resmi...`);
        window.location.href = url;
    };

    const summary = reportData.summary || {};
    const asetList = reportData.asetList || [];
    const mutasiList = reportData.mutasiList || [];
    const usulanList = reportData.usulanList || [];
    const opnameItems = reportData.opnameItems || [];

    // Quick categories definition
    const reportCategories = [
        { id: 'rekap', name: 'Buku Inventaris', desc: 'Rekapitulasi seluruh BMD per golongan & kondisi', icon: BookOpen, color: 'from-emerald-600 to-teal-700' },
        { id: 'kir', name: 'KIR Ruangan', desc: 'Kartu Inventaris Ruangan untuk ditempel di pintu/dinding', icon: DoorClosed, color: 'from-blue-600 to-cyan-700' },
        { id: 'kib_a', name: 'KIB A (Tanah)', desc: 'Kartu Inventaris Tanah, luas & legalitas sertifikat', icon: Layers, color: 'from-amber-600 to-yellow-700' },
        { id: 'kib_b', name: 'KIB B (Peralatan)', desc: 'Kendaraan bermotor, mesin, komputer & mebel', icon: Package, color: 'from-indigo-600 to-blue-700' },
        { id: 'kib_c', name: 'KIB C (Gedung)', desc: 'Kantor, balai pertemuan, dan konstruksi gedung', icon: Layers, color: 'from-emerald-700 to-green-800' },
        { id: 'kib_d', name: 'KIB D (Jalan/Jaringan)', desc: 'Jalan lingkungan, irigasi, dan jaringan instalasi', icon: Layers, color: 'from-purple-600 to-indigo-700' },
        { id: 'mutasi', name: 'Laporan Mutasi', desc: 'Riwayat pemindahan ruangan, pemegang & arsip BAST', icon: ArrowLeftRight, color: 'from-teal-600 to-emerald-700' },
        { id: 'penghapusan', name: 'Usulan Penghapusan', desc: 'Daftar barang rusak berat, persetujuan & SK', icon: Trash2, color: 'from-rose-600 to-red-700' },
        { id: 'inventarisasi', name: 'Hasil Sensus / Opname', desc: 'Rekapitulasi temuan fisik lapangan semester/tahunan', icon: ClipboardCheck, color: 'from-sky-600 to-blue-800' },
    ];

    return (
        <AuthenticatedLayout title="Pusat Laporan & Ekspor Data BMD">
            <Head title="Pusat Laporan BMD - SIMUKTI" />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Permendagri 108/2016 Standardized</span>
                        </div>
                        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
                            Pusat Laporan & Rekapitulasi BMD
                        </h2>
                        <p className="text-xs text-neutral-500 mt-0.5">
                            Dokumen cetak kedinasan resmi Pemerintah Kecamatan Mekarmukti, Kabupaten Garut.
                        </p>
                    </div>

                    {canExport && (
                        <div className="flex items-center gap-2.5 shrink-0">
                            <button
                                onClick={() => handleExport('excel')}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-sm transition-all"
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                <span>Unduh Excel (.xlsx)</span>
                            </button>

                            <button
                                onClick={() => handleExport('pdf')}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-sm transition-all"
                            >
                                <FileText className="w-4 h-4" />
                                <span>Unduh PDF Resmi</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Report Type Selector Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {reportCategories.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = activeJenis === cat.id;
                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => handleSelectJenis(cat.id)}
                                className={`text-left p-3.5 rounded-xl border transition-all relative overflow-hidden group ${
                                    isSelected
                                        ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                                        : 'bg-white border-neutral-200 hover:border-neutral-300 hover:shadow-xs'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white mb-2.5 bg-gradient-to-br ${cat.color} shadow-xs`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <h3 className={`text-xs font-bold leading-snug ${isSelected ? 'text-emerald-700' : 'text-neutral-900'}`}>
                                    {cat.name}
                                </h3>
                                <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">
                                    {cat.desc}
                                </p>
                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* KPI Metrics Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
                        <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Total Data</span>
                        <p className="text-xl font-bold text-neutral-900 mt-0.5">
                            {summary.total_aset ?? summary.total_mutasi ?? summary.total_usulan ?? summary.total_item ?? 0}
                        </p>
                        <span className="text-[10px] text-neutral-400">Entri tercatat</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
                        <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Valuasi Nilai</span>
                        <p className="text-lg font-bold text-emerald-700 mt-0.5 truncate">
                            {formatRupiah(summary.total_nilai || 0)}
                        </p>
                        <span className="text-[10px] text-neutral-400">Nilai buku perolehan</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
                        <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Kondisi Baik</span>
                        <p className="text-xl font-bold text-emerald-600 mt-0.5">
                            {summary.baik ?? '-'}
                        </p>
                        <span className="text-[10px] text-neutral-400">Siap guna operasional</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
                        <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Rusak Berat</span>
                        <p className="text-xl font-bold text-rose-600 mt-0.5">
                            {summary.rusak_berat ?? '-'}
                        </p>
                        <span className="text-[10px] text-neutral-400">Kandidat penghapusan</span>
                    </div>
                </div>

                {/* Filter Bar */}
                <form onSubmit={handleApplyFilter} className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        <div>
                            <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                                Jenis Laporan
                            </label>
                            <select
                                value={formFilters.jenis_laporan}
                                onChange={(e) => {
                                    setFormFilters({ ...formFilters, jenis_laporan: e.target.value });
                                    setActiveJenis(e.target.value);
                                }}
                                className="w-full text-xs rounded-lg border-neutral-200 focus:border-emerald-500 focus:ring-emerald-500"
                            >
                                {jenisLaporanOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                                Ruangan / Lokasi
                            </label>
                            <select
                                value={formFilters.ruangan_id}
                                onChange={(e) => setFormFilters({ ...formFilters, ruangan_id: e.target.value })}
                                className="w-full text-xs rounded-lg border-neutral-200 focus:border-emerald-500 focus:ring-emerald-500"
                            >
                                <option value="">Semua Ruangan</option>
                                {ruanganOptions.map((r) => (
                                    <option key={r.id} value={r.id}>{r.nama}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                                Kondisi Fisik
                            </label>
                            <select
                                value={formFilters.kondisi}
                                onChange={(e) => setFormFilters({ ...formFilters, kondisi: e.target.value })}
                                className="w-full text-xs rounded-lg border-neutral-200 focus:border-emerald-500 focus:ring-emerald-500"
                            >
                                <option value="">Semua Kondisi</option>
                                {kondisiOptions.map((k) => (
                                    <option key={k.value} value={k.value}>{k.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                                Tahun Perolehan
                            </label>
                            <input
                                type="number"
                                placeholder="Contoh: 2024"
                                value={formFilters.tahun_perolehan}
                                onChange={(e) => setFormFilters({ ...formFilters, tahun_perolehan: e.target.value })}
                                className="w-full text-xs rounded-lg border-neutral-200 focus:border-emerald-500 focus:ring-emerald-500"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                                Pencarian Kata Kunci
                            </label>
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Nama barang / kode..."
                                    value={formFilters.search}
                                    onChange={(e) => setFormFilters({ ...formFilters, search: e.target.value })}
                                    className="w-full pl-8 text-xs rounded-lg border-neutral-200 focus:border-emerald-500 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                        <button
                            type="button"
                            onClick={handleResetFilter}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reset Filter</span>
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            <span>Terapkan Filter</span>
                        </button>
                    </div>
                </form>

                {/* Interactive Preview Table */}
                <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center justify-between">
                        <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                            <span>Pratinjau Data: {jenisLaporanOptions.find((j) => j.value === activeJenis)?.label || 'Laporan'}</span>
                        </h3>
                        <span className="text-[11px] text-neutral-400">
                            Menampilkan {activeJenis === 'mutasi' ? mutasiList.length : activeJenis === 'penghapusan' ? usulanList.length : activeJenis === 'inventarisasi' ? opnameItems.length : asetList.length} baris data
                        </span>
                    </div>

                    {/* Preview Table Body */}
                    {activeJenis === 'mutasi' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                                    <tr>
                                        <th className="py-2.5 px-3">No</th>
                                        <th className="py-2.5 px-3">Nomor BAST</th>
                                        <th className="py-2.5 px-3">Tanggal</th>
                                        <th className="py-2.5 px-3">Nama Barang</th>
                                        <th className="py-2.5 px-3">Kode Barang</th>
                                        <th className="py-2.5 px-3">Dari Ruangan</th>
                                        <th className="py-2.5 px-3">Ke Ruangan</th>
                                        <th className="py-2.5 px-3">Dari Pemegang</th>
                                        <th className="py-2.5 px-3">Ke Pemegang</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {mutasiList.map((m, idx) => (
                                        <tr key={m.id} className="hover:bg-neutral-50/70">
                                            <td className="py-2.5 px-3 text-neutral-500">{idx + 1}</td>
                                            <td className="py-2.5 px-3 font-mono font-medium text-emerald-800">{m.nomor_bast}</td>
                                            <td className="py-2.5 px-3">{m.tanggal ? new Date(m.tanggal).toLocaleDateString('id-ID') : '-'}</td>
                                            <td className="py-2.5 px-3 font-semibold text-neutral-900">{m.aset?.nama_barang}</td>
                                            <td className="py-2.5 px-3 font-mono text-neutral-500">{m.aset?.kode_barang}</td>
                                            <td className="py-2.5 px-3 text-neutral-500">{m.dari_ruangan?.nama_ruangan || '-'}</td>
                                            <td className="py-2.5 px-3 font-medium text-emerald-700">{m.ke_ruangan?.nama_ruangan || '-'}</td>
                                            <td className="py-2.5 px-3 text-neutral-500">{m.dari_pegawai?.nama || '-'}</td>
                                            <td className="py-2.5 px-3 font-medium text-neutral-800">{m.ke_pegawai?.nama || '-'}</td>
                                        </tr>
                                    ))}
                                    {mutasiList.length === 0 && (
                                        <tr>
                                            <td colSpan={9} className="py-8 text-center text-neutral-400">Tidak ada riwayat mutasi.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : activeJenis === 'penghapusan' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                                    <tr>
                                        <th className="py-2.5 px-3">No</th>
                                        <th className="py-2.5 px-3">Nomor Usulan</th>
                                        <th className="py-2.5 px-3">Tanggal</th>
                                        <th className="py-2.5 px-3">Status</th>
                                        <th className="py-2.5 px-3">Alasan Umum</th>
                                        <th className="py-2.5 px-3">Jumlah Item</th>
                                        <th className="py-2.5 px-3">No SK</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {usulanList.map((u, idx) => (
                                        <tr key={u.id} className="hover:bg-neutral-50/70">
                                            <td className="py-2.5 px-3 text-neutral-500">{idx + 1}</td>
                                            <td className="py-2.5 px-3 font-mono font-medium text-neutral-900">{u.nomor}</td>
                                            <td className="py-2.5 px-3">{u.tanggal ? new Date(u.tanggal).toLocaleDateString('id-ID') : '-'}</td>
                                            <td className="py-2.5 px-3 font-semibold uppercase">{u.status}</td>
                                            <td className="py-2.5 px-3 text-neutral-600">{u.alasan_umum}</td>
                                            <td className="py-2.5 px-3 font-medium">{u.items?.length || 0} unit</td>
                                            <td className="py-2.5 px-3 font-mono text-neutral-500">{u.nomor_sk_penghapusan || '-'}</td>
                                        </tr>
                                    ))}
                                    {usulanList.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="py-8 text-center text-neutral-400">Tidak ada usulan penghapusan.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                                    <tr>
                                        <th className="py-2.5 px-3">No</th>
                                        <th className="py-2.5 px-3">Kode Barang</th>
                                        <th className="py-2.5 px-3">Register</th>
                                        <th className="py-2.5 px-3">Nama Barang</th>
                                        <th className="py-2.5 px-3">Golongan</th>
                                        <th className="py-2.5 px-3">Kondisi</th>
                                        <th className="py-2.5 px-3">Ruangan</th>
                                        <th className="py-2.5 px-3">Tahun</th>
                                        <th className="py-2.5 px-3 text-right">Nilai Perolehan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {asetList.map((a, idx) => (
                                        <tr key={a.id} className="hover:bg-neutral-50/70">
                                            <td className="py-2.5 px-3 text-neutral-500">{idx + 1}</td>
                                            <td className="py-2.5 px-3 font-mono font-medium text-neutral-800">{a.kode_barang}</td>
                                            <td className="py-2.5 px-3 font-mono text-neutral-500">{a.nomor_register}</td>
                                            <td className="py-2.5 px-3 font-semibold text-neutral-900">{a.nama_barang}</td>
                                            <td className="py-2.5 px-3">
                                                <GolonganBadge golongan={a.golongan} />
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <KondisiBadge kondisi={a.kondisi} />
                                            </td>
                                            <td className="py-2.5 px-3 text-neutral-600">{a.ruangan?.nama_ruangan || '-'}</td>
                                            <td className="py-2.5 px-3 text-neutral-600">{a.tahun_perolehan}</td>
                                            <td className="py-2.5 px-3 text-right font-mono font-medium text-neutral-900">
                                                {formatRupiah(a.nilai_perolehan)}
                                            </td>
                                        </tr>
                                    ))}
                                    {asetList.length === 0 && (
                                        <tr>
                                            <td colSpan={9} className="py-8 text-center text-neutral-400">
                                                Tidak ada data aset ditemukan untuk kriteria filter ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
