import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    History,
    Search,
    Filter,
    RotateCcw,
    User,
    Calendar,
    Database,
    Tag,
    ChevronDown,
    ChevronUp,
    ShieldAlert,
    CheckCircle2,
    Eye,
} from 'lucide-react';

export default function AuditTrailIndex({
    sistemLogs = { data: [] },
    asetLogs = { data: [] },
    currentTab = 'sistem',
    filters = {},
}) {
    const [tab, setTab] = useState(currentTab);
    const [search, setSearch] = useState(filters.search || '');
    const [aksi, setAksi] = useState(filters.aksi || '');
    const [expandedRow, setExpandedRow] = useState(null);

    const handleTabChange = (newTab) => {
        setTab(newTab);
        router.get('/log-aktivitas', { tab: newTab, search, aksi }, { preserveState: true, replace: true });
    };

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get('/log-aktivitas', { tab, search, aksi }, { preserveState: true, replace: true });
    };

    const handleReset = () => {
        setSearch('');
        setAksi('');
        router.get('/log-aktivitas', { tab }, { preserveState: true, replace: true });
    };

    const activeData = tab === 'sistem' ? sistemLogs : asetLogs;

    return (
        <AuthenticatedLayout title="Jejak Audit & Log Aktivitas">
            <Head title="Log Aktivitas & Audit Trail - SIMUKTI" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-1">
                            <History className="w-3.5 h-3.5" />
                            <span>Forensic & Compliance Trail</span>
                        </div>
                        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
                            Audit Trail & Rekam Jejak Sistem
                        </h2>
                        <p className="text-xs text-neutral-500 mt-0.5">
                            Pencatatan seluruh mutasi data, tindakan verifikasi, dan autentikasi untuk akuntabilitas internal.
                        </p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex bg-neutral-100 p-1 rounded-xl">
                        <button
                            type="button"
                            onClick={() => handleTabChange('sistem')}
                            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                                tab === 'sistem'
                                    ? 'bg-white text-emerald-800 shadow-xs'
                                    : 'text-neutral-500 hover:text-neutral-900'
                            }`}
                        >
                            Log Aktivitas Sistem
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTabChange('aset')}
                            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                                tab === 'aset'
                                    ? 'bg-white text-emerald-800 shadow-xs'
                                    : 'text-neutral-500 hover:text-neutral-900'
                            }`}
                        >
                            Riwayat Mutasi & Aset
                        </button>
                    </div>
                </div>

                {/* Filter Bar */}
                <form onSubmit={handleFilter} className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Cari user, aksi, keterangan, atau nama aset..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 text-xs rounded-lg border-neutral-200 focus:border-emerald-500 focus:ring-emerald-500"
                        />
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="p-2 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
                            title="Reset filter"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            <span>Filter</span>
                        </button>
                    </div>
                </form>

                {/* Table Records */}
                <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                                <tr>
                                    <th className="py-3 px-4">Waktu</th>
                                    <th className="py-3 px-4">Pengguna</th>
                                    <th className="py-3 px-4">Tindakan / Aksi</th>
                                    {tab === 'sistem' ? (
                                        <th className="py-3 px-4">Tabel Terkait</th>
                                    ) : (
                                        <th className="py-3 px-4">Aset Terkait</th>
                                    )}
                                    <th className="py-3 px-4">Keterangan</th>
                                    {tab === 'aset' && <th className="py-3 px-4 text-center">Data Snapshot</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {activeData.data.map((log) => {
                                    const isExpanded = expandedRow === log.id;
                                    return (
                                        <React.Fragment key={log.id}>
                                            <tr className="hover:bg-neutral-50/70 transition-colors">
                                                <td className="py-3 px-4 text-neutral-500 whitespace-nowrap font-mono text-[11px]">
                                                    {log.created_at ? new Date(log.created_at).toLocaleString('id-ID') : '-'}
                                                </td>
                                                <td className="py-3 px-4 font-medium text-neutral-900">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                                                            {log.user?.name ? log.user.name.charAt(0).toUpperCase() : 'S'}
                                                        </div>
                                                        <span>{log.user?.name || 'Sistem / Anonim'}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="font-mono uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 border border-neutral-200">
                                                        {log.aksi instanceof Object ? log.aksi?.value || log.aksi : log.aksi}
                                                    </span>
                                                </td>
                                                {tab === 'sistem' ? (
                                                    <td className="py-3 px-4 font-mono text-neutral-600">
                                                        {log.tabel_terkait || '-'} #{log.record_id || '-'}
                                                    </td>
                                                ) : (
                                                    <td className="py-3 px-4 font-semibold text-neutral-900">
                                                        {log.aset?.nama || log.aset?.nama_barang || `#${log.aset_id}`}
                                                    </td>
                                                )}
                                                <td className="py-3 px-4 text-neutral-600 max-w-xs truncate">
                                                    {log.keterangan || '-'}
                                                </td>
                                                {tab === 'aset' && (
                                                    <td className="py-3 px-4 text-center">
                                                        {(log.data_sebelum || log.data_sesudah) ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => setExpandedRow(isExpanded ? null : log.id)}
                                                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
                                                            >
                                                                <Eye className="w-3.5 h-3.5" />
                                                                <span>{isExpanded ? 'Tutup' : 'Lihat'}</span>
                                                            </button>
                                                        ) : (
                                                            <span className="text-neutral-400">-</span>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>

                                            {/* Expanded Snapshot View for Aset */}
                                            {isExpanded && tab === 'aset' && (
                                                <tr className="bg-neutral-50/90">
                                                    <td colSpan={6} className="p-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                                                            <div className="p-3 rounded-lg bg-rose-50/60 border border-rose-200">
                                                                <p className="font-bold text-rose-800 mb-1 text-[11px]">DATA SEBELUM:</p>
                                                                <pre className="text-[11px] text-rose-950 whitespace-pre-wrap overflow-x-auto">
                                                                    {log.data_sebelum ? JSON.stringify(log.data_sebelum, null, 2) : '(Kosong)'}
                                                                </pre>
                                                            </div>
                                                            <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
                                                                <p className="font-bold text-emerald-800 mb-1 text-[11px]">DATA SESUDAH:</p>
                                                                <pre className="text-[11px] text-emerald-950 whitespace-pre-wrap overflow-x-auto">
                                                                    {log.data_sesudah ? JSON.stringify(log.data_sesudah, null, 2) : '(Kosong)'}
                                                                </pre>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}

                                {activeData.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-neutral-400">
                                            Belum ada rekam jejak aktivitas yang tercatat.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Links */}
                    {activeData.links && activeData.links.length > 3 && (
                        <div className="p-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                            <span>Total {activeData.total} catatan riwayat</span>
                            <div className="flex gap-1">
                                {activeData.links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        disabled={!link.url || link.active}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-2.5 py-1 rounded text-xs transition-colors ${
                                            link.active
                                                ? 'bg-emerald-600 text-white font-bold'
                                                : link.url
                                                ? 'hover:bg-neutral-100 text-neutral-700'
                                                : 'text-neutral-300 cursor-not-allowed'
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
