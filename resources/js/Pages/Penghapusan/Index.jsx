import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import EmptyState from '@/Components/EmptyState';
import { 
    Trash2, 
    Plus, 
    Search, 
    Eye, 
    Calendar, 
    FileText, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    XCircle,
    ShieldAlert
} from 'lucide-react';
import { formatDate } from '@/Utils/formatDate';

export default function PenghapusanIndex({ usulans, filters, badges }) {
    const [search, setSearch] = useState(filters.search || '');
    const currentStatus = filters.status || '';

    const handleFilterStatus = (statusVal) => {
        router.get(route('penghapusan.index'), {
            status: statusVal || undefined,
            search: search || undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('penghapusan.index'), {
            status: currentStatus || undefined,
            search: search || undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    const statusBadge = (st) => {
        const val = st?.value || st;
        switch (val) {
            case 'draft':
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-neutral-100 text-neutral-600">Draft</span>;
            case 'diajukan':
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">Menunggu Sekcam</span>;
            case 'diverifikasi':
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Menunggu Camat</span>;
            case 'dikembalikan_penatausaha':
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">Dikembalikan Sekcam</span>;
            case 'dikembalikan_camat':
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">Dikembalikan Camat</span>;
            case 'disetujui':
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">Disetujui Camat</span>;
            case 'selesai':
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-600 text-white">SK Terbit (Selesai)</span>;
            default:
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-neutral-100 text-neutral-600">{val}</span>;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Usulan Penghapusan BMD - SIMUKTI" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-neutral-900">Usulan Penghapusan Aset BMD</h1>
                            <p className="text-sm text-neutral-500">
                                Alur persetujuan berjenjang: Pengurus Barang → Verifikasi Sekcam → Persetujuan Camat → SK Final.
                            </p>
                        </div>
                    </div>
                    <Link
                        href={route('penghapusan.create')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Buat Usulan Baru</span>
                    </Link>
                </div>

                {/* Tabs Filter Status */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
                    <button
                        onClick={() => handleFilterStatus('')}
                        className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap ${
                            currentStatus === '' ? 'bg-neutral-900 text-white shadow-sm' : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                        }`}
                    >
                        Semua Usulan
                    </button>
                    <button
                        onClick={() => handleFilterStatus('diajukan')}
                        className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                            currentStatus === 'diajukan' ? 'bg-amber-600 text-white shadow-sm' : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                        }`}
                    >
                        <span>Menunggu Sekcam</span>
                        {badges.pending_sekcam > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px]">
                                {badges.pending_sekcam}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => handleFilterStatus('diverifikasi')}
                        className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                            currentStatus === 'diverifikasi' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                        }`}
                    >
                        <span>Menunggu Camat</span>
                        {badges.pending_camat > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-blue-200 text-blue-900 text-[10px]">
                                {badges.pending_camat}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => handleFilterStatus('dikembalikan_penatausaha')}
                        className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                            currentStatus === 'dikembalikan_penatausaha' ? 'bg-red-600 text-white shadow-sm' : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                        }`}
                    >
                        <span>Perlu Revisi</span>
                        {badges.dikembalikan > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-red-200 text-red-900 text-[10px]">
                                {badges.dikembalikan}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => handleFilterStatus('selesai')}
                        className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap ${
                            currentStatus === 'selesai' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                        }`}
                    >
                        Selesai (SK Terbit)
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                    {usulans.data && usulans.data.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-neutral-50 text-xs text-neutral-500 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-5 py-3.5">Nomor Usulan & Tanggal</th>
                                            <th className="px-5 py-3.5">Alasan Umum</th>
                                            <th className="px-5 py-3.5 text-center">Jumlah Aset</th>
                                            <th className="px-5 py-3.5 text-center">Status Alur</th>
                                            <th className="px-5 py-3.5 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                        {usulans.data.map((u) => (
                                            <tr key={u.id} className="hover:bg-neutral-50/70 transition-colors">
                                                <td className="px-5 py-4">
                                                    <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                                                        <FileText className="w-4 h-4 text-red-600" />
                                                        <span>{u.nomor}</span>
                                                    </div>
                                                    <div className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        <span>{formatDate(u.tanggal)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <p className="text-sm text-neutral-800 line-clamp-2">
                                                        {u.alasan_umum}
                                                    </p>
                                                    {u.nomor_sk_penghapusan && (
                                                        <div className="text-xs text-emerald-700 font-semibold mt-1">
                                                            SK: {u.nomor_sk_penghapusan} ({formatDate(u.tanggal_sk)})
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 text-center font-bold text-neutral-900 text-sm">
                                                    {u.items_count} Unit
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    {statusBadge(u.status)}
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <Link
                                                        href={route('penghapusan.show', u.id)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-semibold transition-colors"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>Detail & Approval</span>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {usulans.links && usulans.links.length > 3 && (
                                <div className="px-5 py-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                                    <div>
                                        Menampilkan {usulans.from || 0} - {usulans.to || 0} dari {usulans.total} usulan
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {usulans.links.map((link, idx) => (
                                            <Link
                                                key={idx}
                                                href={link.url || '#'}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                                                    link.active
                                                        ? 'bg-neutral-900 text-white'
                                                        : link.url
                                                        ? 'text-neutral-600 hover:bg-neutral-100'
                                                        : 'text-neutral-300 pointer-events-none'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <EmptyState
                            icon={Trash2}
                            title="Belum Ada Usulan Penghapusan"
                            description="Belum ada berkas usulan penghapusan aset yang terdaftar pada filter ini."
                            actionLabel="Buat Usulan Baru"
                            actionHref={route('penghapusan.create')}
                        />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
