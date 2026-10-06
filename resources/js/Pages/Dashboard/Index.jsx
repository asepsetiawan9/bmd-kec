import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GolonganBadge from '@/Components/GolonganBadge';
import KondisiBadge from '@/Components/KondisiBadge';
import { formatRupiah } from '@/Utils/formatRupiah';
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
    ArrowLeftRight,
    ClipboardCheck,
    Wrench,
    Trash2,
    Building2,
    ShieldCheck,
    Clock,
    UserCheck,
    ExternalLink,
} from 'lucide-react';

export default function DashboardIndex({ dashboardData = {}, userRole = 'pengurus_barang' }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const variant = dashboardData.variant || userRole || 'pengurus_barang';
    const stats = dashboardData.stats || {};

    const totalAset = stats.total_aset || 0;
    const kondisi = stats.kondisi || {};
    const baikCount = kondisi.baik || stats.kondisi_baik || 0;
    const rrCount = kondisi.rusak_ringan || 0;
    const rbCount = kondisi.rusak_berat || stats.kondisi_rusak_berat || 0;

    const baikPct = totalAset > 0 ? Math.round((baikCount / totalAset) * 100) : 0;
    const rrPct = totalAset > 0 ? Math.round((rrCount / totalAset) * 100) : 0;
    const rbPct = totalAset > 0 ? Math.round((rbCount / totalAset) * 100) : 0;

    return (
        <AuthenticatedLayout title="Dashboard BMD">
            <Head title="Dashboard Eksekutif - SIMUKTI" />

            {/* Hero Welcome Banner */}
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
                            {variant === 'camat'
                                ? 'Ringkasan eksekutif kepemilikan dan valuasi Barang Milik Daerah (BMD) Kecamatan Mekarmukti.'
                                : variant === 'penatausaha'
                                ? 'Pusat kendali verifikasi mutasi, hasil opname, dan pengawasan aset kecamatan.'
                                : variant === 'pemegang'
                                ? 'Daftar inventaris aset di bawah tanggung jawab pemakaian pegawai.'
                                : 'Komando operasional penatausahaan, pelabelan QR, sensus dan pemeliharaan BMD.'}
                        </p>
                    </div>

                    {/* Quick Shortcuts per role */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        {variant === 'camat' ? (
                            <>
                                <Link
                                    href="/penghapusan"
                                    className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all"
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>Persetujuan Penghapusan</span>
                                </Link>
                                <Link
                                    href="/laporan"
                                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-4 py-2.5 rounded-xl backdrop-blur transition-all border border-white/15"
                                >
                                    <FileSpreadsheet className="w-4 h-4" />
                                    <span>Laporan KIB/KIR</span>
                                </Link>
                            </>
                        ) : variant === 'penatausaha' ? (
                            <>
                                <Link
                                    href="/penghapusan"
                                    className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Verifikasi Usulan</span>
                                </Link>
                                <Link
                                    href="/inventarisasi"
                                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-4 py-2.5 rounded-xl backdrop-blur transition-all border border-white/15"
                                >
                                    <ClipboardCheck className="w-4 h-4" />
                                    <span>Hasil Sensus</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/aset/create"
                                    className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Tambah Aset</span>
                                </Link>
                                <Link
                                    href="/mutasi/create"
                                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-4 py-2.5 rounded-xl backdrop-blur transition-all border border-white/15"
                                >
                                    <ArrowLeftRight className="w-4 h-4" />
                                    <span>Mutasi / BAST</span>
                                </Link>
                                <Link
                                    href="/laporan"
                                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-4 py-2.5 rounded-xl backdrop-blur transition-all border border-white/15"
                                >
                                    <FileSpreadsheet className="w-4 h-4" />
                                    <span>Laporan</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Core KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Total Aset</p>
                        <p className="text-2xl font-bold text-neutral-900 mt-1">{totalAset}</p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">Unit terdaftar di sistem</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Box className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Valuasi Nilai</p>
                        <p className="text-xl font-bold text-neutral-900 mt-1 truncate max-w-[160px]">
                            {formatRupiah(stats.total_nilai || 0)}
                        </p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">Nilai perolehan buku</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Layers className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Kondisi Baik</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-1">{baikCount}</p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">{baikPct}% siap operasional</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Rusak Berat</p>
                        <p className="text-2xl font-bold text-rose-600 mt-1">{rbCount}</p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">{rbPct}% perlu penghapusan</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Condition Health Progress Bar */}
            <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-xs mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                        Distribusi Kesehatan Fisik Barang Milik Daerah
                    </span>
                    <span className="text-xs text-neutral-500 font-medium">
                        Total {totalAset} Unit
                    </span>
                </div>

                <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden flex">
                    <div style={{ width: `${baikPct}%` }} className="bg-emerald-500 h-full transition-all" title={`Baik: ${baikCount} (${baikPct}%)`} />
                    <div style={{ width: `${rrPct}%` }} className="bg-amber-400 h-full transition-all" title={`Rusak Ringan: ${rrCount} (${rrPct}%)`} />
                    <div style={{ width: `${rbPct}%` }} className="bg-rose-500 h-full transition-all" title={`Rusak Berat: ${rbCount} (${rbPct}%)`} />
                </div>

                <div className="flex items-center gap-6 mt-3 text-xs text-neutral-600">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span>Baik: <strong>{baikCount}</strong> ({baikPct}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <span>Rusak Ringan: <strong>{rrCount}</strong> ({rrPct}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        <span>Rusak Berat: <strong>{rbCount}</strong> ({rbPct}%)</span>
                    </div>
                </div>
            </div>

            {/* Variant Specific Content */}
            {variant === 'camat' ? (
                /* === CAMAT EXECUTIVE VIEW === */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Komposisi Nilai per Golongan KIB A-F */}
                    <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-neutral-200 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                                <Layers className="w-4 h-4 text-emerald-600" />
                                <span>Komposisi Valuasi per Golongan (KIB A – F)</span>
                            </h3>
                            <Link href="/laporan" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                                <span>Lihat KIB</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {(dashboardData.komposisiGolongan || []).map((g) => {
                                const totalVal = stats.total_nilai || 1;
                                const pct = Math.round((g.nilai / totalVal) * 100);
                                return (
                                    <div key={g.golongan} className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="font-semibold text-neutral-800">{g.label} ({g.unit} unit)</span>
                                            <span className="font-bold text-neutral-900">{formatRupiah(g.nilai)}</span>
                                        </div>
                                        <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                                            <div style={{ width: `${pct}%` }} className="bg-emerald-600 h-full rounded-full" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Pending Camat Approvals & Top Rooms */}
                    <div className="space-y-6">
                        {/* Pending Approvals */}
                        <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-xs">
                            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-amber-500" />
                                <span>Antrean Persetujuan Camat</span>
                            </h3>
                            {(dashboardData.pendingApproval || []).length > 0 ? (
                                <div className="space-y-2.5">
                                    {(dashboardData.pendingApproval || []).map((u) => (
                                        <Link
                                            key={u.id}
                                            href={`/penghapusan/${u.id}`}
                                            className="block p-3 rounded-lg bg-amber-50/70 border border-amber-200 hover:bg-amber-100/60 transition-colors"
                                        >
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-mono font-bold text-amber-950">{u.nomor}</span>
                                                <span className="text-amber-700 font-semibold">{u.items?.length || 0} unit</span>
                                            </div>
                                            <p className="text-[11px] text-neutral-600 mt-1 line-clamp-1">{u.alasan_umum}</p>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-neutral-400 py-3 text-center">Tidak ada usulan penghapusan yang menunggu persetujuan.</p>
                            )}
                        </div>

                        {/* Top Rooms */}
                        <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-xs">
                            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-blue-500" />
                                <span>Ruangan dengan Aset Terbesar</span>
                            </h3>
                            <div className="space-y-2.5">
                                {(dashboardData.ruanganTop || []).map((r) => (
                                    <div key={r.id} className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-50 last:border-0">
                                        <div>
                                            <p className="font-semibold text-neutral-800">{r.nama}</p>
                                            <span className="text-[11px] text-neutral-400">{r.total_unit} unit barang</span>
                                        </div>
                                        <span className="font-bold text-neutral-900">{formatRupiah(r.total_nilai)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : variant === 'penatausaha' ? (
                /* === PENATAUSAHA / SEKCAM VIEW === */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Antrean Verifikasi Sekcam */}
                    <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-neutral-200 shadow-xs">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
                            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span>Antrean Verifikasi Usulan Penghapusan (Sekcam)</span>
                            </h3>
                            <Link href="/penghapusan" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                                <span>Lihat Semua</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {(dashboardData.pendingVerifikasi || []).length > 0 ? (
                            <div className="space-y-3">
                                {(dashboardData.pendingVerifikasi || []).map((u) => (
                                    <div key={u.id} className="p-4 rounded-xl border border-neutral-200 hover:border-emerald-500 transition-colors flex items-center justify-between">
                                        <div>
                                            <span className="text-xs font-mono font-bold text-emerald-800">{u.nomor}</span>
                                            <p className="text-xs font-semibold text-neutral-900 mt-0.5">{u.alasan_umum}</p>
                                            <span className="text-[11px] text-neutral-400">Total {u.items?.length || 0} unit aset rusak berat</span>
                                        </div>
                                        <Link
                                            href={`/penghapusan/${u.id}`}
                                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                                        >
                                            Periksa Fisik
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-neutral-400 py-6 text-center">Seluruh berkas usulan penghapusan telah selesai diverifikasi.</p>
                        )}
                    </div>

                    {/* Sensus Status & Recent Mutasi */}
                    <div className="space-y-6">
                        {/* Opname Aktif */}
                        <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-xs">
                            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <ClipboardCheck className="w-4 h-4 text-blue-500" />
                                <span>Status Sensus / Opname Fisik</span>
                            </h3>
                            {dashboardData.opnameAktif ? (
                                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200">
                                    <p className="text-xs font-bold text-blue-950">{dashboardData.opnameAktif.nama}</p>
                                    <div className="mt-2 text-xs text-neutral-600 flex justify-between">
                                        <span>Progres Pemeriksaan</span>
                                        <span className="font-bold">{dashboardData.opnameAktif.dicek_count} / {dashboardData.opnameAktif.total_items} unit</span>
                                    </div>
                                    <Link
                                        href={`/inventarisasi/${dashboardData.opnameAktif.id}`}
                                        className="mt-3 block text-center py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                                    >
                                        Buka Monitoring Sensus
                                    </Link>
                                </div>
                            ) : (
                                <p className="text-xs text-neutral-400 py-3 text-center">Tidak ada sesi sensus fisik yang sedang berjalan.</p>
                            )}
                        </div>

                        {/* Recent Mutasi */}
                        <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-xs">
                            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <ArrowLeftRight className="w-4 h-4 text-teal-600" />
                                <span>Mutasi Internal Terkini</span>
                            </h3>
                            <div className="space-y-2.5">
                                {(dashboardData.recentMutasi || []).map((m) => (
                                    <div key={m.id} className="text-xs py-1.5 border-b border-neutral-50 last:border-0">
                                        <span className="font-mono text-[11px] text-neutral-500">{m.nomor_bast}</span>
                                        <p className="font-semibold text-neutral-900">{m.aset?.nama_barang}</p>
                                        <span className="text-[11px] text-emerald-700">Pindah ke: {m.ke_ruangan?.nama_ruangan}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : variant === 'pemegang' ? (
                /* === PEMEGANG / STAF VIEW === */
                <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-xs">
                    <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Box className="w-4 h-4 text-emerald-600" />
                        <span>Barang Milik Daerah di Bawah Penugasan Anda</span>
                    </h3>
                    {(dashboardData.asetDipegang || []).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(dashboardData.asetDipegang || []).map((a) => (
                                <div key={a.id} className="p-4 rounded-xl border border-neutral-200 hover:border-emerald-500 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-mono text-neutral-500">{a.kode_barang}</span>
                                        <KondisiBadge kondisi={a.kondisi} />
                                    </div>
                                    <h4 className="font-bold text-neutral-900 text-sm mt-1">{a.nama_barang}</h4>
                                    <p className="text-xs text-neutral-500 mt-0.5">Ruangan: {a.ruangan?.nama_ruangan || '-'}</p>
                                    <div className="mt-3 pt-3 border-t border-neutral-100 flex justify-between items-center text-xs">
                                        <span className="text-neutral-400">Reg: {a.nomor_register}</span>
                                        <Link href={`/aset/${a.id}`} className="text-emerald-600 font-semibold hover:underline">
                                            Rincian Aset →
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-neutral-400">
                            <Box className="w-10 h-10 mx-auto text-neutral-300 mb-2" />
                            <p className="text-xs">Tidak ada aset pribadi yang tercatat atas nama Anda.</p>
                        </div>
                    )}
                </div>
            ) : (
                /* === PENGURUS BARANG & SUPER ADMIN COMMAND VIEW === */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Assets Feed */}
                    <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-neutral-200 shadow-xs">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
                            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                                <Box className="w-4 h-4 text-emerald-600" />
                                <span>Aset Terbaru Ditambahkan</span>
                            </h3>
                            <Link href="/aset" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                                <span>Daftar Aset</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="divide-y divide-neutral-100">
                            {(dashboardData.recentAset || []).map((a) => (
                                <div key={a.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <GolonganBadge golongan={a.golongan} />
                                        <div>
                                            <p className="text-xs font-semibold text-neutral-900">{a.nama_barang}</p>
                                            <span className="text-[11px] font-mono text-neutral-400">
                                                {a.kode_barang} • Reg {a.nomor_register}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-neutral-900">{formatRupiah(a.nilai_perolehan)}</p>
                                        <KondisiBadge kondisi={a.kondisi} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Operational Widgets */}
                    <div className="space-y-6">
                        {/* Opname Widget */}
                        {dashboardData.opnameAktif && (
                            <div className="bg-emerald-900 text-white rounded-xl p-5 shadow-sm">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Sensus Lapangan Aktif</span>
                                <h4 className="text-sm font-bold mt-1">{dashboardData.opnameAktif.nama}</h4>
                                <p className="text-xs text-emerald-200 mt-1">
                                    {dashboardData.opnameAktif.dicek_count} dari {dashboardData.opnameAktif.total_items} unit terverifikasi
                                </p>
                                <Link
                                    href={`/inventarisasi/${dashboardData.opnameAktif.id}/sensus-lapangan`}
                                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-colors"
                                >
                                    <span>Buka Scanner Kamera HP</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        )}

                        {/* Recent Maintenance */}
                        <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-xs">
                            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Wrench className="w-4 h-4 text-teal-600" />
                                <span>Pemeliharaan & Servis Terkini</span>
                            </h3>
                            <div className="space-y-2.5">
                                {(dashboardData.recentPemeliharaan || []).map((p) => (
                                    <div key={p.id} className="text-xs py-1.5 border-b border-neutral-50 last:border-0">
                                        <p className="font-semibold text-neutral-900">{p.aset?.nama_barang}</p>
                                        <div className="flex justify-between items-center text-[11px] text-neutral-500 mt-0.5">
                                            <span>{p.pelaksana || 'Bengkel/Teknisi'}</span>
                                            <span className="font-bold text-emerald-700">{formatRupiah(p.biaya || 0)}</span>
                                        </div>
                                    </div>
                                ))}
                                {(dashboardData.recentPemeliharaan || []).length === 0 && (
                                    <p className="text-xs text-neutral-400 py-3 text-center">Belum ada servis tercatat.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
