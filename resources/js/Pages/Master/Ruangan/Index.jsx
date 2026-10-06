import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import ConfirmModal from '@/Components/ConfirmModal';
import {
    DoorClosed,
    Plus,
    Search,
    Edit2,
    Trash2,
    Users,
    Box,
    Building,
    CheckCircle2,
    XCircle,
    Info,
} from 'lucide-react';

export default function Index({ ruangan, pegawaiList = [], filters = {} }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRuangan, setEditingRuangan] = useState(null);
    const [deletingRuangan, setDeletingRuangan] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        kode: '',
        nama: '',
        gedung: '',
        lantai: '',
        penanggung_jawab_id: '',
        keterangan: '',
        is_active: true,
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/master/ruangan', { search: searchTerm }, { preserveState: true, replace: true });
    };

    const openCreateModal = () => {
        setEditingRuangan(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (r) => {
        setEditingRuangan(r);
        setData({
            kode: r.kode || '',
            nama: r.nama || '',
            gedung: r.gedung || '',
            lantai: r.lantai || '',
            penanggung_jawab_id: r.penanggung_jawab_id || '',
            keterangan: r.keterangan || '',
            is_active: Boolean(r.is_active),
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingRuangan) {
            put(`/master/ruangan/${editingRuangan.id}`, {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            post('/master/ruangan', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const confirmDelete = () => {
        if (!deletingRuangan) return;
        router.delete(`/master/ruangan/${deletingRuangan.id}`, {
            onSuccess: () => setDeletingRuangan(null),
        });
    };

    return (
        <AuthenticatedLayout title="Master Data Ruangan">
            <Head title="Master Ruangan - SIMUKTI BMD" />

            <div className="space-y-6">
                {/* Header & Action Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <DoorClosed className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-neutral-900 leading-tight">
                                Master Ruangan
                            </h2>
                            <p className="text-xs text-neutral-500">
                                Kelola daftar lokasi ruangan penempatan aset BMD Kecamatan Mekarmukti
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Ruangan Baru
                    </button>
                </div>

                {/* Filter and Table Card */}
                <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
                    <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row gap-3 justify-between items-center">
                        <form onSubmit={handleSearch} className="relative w-full sm:w-80">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Cari nama ruangan, kode, gedung..."
                                className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            />
                        </form>

                        <div className="text-xs text-neutral-500">
                            Total Ruangan: <span className="font-bold text-neutral-900">{ruangan.total}</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 font-semibold uppercase tracking-wider text-[11px]">
                                    <th className="px-5 py-3.5">Kode & Nama Ruangan</th>
                                    <th className="px-5 py-3.5">Gedung / Lantai</th>
                                    <th className="px-5 py-3.5">Penanggung Jawab</th>
                                    <th className="px-5 py-3.5 text-center">Aset Tertampung</th>
                                    <th className="px-5 py-3.5 text-center">Status</th>
                                    <th className="px-5 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {ruangan.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center text-neutral-400">
                                            Tidak ada data ruangan ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    ruangan.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200">
                                                        {item.kode}
                                                    </span>
                                                    <div>
                                                        <p className="font-bold text-neutral-900">{item.nama}</p>
                                                        {item.keterangan && (
                                                            <p className="text-[11px] text-neutral-400 truncate max-w-xs">{item.keterangan}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-neutral-600">
                                                <div className="flex items-center gap-1.5">
                                                    <Building className="w-3.5 h-3.5 text-neutral-400" />
                                                    <span>{item.gedung || 'Gedung Utama'}</span>
                                                    {item.lantai && <span className="text-neutral-400">&bull; Lt. {item.lantai}</span>}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-neutral-700">
                                                {item.penanggung_jawab ? (
                                                    <div className="space-y-0.5">
                                                        <p className="font-semibold text-neutral-900">{item.penanggung_jawab.nama}</p>
                                                        <p className="text-[11px] text-neutral-400">{item.penanggung_jawab.jabatan}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-neutral-400 italic">Belum ditentukan</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
                                                    <Box className="w-3 h-3" />
                                                    {item.aset_count || 0} unit
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                {item.is_active ? (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-400">
                                                        <XCircle className="w-3.5 h-3.5" /> Non-Aktif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(item)}
                                                        className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-600 hover:text-emerald-700 transition-colors"
                                                        title="Edit Ruangan"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeletingRuangan(item)}
                                                        className="p-1.5 hover:bg-rose-50 rounded-lg text-neutral-400 hover:text-rose-600 transition-colors"
                                                        title="Hapus Ruangan"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {ruangan.links && ruangan.links.length > 3 && (
                        <div className="p-4 border-t border-neutral-100 flex items-center justify-between">
                            <span className="text-xs text-neutral-500">
                                Menampilkan {ruangan.from || 0} - {ruangan.to || 0} dari {ruangan.total} data
                            </span>
                            <div className="flex gap-1">
                                {ruangan.links.map((link, idx) => (
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

            {/* Modal Tambah / Edit Ruangan */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="md">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                        <div className="flex items-center gap-2">
                            <DoorClosed className="w-5 h-5 text-emerald-600" />
                            <h3 className="text-base font-bold text-neutral-900">
                                {editingRuangan ? 'Edit Ruangan' : 'Tambah Ruangan Baru'}
                            </h3>
                        </div>
                    </div>

                    <div className="space-y-3.5 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="font-semibold text-neutral-700 block mb-1">
                                    Kode Ruangan <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.kode}
                                    onChange={(e) => setData('kode', e.target.value)}
                                    placeholder="cth: R-01"
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 font-mono"
                                />
                                {errors.kode && <p className="text-rose-500 mt-1 text-[11px]">{errors.kode}</p>}
                            </div>

                            <div>
                                <label className="font-semibold text-neutral-700 block mb-1">
                                    Lantai
                                </label>
                                <input
                                    type="text"
                                    value={data.lantai}
                                    onChange={(e) => setData('lantai', e.target.value)}
                                    placeholder="cth: 1 atau 2"
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="font-semibold text-neutral-700 block mb-1">
                                Nama Ruangan <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.nama}
                                onChange={(e) => setData('nama', e.target.value)}
                                placeholder="cth: Ruang Rapat Kantor Kecamatan"
                                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                            />
                            {errors.nama && <p className="text-rose-500 mt-1 text-[11px]">{errors.nama}</p>}
                        </div>

                        <div>
                            <label className="font-semibold text-neutral-700 block mb-1">
                                Gedung
                            </label>
                            <input
                                type="text"
                                value={data.gedung}
                                onChange={(e) => setData('gedung', e.target.value)}
                                placeholder="cth: Gedung Kantor Utama"
                                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>

                        <div>
                            <label className="font-semibold text-neutral-700 block mb-1">
                                Penanggung Jawab Ruangan
                            </label>
                            <select
                                value={data.penanggung_jawab_id}
                                onChange={(e) => setData('penanggung_jawab_id', e.target.value)}
                                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                            >
                                <option value="">-- Pilih Pegawai Penanggung Jawab --</option>
                                {pegawaiList.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.nama} ({p.jabatan})
                                    </option>
                                ))}
                            </select>
                            {errors.penanggung_jawab_id && <p className="text-rose-500 mt-1 text-[11px]">{errors.penanggung_jawab_id}</p>}
                        </div>

                        <div>
                            <label className="font-semibold text-neutral-700 block mb-1">
                                Keterangan
                            </label>
                            <textarea
                                value={data.keterangan}
                                onChange={(e) => setData('keterangan', e.target.value)}
                                placeholder="Catatan tambahan lokasi ruangan..."
                                rows={2}
                                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <label htmlFor="is_active" className="font-semibold text-neutral-700 cursor-pointer">
                                Ruangan Aktif Digunakan
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 rounded-xl text-xs font-semibold transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : editingRuangan ? 'Perbarui Ruangan' : 'Simpan Ruangan'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Hapus Ruangan */}
            {deletingRuangan && (
                <ConfirmModal
                    isOpen={Boolean(deletingRuangan)}
                    onClose={() => setDeletingRuangan(null)}
                    onConfirm={confirmDelete}
                    title="Hapus Master Ruangan"
                    message={`Apakah Anda yakin ingin menghapus data ruangan '${deletingRuangan.nama}' (${deletingRuangan.kode})? Tindakan ini tidak dapat dibatalkan.`}
                    confirmText="Hapus Ruangan"
                    variant="danger"
                />
            )}
        </AuthenticatedLayout>
    );
}
