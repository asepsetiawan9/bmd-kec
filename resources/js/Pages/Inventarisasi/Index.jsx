import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import EmptyState from '@/Components/EmptyState';
import Modal from '@/Components/Modal';
import { 
    ClipboardCheck, 
    Plus, 
    Smartphone, 
    Eye, 
    Calendar, 
    CheckCircle2, 
    AlertCircle, 
    Clock, 
    Building2, 
    X,
    ArrowRight
} from 'lucide-react';
import { formatDate } from '@/Utils/formatDate';
import { toast } from 'sonner';

export default function InventarisasiIndex({ sessions, activeSession, activeProgress, ruangans, filters }) {
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        nama: `Sensus Fisik BMD ${new Date().getFullYear()}`,
        tanggal_mulai: new Date().toISOString().split('T')[0],
        ruangan_scope: '',
    });

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('inventarisasi.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                reset();
                toast.success('Sesi inventarisasi baru berhasil dimulai.');
            },
            onError: (err) => {
                const msg = Object.values(err)[0] || 'Gagal memulai sesi inventarisasi.';
                toast.error(msg);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Inventarisasi (Stock Opname) - SIMUKTI" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <ClipboardCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-neutral-900">Sensus Fisik (Stock Opname)</h1>
                            <p className="text-sm text-neutral-500">
                                Verifikasi berkala keberadaan fisik dan kondisi Barang Milik Daerah langsung di lapangan.
                            </p>
                        </div>
                    </div>
                    {!activeSession && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Mulai Sesi Sensus Baru</span>
                        </button>
                    )}
                </div>

                {/* Banner Sesi Berjalan Aktif */}
                {activeSession && activeProgress && (
                    <div className="bg-gradient-to-r from-emerald-900 to-teal-800 text-white p-6 rounded-2xl shadow-md relative overflow-hidden">
                        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 pointer-events-none transform skew-x-12" />
                        
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 rounded-full text-xs font-semibold">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>SESI SEDANG BERJALAN</span>
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight">{activeSession.nama}</h2>
                                <p className="text-emerald-200 text-sm">
                                    Kode: <span className="font-mono">{activeSession.kode}</span> • Dimulai: {formatDate(activeSession.tanggal_mulai)}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <Link
                                    href={route('inventarisasi.sensus-lapangan', activeSession.id)}
                                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-sm rounded-xl transition-all shadow-md"
                                >
                                    <Smartphone className="w-4 h-4" />
                                    <span>Sensus Mobile (HP)</span>
                                </Link>

                                <Link
                                    href={route('inventarisasi.show', activeSession.id)}
                                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white/15 hover:bg-white/25 text-white font-semibold text-sm rounded-xl transition-all border border-white/20"
                                >
                                    <span>Detail Sesi</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-6 pt-5 border-t border-emerald-700/60">
                            <div className="flex items-center justify-between text-xs font-medium text-emerald-200 mb-2">
                                <span>Progres Pemeriksaan Fisik: {activeProgress.sudah_dicek} dari {activeProgress.total} Aset</span>
                                <span className="font-bold text-white text-sm">{activeProgress.persentase}%</span>
                            </div>
                            <div className="w-full bg-emerald-950/60 rounded-full h-3 overflow-hidden p-0.5">
                                <div
                                    className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${activeProgress.persentase}%` }}
                                />
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-xs text-emerald-200">
                                <span>🟢 Ditemukan: <strong>{activeProgress.ditemukan}</strong></span>
                                <span>🔴 Belum/Tidak Ditemukan: <strong>{activeProgress.tidak_ditemukan}</strong></span>
                                <span>⚪ Belum Diperiksa: <strong>{activeProgress.belum_dicek}</strong></span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabel Riwayat Sesi */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                    <div className="p-5 border-b border-neutral-100">
                        <h2 className="font-bold text-neutral-900 text-sm uppercase tracking-wider">
                            Riwayat Sesi Inventarisasi
                        </h2>
                    </div>

                    {sessions.data && sessions.data.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-neutral-50 text-xs text-neutral-500 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-5 py-3.5">Kode & Nama Sesi</th>
                                        <th className="px-5 py-3.5">Periode Pelaksanaan</th>
                                        <th className="px-5 py-3.5">Cakupan Ruangan</th>
                                        <th className="px-5 py-3.5 text-center">Jumlah Aset</th>
                                        <th className="px-5 py-3.5 text-center">Status</th>
                                        <th className="px-5 py-3.5 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {sessions.data.map((s) => (
                                        <tr key={s.id} className="hover:bg-neutral-50/70 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-neutral-900">{s.nama}</div>
                                                <div className="text-xs font-mono text-neutral-400 mt-0.5">{s.kode}</div>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-neutral-600">
                                                <div>Mulai: {formatDate(s.tanggal_mulai)}</div>
                                                {s.tanggal_selesai && (
                                                    <div className="text-neutral-400 mt-0.5">Selesai: {formatDate(s.tanggal_selesai)}</div>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-xs text-neutral-600">
                                                {s.ruangan_scope ? (
                                                    <span className="font-medium text-emerald-700">{s.ruangan_scope.nama}</span>
                                                ) : (
                                                    <span className="text-neutral-500">Semua Ruangan Kecamatan</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-center font-medium text-neutral-900 text-xs">
                                                {s.items_count} Aset
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                {s.status?.value === 'berjalan' || s.status === 'berjalan' ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                                        Berjalan
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700">
                                                        Selesai
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <Link
                                                    href={route('inventarisasi.show', s.id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-medium transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>Lihat Progres</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState
                            icon={ClipboardCheck}
                            title="Belum Ada Sesi Inventarisasi"
                            description="Belum ada sesi sensus fisik aset yang pernah diselenggarakan."
                            actionLabel="Mulai Sesi Pertama"
                            onAction={() => setShowCreateModal(true)}
                        />
                    )}
                </div>
            </div>

            {/* Modal Tambah Sesi */}
            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="md">
                <form onSubmit={handleCreate} className="p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                        <div className="flex items-center gap-2">
                            <ClipboardCheck className="w-5 h-5 text-emerald-600" />
                            <h2 className="text-base font-bold text-neutral-900">Mulai Sesi Inventarisasi Baru</h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">
                            Nama Sesi Sensus <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Contoh: Sensus Fisik BMD Semester II 2026"
                            value={data.nama}
                            onChange={(e) => setData('nama', e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                            required
                        />
                        {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">
                            Tanggal Mulai <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={data.tanggal_mulai}
                            onChange={(e) => setData('tanggal_mulai', e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                            required
                        />
                        {errors.tanggal_mulai && <p className="text-red-500 text-xs mt-1">{errors.tanggal_mulai}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">
                            Cakupan Ruangan (Opsional)
                        </label>
                        <select
                            value={data.ruangan_scope}
                            onChange={(e) => setData('ruangan_scope', e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">-- Seluruh Ruangan (Sensus Menyeluruh) --</option>
                            {ruangans.map((r) => (
                                <option key={r.id} value={r.id}>{r.nama} ({r.kode})</option>
                            ))}
                        </select>
                        <p className="text-[11px] text-neutral-400 mt-1">
                            Jika dikosongkan, seluruh aset aktif di kecamatan akan dimasukkan ke dalam daftar sensus.
                        </p>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100">
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100 rounded-xl"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                        >
                            {processing ? 'Membuat Sesi...' : 'Mulai Sesi Sensus'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
