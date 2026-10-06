import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import EmptyState from '@/Components/EmptyState';
import StatCard from '@/Components/StatCard';
import Modal from '@/Components/Modal';
import KondisiBadge from '@/Components/KondisiBadge';
import { 
    Wrench, 
    Plus, 
    Search, 
    Coins, 
    Calendar, 
    Building2, 
    Filter, 
    Clock, 
    CheckCircle2, 
    AlertCircle,
    X
} from 'lucide-react';
import { formatRupiah } from '@/Utils/formatRupiah';
import { formatDate } from '@/Utils/formatDate';
import { toast } from 'sonner';

export default function PemeliharaanIndex({ pemeliharaans, totalBiayaTahunIni, totalBiayaSemua, asets, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [jenis, setJenis] = useState(filters.jenis || '');
    const [tahun, setTahun] = useState(filters.tahun || '');
    const [showModal, setShowModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        aset_id: '',
        tanggal: new Date().toISOString().split('T')[0],
        jenis: 'rutin',
        uraian: '',
        biaya: '',
        pelaksana: '',
        kondisi_sesudah: 'baik',
    });

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('pemeliharaan.index'), {
            search: search || undefined,
            jenis: jenis || undefined,
            tahun: tahun || undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setSearch('');
        setJenis('');
        setTahun('');
        router.get(route('pemeliharaan.index'));
    };

    const handleOpenModal = (preselectedAsetId = null) => {
        reset();
        if (preselectedAsetId) {
            setData('aset_id', preselectedAsetId);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('pemeliharaan.store'), {
            onSuccess: () => {
                toast.success('Catatan servis pemeliharaan berhasil disimpan.');
                handleCloseModal();
            },
            onError: (err) => {
                const msg = Object.values(err)[0] || 'Gagal menyimpan data pemeliharaan.';
                toast.error(msg);
            },
        });
    };

    const jenisLabel = (val) => {
        const map = {
            rutin: 'Servis Rutin',
            perbaikan: 'Perbaikan Kerusakan',
            penggantian_suku_cadang: 'Penggantian Suku Cadang',
        };
        return map[val] || val;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pemeliharaan & Biaya Servis - SIMUKTI" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                            <Wrench className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-neutral-900">Pemeliharaan & Monitoring Servis</h1>
                            <p className="text-sm text-neutral-500">
                                Pencatatan perawatan berkala, perbaikan fisik, biaya operasional, dan pemulihan kondisi aset.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Catat Servis Baru</span>
                    </button>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        title={`Realisasi Servis (${new Date().getFullYear()})`}
                        value={formatRupiah(totalBiayaTahunIni)}
                        icon={Coins}
                        description="Total pengeluaran perawatan tahun berjalan"
                        variant="default"
                    />
                    <StatCard
                        title="Akumulasi Biaya Keseluruhan"
                        value={formatRupiah(totalBiayaSemua)}
                        icon={Coins}
                        description="Total historis pemeliharaan seluruh aset"
                        variant="default"
                    />
                    <StatCard
                        title="Total Transaksi Servis"
                        value={pemeliharaans.total || 0}
                        icon={Wrench}
                        description="Kali pemeliharaan tercatat di sistem"
                        variant="default"
                    />
                </div>

                {/* Filter */}
                <form onSubmit={handleFilter} className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-6 relative">
                            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Cari uraian servis, pelaksana / bengkel, nama aset..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-colors"
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <select
                                value={jenis}
                                onChange={(e) => setJenis(e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-colors"
                            >
                                <option value="">Semua Jenis Servis</option>
                                <option value="rutin">Servis Rutin</option>
                                <option value="perbaikan">Perbaikan Kerusakan</option>
                                <option value="penggantian_suku_cadang">Penggantian Suku Cadang</option>
                            </select>
                        </div>

                        <div className="sm:col-span-3 flex items-center gap-2">
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-neutral-800 hover:bg-neutral-900 text-white rounded-xl text-sm font-medium transition-colors"
                            >
                                Filter
                            </button>
                            {(search || jenis || tahun) && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 bg-neutral-100 rounded-xl transition-colors"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>
                </form>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                    {pemeliharaans.data && pemeliharaans.data.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-neutral-50 border-b border-neutral-100 text-xs text-neutral-500 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-5 py-3.5">Tanggal & Aset</th>
                                            <th className="px-5 py-3.5">Jenis & Uraian Pekerjaan</th>
                                            <th className="px-5 py-3.5">Pelaksana / Vendor</th>
                                            <th className="px-5 py-3.5">Biaya</th>
                                            <th className="px-5 py-3.5">Kondisi Hasil</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                        {pemeliharaans.data.map((p) => (
                                            <tr key={p.id} className="hover:bg-neutral-50/70 transition-colors">
                                                <td className="px-5 py-4">
                                                    <div className="text-xs text-neutral-500 flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        <span>{formatDate(p.tanggal)}</span>
                                                    </div>
                                                    <div className="font-semibold text-neutral-900 mt-1">
                                                        {p.aset ? (
                                                            <Link href={route('aset.show', p.aset.id)} className="text-emerald-700 hover:underline">
                                                                {p.aset.nama}
                                                            </Link>
                                                        ) : (
                                                            <span className="text-neutral-400 italic">Aset dihapus</span>
                                                        )}
                                                    </div>
                                                    {p.aset && (
                                                        <div className="text-xs text-neutral-400">
                                                            {p.aset.kode_barang} • Reg: {p.aset.nomor_register}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/50 mb-1">
                                                        {jenisLabel(p.jenis)}
                                                    </span>
                                                    <p className="text-sm text-neutral-700 font-medium line-clamp-2">
                                                        {p.uraian}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-neutral-600">
                                                    {p.pelaksana || '-'}
                                                </td>
                                                <td className="px-5 py-4 font-semibold text-neutral-900">
                                                    {p.biaya ? formatRupiah(p.biaya) : <span className="text-neutral-400 font-normal">Tanpa Biaya</span>}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-1.5 text-xs">
                                                        <span className="text-neutral-400">{p.kondisi_sebelum?.label || p.kondisi_sebelum}</span>
                                                        <span className="text-neutral-400">→</span>
                                                        <KondisiBadge kondisi={p.kondisi_sesudah?.value || p.kondisi_sesudah} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pemeliharaans.links && pemeliharaans.links.length > 3 && (
                                <div className="px-5 py-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                                    <div>
                                        Menampilkan {pemeliharaans.from || 0} - {pemeliharaans.to || 0} dari {pemeliharaans.total} riwayat
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {pemeliharaans.links.map((link, idx) => (
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
                            icon={Wrench}
                            title="Belum Ada Catatan Servis"
                            description="Belum ada riwayat servis atau perbaikan aset yang tersimpan."
                            actionLabel="Catat Servis Baru"
                            onAction={() => handleOpenModal()}
                        />
                    )}
                </div>
            </div>

            {/* Modal Catat Pemeliharaan */}
            <Modal show={showModal} onClose={handleCloseModal} maxWidth="lg">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                        <div className="flex items-center gap-2">
                            <Wrench className="w-5 h-5 text-emerald-600" />
                            <h2 className="text-base font-bold text-neutral-900">Catat Pemeliharaan & Servis Aset</h2>
                        </div>
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Pilih Aset */}
                    <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">
                            Aset yang Diservis <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={data.aset_id}
                            onChange={(e) => setData('aset_id', e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                            required
                        >
                            <option value="">-- Pilih Aset --</option>
                            {asets.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.nama} ({a.kode_barang} - Reg: {a.nomor_register})
                                </option>
                            ))}
                        </select>
                        {errors.aset_id && <p className="text-red-500 text-xs mt-1">{errors.aset_id}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-neutral-700 mb-1">
                                Tanggal Servis <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={data.tanggal}
                                onChange={(e) => setData('tanggal', e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                                required
                            />
                            {errors.tanggal && <p className="text-red-500 text-xs mt-1">{errors.tanggal}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-neutral-700 mb-1">
                                Jenis Pemeliharaan <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.jenis}
                                onChange={(e) => setData('jenis', e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="rutin">Servis Rutin</option>
                                <option value="perbaikan">Perbaikan Kerusakan</option>
                                <option value="penggantian_suku_cadang">Penggantian Suku Cadang</option>
                            </select>
                            {errors.jenis && <p className="text-red-500 text-xs mt-1">{errors.jenis}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-neutral-700 mb-1">
                                Biaya (Rp)
                            </label>
                            <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={data.biaya}
                                onChange={(e) => setData('biaya', e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                            />
                            {errors.biaya && <p className="text-red-500 text-xs mt-1">{errors.biaya}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-neutral-700 mb-1">
                                Pelaksana / Bengkel / Vendor
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: Bengkel Putra Garut..."
                                value={data.pelaksana}
                                onChange={(e) => setData('pelaksana', e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                            />
                            {errors.pelaksana && <p className="text-red-500 text-xs mt-1">{errors.pelaksana}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">
                            Kondisi Fisik Setelah Servis <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={data.kondisi_sesudah}
                            onChange={(e) => setData('kondisi_sesudah', e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="baik">Baik (Layak Operasional)</option>
                            <option value="rusak_ringan">Rusak Ringan (Masih Bisa Digunakan)</option>
                            <option value="rusak_berat">Rusak Berat (Tidak Berfungsi)</option>
                        </select>
                        {errors.kondisi_sesudah && <p className="text-red-500 text-xs mt-1">{errors.kondisi_sesudah}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">
                            Uraian Pekerjaan & Penggantian <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Jelaskan detail perbaikan, misal: Penggantian oli mesin, filter, dan servis rem..."
                            value={data.uraian}
                            onChange={(e) => setData('uraian', e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                            required
                        />
                        {errors.uraian && <p className="text-red-500 text-xs mt-1">{errors.uraian}</p>}
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100 rounded-xl"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Pemeliharaan'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
