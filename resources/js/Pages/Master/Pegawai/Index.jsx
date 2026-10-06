import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import ConfirmModal from '@/Components/ConfirmModal';
import {
    Users,
    Plus,
    Search,
    Edit2,
    Trash2,
    Box,
    Phone,
    UserCheck,
    CheckCircle2,
    XCircle,
    Shield,
} from 'lucide-react';

export default function Index({ pegawai, unlinkedUsers = [], filters = {} }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPegawai, setEditingPegawai] = useState(null);
    const [deletingPegawai, setDeletingPegawai] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nip: '',
        nama: '',
        jabatan: '',
        unit_kerja: '',
        no_hp: '',
        user_id: '',
        is_active: true,
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/master/pegawai', { search: searchTerm }, { preserveState: true, replace: true });
    };

    const openCreateModal = () => {
        setEditingPegawai(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (p) => {
        setEditingPegawai(p);
        setData({
            nip: p.nip || '',
            nama: p.nama || '',
            jabatan: p.jabatan || '',
            unit_kerja: p.unit_kerja || '',
            no_hp: p.no_hp || '',
            user_id: p.user_id || '',
            is_active: Boolean(p.is_active),
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingPegawai) {
            put(`/master/pegawai/${editingPegawai.id}`, {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            post('/master/pegawai', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const confirmDelete = () => {
        if (!deletingPegawai) return;
        router.delete(`/master/pegawai/${deletingPegawai.id}`, {
            onSuccess: () => setDeletingPegawai(null),
        });
    };

    return (
        <AuthenticatedLayout title="Master Data Pegawai">
            <Head title="Master Pegawai - SIMUKTI BMD" />

            <div className="space-y-6">
                {/* Header & Action Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-neutral-900 leading-tight">
                                Master Pegawai & Pemegang Aset
                            </h2>
                            <p className="text-xs text-neutral-500">
                                Daftar pejabat dan staf penanggung jawab pemeliharaan & penggunaan aset BMD
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Pegawai Baru
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
                                placeholder="Cari nama pegawai, NIP, jabatan..."
                                className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </form>

                        <div className="text-xs text-neutral-500">
                            Total Pegawai: <span className="font-bold text-neutral-900">{pegawai.total}</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 font-semibold uppercase tracking-wider text-[11px]">
                                    <th className="px-5 py-3.5">Nama & NIP</th>
                                    <th className="px-5 py-3.5">Jabatan / Unit Kerja</th>
                                    <th className="px-5 py-3.5">Kontak</th>
                                    <th className="px-5 py-3.5">Akun Login</th>
                                    <th className="px-5 py-3.5 text-center">Aset Dipegang</th>
                                    <th className="px-5 py-3.5 text-center">Status</th>
                                    <th className="px-5 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {pegawai.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-12 text-center text-neutral-400">
                                            Tidak ada data pegawai ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    pegawai.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <div className="space-y-0.5">
                                                    <p className="font-bold text-neutral-900">{item.nama}</p>
                                                    <p className="font-mono text-[11px] text-neutral-500">
                                                        {item.nip ? `NIP. ${item.nip}` : 'Non-NIP / Honorer'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="space-y-0.5">
                                                    <p className="font-semibold text-neutral-800">{item.jabatan}</p>
                                                    <p className="text-[11px] text-neutral-400">{item.unit_kerja || 'Kecamatan Mekarmukti'}</p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-neutral-600">
                                                {item.no_hp ? (
                                                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                                                        <Phone className="w-3 h-3 text-neutral-400" />
                                                        <span>{item.no_hp}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-neutral-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {item.user ? (
                                                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-100">
                                                        <UserCheck className="w-3 h-3" />
                                                        <span>{item.user.email}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-neutral-400 italic text-[11px]">Tidak ada akun</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[11px]">
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
                                                        className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-600 hover:text-blue-700 transition-colors"
                                                        title="Edit Pegawai"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeletingPegawai(item)}
                                                        className="p-1.5 hover:bg-rose-50 rounded-lg text-neutral-400 hover:text-rose-600 transition-colors"
                                                        title="Hapus Pegawai"
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
                    {pegawai.links && pegawai.links.length > 3 && (
                        <div className="p-4 border-t border-neutral-100 flex items-center justify-between">
                            <span className="text-xs text-neutral-500">
                                Menampilkan {pegawai.from || 0} - {pegawai.to || 0} dari {pegawai.total} data
                            </span>
                            <div className="flex gap-1">
                                {pegawai.links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        disabled={!link.url || link.active}
                                        onClick={() => router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                                            link.active
                                                ? 'bg-blue-600 text-white border-blue-600 font-bold'
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

            {/* Modal Tambah / Edit Pegawai */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="md">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            <h3 className="text-base font-bold text-neutral-900">
                                {editingPegawai ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'}
                            </h3>
                        </div>
                    </div>

                    <div className="space-y-3.5 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="font-semibold text-neutral-700 block mb-1">
                                    NIP (Nomor Induk Pegawai)
                                </label>
                                <input
                                    type="text"
                                    value={data.nip}
                                    onChange={(e) => setData('nip', e.target.value)}
                                    placeholder="cth: 19800101..."
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500 font-mono"
                                />
                                {errors.nip && <p className="text-rose-500 mt-1 text-[11px]">{errors.nip}</p>}
                            </div>

                            <div>
                                <label className="font-semibold text-neutral-700 block mb-1">
                                    No. Handphone / WhatsApp
                                </label>
                                <input
                                    type="text"
                                    value={data.no_hp}
                                    onChange={(e) => setData('no_hp', e.target.value)}
                                    placeholder="cth: 081234567890"
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500 font-mono"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="font-semibold text-neutral-700 block mb-1">
                                Nama Lengkap <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.nama}
                                onChange={(e) => setData('nama', e.target.value)}
                                placeholder="cth: Dr. H. Ahmad Sudrajat, S.Sos, M.Si"
                                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500"
                            />
                            {errors.nama && <p className="text-rose-500 mt-1 text-[11px]">{errors.nama}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="font-semibold text-neutral-700 block mb-1">
                                    Jabatan <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.jabatan}
                                    onChange={(e) => setData('jabatan', e.target.value)}
                                    placeholder="cth: Pengurus Barang / Camat"
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500"
                                />
                                {errors.jabatan && <p className="text-rose-500 mt-1 text-[11px]">{errors.jabatan}</p>}
                            </div>

                            <div>
                                <label className="font-semibold text-neutral-700 block mb-1">
                                    Unit Kerja
                                </label>
                                <input
                                    type="text"
                                    value={data.unit_kerja}
                                    onChange={(e) => setData('unit_kerja', e.target.value)}
                                    placeholder="cth: Subbag Umum & Kepegawaian"
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="font-semibold text-neutral-700 block mb-1">
                                Tautkan Akun Pengguna Sistem
                            </label>
                            <select
                                value={data.user_id}
                                onChange={(e) => setData('user_id', e.target.value)}
                                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="">-- Tanpa Tautan Akun Login --</option>
                                {editingPegawai?.user && (
                                    <option value={editingPegawai.user.id}>
                                        {editingPegawai.user.name} ({editingPegawai.user.email}) [Tersambung]
                                    </option>
                                )}
                                {unlinkedUsers.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} ({u.email})
                                    </option>
                                ))}
                            </select>
                            {errors.user_id && <p className="text-rose-500 mt-1 text-[11px]">{errors.user_id}</p>}
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <input
                                type="checkbox"
                                id="is_active_pegawai"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="is_active_pegawai" className="font-semibold text-neutral-700 cursor-pointer">
                                Pegawai Aktif Bertugas
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
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : editingPegawai ? 'Perbarui Pegawai' : 'Simpan Pegawai'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Hapus Pegawai */}
            {deletingPegawai && (
                <ConfirmModal
                    isOpen={Boolean(deletingPegawai)}
                    onClose={() => setDeletingPegawai(null)}
                    onConfirm={confirmDelete}
                    title="Hapus Master Pegawai"
                    message={`Apakah Anda yakin ingin menghapus data pegawai '${deletingPegawai.nama}'? Tindakan ini tidak dapat dibatalkan.`}
                    confirmText="Hapus Pegawai"
                    variant="danger"
                />
            )}
        </AuthenticatedLayout>
    );
}
