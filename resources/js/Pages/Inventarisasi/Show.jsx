import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import KondisiBadge from '@/Components/KondisiBadge';
import { 
    ArrowLeft, 
    Smartphone, 
    Lock, 
    Search, 
    CheckCircle2, 
    XCircle, 
    HelpCircle, 
    Building2, 
    Calendar, 
    Filter,
    Check,
    X,
    FileSpreadsheet
} from 'lucide-react';
import { formatDate } from '@/Utils/formatDate';
import { toast } from 'sonner';

export default function InventarisasiShow({ session, items, progress, ruangans, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [hasil, setHasil] = useState(filters.hasil || '');
    const [ruanganId, setRuanganId] = useState(filters.ruangan_id || '');
    
    // Modal Cek Item Manual
    const [selectedItem, setSelectedItem] = useState(null);
    const [formHasil, setFormHasil] = useState('ditemukan');
    const [formKondisi, setFormKondisi] = useState('baik');
    const [formRuangan, setFormRuangan] = useState('');
    const [formCatatan, setFormCatatan] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal Tutup Sesi
    const [showCloseModal, setShowCloseModal] = useState(false);

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('inventarisasi.show', session.id), {
            search: search || undefined,
            hasil: hasil || undefined,
            ruangan_id: ruanganId || undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setSearch('');
        setHasil('');
        setRuanganId('');
        router.get(route('inventarisasi.show', session.id));
    };

    const handleOpenCheckModal = (item) => {
        setSelectedItem(item);
        setFormHasil(item.hasil?.value || item.hasil === 'belum_dicek' ? 'ditemukan' : (item.hasil?.value || item.hasil));
        setFormKondisi(item.kondisi_temuan?.value || item.aset?.kondisi?.value || 'baik');
        setFormRuangan(item.ruangan_temuan_id || item.aset?.ruangan_id || '');
        setFormCatatan(item.catatan || '');
    };

    const handleSubmitCheck = (e) => {
        e.preventDefault();
        if (!selectedItem) return;

        setIsSubmitting(true);
        router.post(
            route('inventarisasi.check-item', [session.id, selectedItem.aset_id]),
            {
                hasil: formHasil,
                kondisi_temuan: formKondisi,
                ruangan_temuan_id: formRuangan || null,
                catatan: formCatatan || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Pemeriksaan fisik aset berhasil diperbarui.');
                    setSelectedItem(null);
                    setIsSubmitting(false);
                },
                onError: (err) => {
                    toast.error('Gagal memperbarui data.');
                    setIsSubmitting(false);
                },
            }
        );
    };

    const handleTutupSesi = () => {
        router.post(route('inventarisasi.tutup', session.id), {}, {
            onSuccess: () => {
                setShowCloseModal(false);
                toast.success('Sesi inventarisasi resmi diselesaikan.');
            },
            onError: (err) => {
                toast.error('Gagal menutup sesi inventarisasi.');
            },
        });
    };

    const isBerjalan = session.status?.value === 'berjalan' || session.status === 'berjalan';

    return (
        <AuthenticatedLayout>
            <Head title={`${session.nama} - SIMUKTI`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('inventarisasi.index')}
                            className="p-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-xl transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                                    isBerjalan ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-700'
                                }`}>
                                    {isBerjalan ? 'Sesi Aktif' : 'Selesai'}
                                </span>
                                <span className="text-xs font-mono text-neutral-400">{session.kode}</span>
                            </div>
                            <h1 className="text-xl font-bold text-neutral-900 mt-1">{session.nama}</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {isBerjalan && (
                            <>
                                <Link
                                    href={route('inventarisasi.sensus-lapangan', session.id)}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
                                >
                                    <Smartphone className="w-4 h-4" />
                                    <span>Sensus Mobile (HP)</span>
                                </Link>

                                <button
                                    onClick={() => setShowCloseModal(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
                                >
                                    <Lock className="w-4 h-4" />
                                    <span>Tutup Sesi & Sinkronkan</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Progress Overview Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Progres Inventarisasi Fisik Lapangan
                        </span>
                        <span className="text-base font-bold text-emerald-600">{progress.persentase}%</span>
                    </div>

                    <div className="w-full bg-neutral-100 rounded-full h-3.5 overflow-hidden p-0.5">
                        <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress.persentase}%` }}
                        />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-center">
                        <div className="p-3 bg-neutral-50 rounded-xl">
                            <span className="text-xs text-neutral-400">Total Terdata</span>
                            <div className="text-lg font-bold text-neutral-800">{progress.total}</div>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-xl">
                            <span className="text-xs text-emerald-600">Ditemukan</span>
                            <div className="text-lg font-bold text-emerald-700">{progress.ditemukan}</div>
                        </div>
                        <div className="p-3 bg-red-50 rounded-xl">
                            <span className="text-xs text-red-600">Tidak Ditemukan</span>
                            <div className="text-lg font-bold text-red-700">{progress.tidak_ditemukan}</div>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-xl">
                            <span className="text-xs text-amber-600">Belum Dicek</span>
                            <div className="text-lg font-bold text-amber-700">{progress.belum_dicek}</div>
                        </div>
                        <div className="p-3 bg-neutral-50 rounded-xl">
                            <span className="text-xs text-neutral-400">Sudah Dicek</span>
                            <div className="text-lg font-bold text-neutral-800">{progress.sudah_dicek}</div>
                        </div>
                    </div>
                </div>

                {/* Filter Items */}
                <form onSubmit={handleFilter} className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-5 relative">
                            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Cari nama, register, kode barang, token..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-colors"
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <select
                                value={hasil}
                                onChange={(e) => setHasil(e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-colors"
                            >
                                <option value="">Semua Status Temuan</option>
                                <option value="belum_dicek">⚪ Belum Diperiksa</option>
                                <option value="ditemukan">🟢 Ditemukan</option>
                                <option value="tidak_ditemukan">🔴 Tidak Ditemukan</option>
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
                            {(search || hasil || ruanganId) && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="px-3 py-2 text-sm text-neutral-600 bg-neutral-100 rounded-xl"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>
                </form>

                {/* Tabel Items */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-50 text-xs text-neutral-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 py-3.5">Nama Aset & Kodefikasi</th>
                                    <th className="px-5 py-3.5">Lokasi Master</th>
                                    <th className="px-5 py-3.5 text-center">Status Pemeriksaan</th>
                                    <th className="px-5 py-3.5">Kondisi Temuan</th>
                                    <th className="px-5 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {items.data && items.data.length > 0 ? (
                                    items.data.map((item) => {
                                        const h = item.hasil?.value || item.hasil;
                                        return (
                                            <tr key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                                                <td className="px-5 py-4">
                                                    <div className="font-semibold text-neutral-900">
                                                        {item.aset?.nama}
                                                    </div>
                                                    <div className="text-xs text-neutral-400 mt-0.5">
                                                        {item.aset?.kode_barang} • Reg: {item.aset?.nomor_register}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-xs text-neutral-600">
                                                    <div>{item.aset?.ruangan?.nama || 'Tanpa Ruangan'}</div>
                                                    {item.aset?.pemegang && (
                                                        <div className="text-neutral-400 mt-0.5">PJ: {item.aset.pemegang.nama}</div>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    {h === 'ditemukan' ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            <span>Ditemukan</span>
                                                        </span>
                                                    ) : h === 'tidak_ditemukan' ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                                            <XCircle className="w-3.5 h-3.5" />
                                                            <span>Tidak Ditemukan</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-500">
                                                            <HelpCircle className="w-3.5 h-3.5" />
                                                            <span>Belum Dicek</span>
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4">
                                                    {item.kondisi_temuan ? (
                                                        <KondisiBadge kondisi={item.kondisi_temuan?.value || item.kondisi_temuan} />
                                                    ) : (
                                                        <span className="text-xs text-neutral-300">-</span>
                                                    )}
                                                    {item.catatan && (
                                                        <div className="text-[11px] text-neutral-400 mt-1 italic">
                                                            "{item.catatan}"
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    {isBerjalan && (
                                                        <button
                                                            onClick={() => handleOpenCheckModal(item)}
                                                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg text-xs transition-colors border border-emerald-200/50"
                                                        >
                                                            Periksa
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-xs text-neutral-400">
                                            Tidak ada item sensus yang sesuai dengan kriteria filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {items.links && items.links.length > 3 && (
                        <div className="px-5 py-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                            <div>
                                Menampilkan {items.from || 0} - {items.to || 0} dari {items.total} aset
                            </div>
                            <div className="flex items-center gap-1">
                                {items.links.map((link, idx) => (
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
                </div>
            </div>

            {/* Modal Periksa Item */}
            <Modal show={!!selectedItem} onClose={() => setSelectedItem(null)} maxWidth="md">
                {selectedItem && (
                    <form onSubmit={handleSubmitCheck} className="p-6 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                            <div>
                                <h2 className="text-base font-bold text-neutral-900">Periksa Aset Fisik</h2>
                                <p className="text-xs text-neutral-500 mt-0.5">
                                    {selectedItem.aset?.nama} (Reg: {selectedItem.aset?.nomor_register})
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedItem(null)}
                                className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Status Temuan */}
                        <div>
                            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                                Status Keberadaan Fisik <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormHasil('ditemukan')}
                                    className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 ${
                                        formHasil === 'ditemukan'
                                            ? 'bg-emerald-600 text-white border-emerald-600'
                                            : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                                    }`}
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Ditemukan</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormHasil('tidak_ditemukan')}
                                    className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 ${
                                        formHasil === 'tidak_ditemukan'
                                            ? 'bg-red-600 text-white border-red-600'
                                            : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                                    }`}
                                >
                                    <XCircle className="w-4 h-4" />
                                    <span>Tidak Ditemukan</span>
                                </button>
                            </div>
                        </div>

                        {formHasil === 'ditemukan' && (
                            <>
                                {/* Kondisi Temuan */}
                                <div>
                                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                                        Kondisi Fisik Aktual <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formKondisi}
                                        onChange={(e) => setFormKondisi(e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="baik">🟢 Baik (Layak Pakai)</option>
                                        <option value="rusak_ringan">🟡 Rusak Ringan</option>
                                        <option value="rusak_berat">🔴 Rusak Berat (Mati Total)</option>
                                    </select>
                                </div>

                                {/* Ruangan Temuan */}
                                <div>
                                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                                        Ruangan Fisik Ditemukan
                                    </label>
                                    <select
                                        value={formRuangan}
                                        onChange={(e) => setFormRuangan(e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="">-- Sesuai Ruangan Master / Pilih --</option>
                                        {ruangans.map((r) => (
                                            <option key={r.id} value={r.id}>{r.nama}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        {/* Catatan */}
                        <div>
                            <label className="block text-xs font-semibold text-neutral-700 mb-1">
                                Catatan Pemeriksaan
                            </label>
                            <textarea
                                rows={2}
                                placeholder="Contoh: Unit berada di meja pelayanan, lecet pemakaian..."
                                value={formCatatan}
                                onChange={(e) => setFormCatatan(e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100">
                            <button
                                type="button"
                                onClick={() => setSelectedItem(null)}
                                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100 rounded-xl"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? 'Menyimpan...' : 'Simpan Pemeriksaan'}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Modal Konfirmasi Tutup Sesi */}
            <Modal show={showCloseModal} onClose={() => setShowCloseModal(false)} maxWidth="sm">
                <div className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                        <Lock className="w-6 h-6" />
                    </div>

                    <div className="text-center">
                        <h3 className="text-lg font-bold text-neutral-900">Tutup Sesi Sensus?</h3>
                        <p className="text-xs text-neutral-500 mt-1">
                            Aksi ini akan mengunci sesi ini menjadi <strong>Selesai</strong> dan memperbarui kondisi aktual seluruh aset ke database induk.
                        </p>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-xl text-xs space-y-1 text-neutral-600">
                        <div>• {progress.ditemukan} aset akan diperbarui kondisinya.</div>
                        <div>• {progress.tidak_ditemukan} aset tercatat hilang/tidak ditemukan.</div>
                        <div>• Tanggal verifikasi fisik aset akan disetel ke hari ini.</div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setShowCloseModal(false)}
                            className="flex-1 py-2.5 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-xl"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleTutupSesi}
                            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors"
                        >
                            Ya, Tutup Sesi
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
