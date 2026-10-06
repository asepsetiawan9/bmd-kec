import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Box,
    Layers,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Plus,
    FileSpreadsheet,
    Sparkles,
    ArrowUpRight,
} from 'lucide-react';

export default function DashboardIndex({ stats = {}, recentAset = [] }) {
    const { auth, pengaturan } = usePage().props;
    const user = auth?.user;

    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    return (
        <AuthenticatedLayout title="Dashboard BMD">
            <Head title="Dashboard - SIMUKTI" />

            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg mb-6 relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-medium mb-3 backdrop-blur border border-white/10">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Pemerintah Kecamatan Mekarmukti — SIMUKTI v3.0</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                            Selamat Datang, {user?.name || 'Pengguna'}!
                        </h1>
                        <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-xl">
                            Sistem Informasi Manajemen Aset Daerah Kecamatan Mekarmukti. Pengelolaan inventaris, pencetakan KIB/KIR, dan pelacakan QR label terintegrasi.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <Link
                            href="/aset/create"
                            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Tambah Aset Baru
                        </Link>
                        <Link
                            href="/laporan"
                            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-4 py-2.5 rounded-xl backdrop-blur transition-all border border-white/15"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            Laporan KIB/KIR
                        </Link>
                    </div>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Total Aset</p>
                        <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.total_aset || 0}</p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">Unit terdaftar</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Box className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Valuasi Aset</p>
                        <p className="text-xl font-bold text-neutral-900 mt-1 truncate max-w-[160px]">
                            {formatRupiah(stats.total_nilai || 0)}
                        </p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">Nilai perolehan</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Layers className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Kondisi Baik</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.kondisi_baik || 0}</p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">Siap operasional</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Perlu Perhatian</p>
                        <p className="text-2xl font-bold text-amber-600 mt-1">
                            {(stats.kondisi_rusak_ringan || 0) + (stats.kondisi_rusak_berat || 0)}
                        </p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">Rusak ringan / berat</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Quick Actions & Recent Items */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-bold text-neutral-900">Aset Terbaru Terdaftar</h2>
                        <Link
                            href="/aset"
                            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                        >
                            Lihat Semua <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {recentAset.length === 0 ? (
                        <div className="py-12 text-center text-neutral-400 text-sm">
                            <Box className="w-10 h-10 mx-auto mb-2 text-neutral-300" />
                            Belum ada aset terdaftar. Silakan lakukan inventarisasi awal.
                        </div>
                    ) : (
                        <div className="divide-y divide-neutral-100">
                            {recentAset.map((item) => (
                                <div key={item.id} className="py-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-neutral-900">{item.nama}</p>
                                        <p className="text-xs text-neutral-400 font-mono">{item.kode_barang} &bull; Reg: {item.nomor_register || '-'}</p>
                                    </div>
                                    <span className="text-xs font-bold text-neutral-700">{formatRupiah(item.nilai_perolehan)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 flex flex-col justify-between">
                    <div>
                        <h2 className="text-base font-bold text-neutral-900 mb-2">Informasi Instansi</h2>
                        <p className="text-xs text-neutral-500 mb-4">
                            Sistem Pengelolaan Barang Milik Daerah terdaftar untuk entitas:
                        </p>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between py-1.5 border-b border-neutral-100">
                                <span className="text-neutral-500">Kecamatan:</span>
                                <span className="font-semibold text-neutral-800">Mekarmukti</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-neutral-100">
                                <span className="text-neutral-500">Kabupaten:</span>
                                <span className="font-semibold text-neutral-800">Garut</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-neutral-100">
                                <span className="text-neutral-500">Regulasi:</span>
                                <span className="font-semibold text-neutral-800">Permendagri 108/2016</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-neutral-100 text-center">
                        <Link
                            href="/aset"
                            className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
                        >
                            Buka Daftar Inventaris Aset
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
