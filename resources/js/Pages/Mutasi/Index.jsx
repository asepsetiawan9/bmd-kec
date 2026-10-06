import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import EmptyState from '@/Components/EmptyState';
import { 
    ArrowLeftRight, 
    Plus, 
    Search, 
    Printer, 
    Eye, 
    FileText, 
    Building2, 
    User as UserIcon,
    Calendar,
    Filter
} from 'lucide-react';
import { formatDate } from '@/Utils/formatDate';

export default function MutasiIndex({ mutasis, ruangans, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [jenis, setJenis] = useState(filters.jenis || '');
    const [ruanganId, setRuanganId] = useState(filters.ruangan_id || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('mutasi.index'), {
            search: search || undefined,
            jenis: jenis || undefined,
            ruangan_id: ruanganId || undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setSearch('');
        setJenis('');
        setRuanganId('');
        router.get(route('mutasi.index'));
    };

    const jenisLabel = (val) => {
        const map = {
            penempatan_awal: 'Penempatan Awal',
            pindah_ruangan: 'Pindah Ruangan',
            ganti_pemegang: 'Ganti Pemegang',
            pengembalian: 'Pengembalian',
        };
        return map[val] || val;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Mutasi & BAST - SIMUKTI" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                <ArrowLeftRight className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-neutral-900">Mutasi & BAST Barang Milik Daerah</h1>
                                <p className="text-sm text-neutral-500">
                                    Riwayat perpindahan fisik aset, serah terima penanggung jawab, dan otomatisasi Berita Acara.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('mutasi.create')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Proses Mutasi Baru</span>
                        </Link>
                    </div>
                </div>

                {/* Filter Bar */}
                <form onSubmit={handleFilter} className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-5 relative">
                            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Cari No BAST, nama aset, atau kode barang..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <select
                                value={jenis}
                                onChange={(e) => setJenis(e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-colors"
                            >
                                <option value="">Semua Jenis Mutasi</option>
                                <option value="pindah_ruangan">Pindah Ruangan</option>
                                <option value="ganti_pemegang">Ganti Pemegang</option>
                                <option value="penempatan_awal">Penempatan Awal</option>
                                <option value="pengembalian">Pengembalian</option>
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <select
                                value={ruanganId}
                                onChange={(e) => setRuanganId(e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-colors"
                            >
                                <option value="">Semua Ruangan</option>
                                {ruangans.map((r) => (
                                    <option key={r.id} value={r.id}>{r.nama}</option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-2 flex items-center gap-2">
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-neutral-800 hover:bg-neutral-900 text-white rounded-xl text-sm font-medium transition-colors"
                            >
                                Filter
                            </button>
                            {(search || jenis || ruanganId) && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>
                </form>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                    {mutasis.data && mutasis.data.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-neutral-50 border-b border-neutral-100 text-xs text-neutral-500 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-5 py-3.5">Nomor BAST & Tanggal</th>
                                            <th className="px-5 py-3.5">Aset yang Dimutasi</th>
                                            <th className="px-5 py-3.5">Asal & Tujuan</th>
                                            <th className="px-5 py-3.5">Jenis</th>
                                            <th className="px-5 py-3.5 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                        {mutasis.data.map((m) => (
                                            <tr key={m.id} className="hover:bg-neutral-50/70 transition-colors">
                                                <td className="px-5 py-4">
                                                    <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                                                        <FileText className="w-4 h-4 text-emerald-600" />
                                                        <span>{m.nomor_bast}</span>
                                                    </div>
                                                    <div className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        <span>{formatDate(m.tanggal)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    {m.aset ? (
                                                        <div>
                                                            <Link 
                                                                href={route('aset.show', m.aset.id)}
                                                                className="font-medium text-emerald-700 hover:underline"
                                                            >
                                                                {m.aset.nama}
                                                            </Link>
                                                            <div className="text-xs text-neutral-500 mt-0.5">
                                                                {m.aset.kode_barang} • Reg: {m.aset.nomor_register}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-neutral-400 italic">Aset dihapus</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="text-xs space-y-1">
                                                        <div className="flex items-center gap-1 text-neutral-500">
                                                            <span className="w-12 text-neutral-400">Dari:</span>
                                                            <span className="font-medium text-neutral-700">{m.dari_ruangan?.nama || '-'}</span>
                                                            {m.dari_pegawai && <span>({m.dari_pegawai.nama})</span>}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-emerald-700">
                                                            <span className="w-12 text-neutral-400">Ke:</span>
                                                            <span className="font-semibold">{m.ke_ruangan?.nama || '-'}</span>
                                                            {m.ke_pegawai && <span className="font-medium">({m.ke_pegawai.nama})</span>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                                                        {jenisLabel(m.jenis)}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={route('mutasi.show', { nomor_bast: m.nomor_bast })}
                                                            className="p-2 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
                                                            title="Lihat Detail BAST"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <a
                                                            href={route('mutasi.print-bast', { nomor_bast: m.nomor_bast })}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors border border-emerald-200/50"
                                                            title="Cetak Berita Acara PDF"
                                                        >
                                                            <Printer className="w-3.5 h-3.5" />
                                                            <span>BAST</span>
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {mutasis.links && mutasis.links.length > 3 && (
                                <div className="px-5 py-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                                    <div>
                                        Menampilkan {mutasis.from || 0} - {mutasis.to || 0} dari {mutasis.total} transaksi
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {mutasis.links.map((link, idx) => (
                                            <Link
                                                key={idx}
                                                href={link.url || '#'}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                                                    link.active
                                                        ? 'bg-emerald-600 text-white'
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
                            icon={ArrowLeftRight}
                            title="Belum Ada Riwayat Mutasi"
                            description="Belum ada transaksi mutasi atau pemindahan ruangan aset yang tercatat di sistem."
                            actionLabel="Proses Mutasi Baru"
                            actionHref={route('mutasi.create')}
                        />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
