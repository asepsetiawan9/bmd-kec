import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import KondisiBadge from '@/Components/KondisiBadge';
import { 
    ArrowLeft, 
    Trash2, 
    Calendar, 
    FileText, 
    CheckCircle2, 
    XCircle, 
    AlertCircle, 
    Clock, 
    Send, 
    ShieldCheck, 
    X,
    FileSignature,
    AlertTriangle
} from 'lucide-react';
import { formatRupiah } from '@/Utils/formatRupiah';
import { formatDate } from '@/Utils/formatDate';
import { toast } from 'sonner';

export default function PenghapusanShow({ usulan }) {
    const { auth } = usePage().props;
    const permissions = auth?.permissions || [];
    const userRole = auth?.user?.role || '';

    // Modals
    const [showKembalikanModal, setShowKembalikanModal] = useState(false);
    const [kembalikanRole, setKembalikanRole] = useState('sekcam'); // sekcam or camat
    const [catatanRevisi, setCatatanRevisi] = useState('');
    
    const [showSkModal, setShowSkModal] = useState(false);
    const [nomorSk, setNomorSk] = useState('');
    const [tanggalSk, setTanggalSk] = useState(new Date().toISOString().split('T')[0]);

    const statusVal = usulan.status?.value || usulan.status;

    // Actions
    const handleAjukan = () => {
        router.post(route('penghapusan.ajukan', usulan.id), {}, {
            onSuccess: () => toast.success('Usulan berhasil diajukan ke Sekcam.'),
            onError: (err) => toast.error(Object.values(err)[0] || 'Gagal mengajukan usulan.'),
        });
    };

    const handleVerifikasiSekcam = () => {
        router.post(route('penghapusan.verifikasi-sekcam', usulan.id), {}, {
            onSuccess: () => toast.success('Usulan berhasil diverifikasi Sekcam.'),
            onError: (err) => toast.error(Object.values(err)[0] || 'Gagal memverifikasi usulan.'),
        });
    };

    const handleOpenKembalikan = (role) => {
        setKembalikanRole(role);
        setCatatanRevisi('');
        setShowKembalikanModal(true);
    };

    const handleSubmitKembalikan = (e) => {
        e.preventDefault();
        if (catatanRevisi.trim().length < 10) {
            toast.error('Catatan pengembalian wajib minimal 10 karakter.');
            return;
        }

        const endpoint = kembalikanRole === 'camat'
            ? route('penghapusan.kembalikan-camat', usulan.id)
            : route('penghapusan.kembalikan-sekcam', usulan.id);

        router.post(endpoint, { catatan: catatanRevisi }, {
            onSuccess: () => {
                setShowKembalikanModal(false);
                toast.warning('Usulan telah dikembalikan dengan catatan revisi.');
            },
            onError: (err) => toast.error(Object.values(err)[0] || 'Gagal mengembalikan usulan.'),
        });
    };

    const handleSetujuiCamat = () => {
        router.post(route('penghapusan.setujui-camat', usulan.id), {}, {
            onSuccess: () => toast.success('Usulan resmi disetujui Camat.'),
            onError: (err) => toast.error(Object.values(err)[0] || 'Gagal menyetujui usulan.'),
        });
    };

    const handleSubmitSk = (e) => {
        e.preventDefault();
        if (!nomorSk.trim()) {
            toast.error('Nomor SK Penghapusan wajib diisi.');
            return;
        }

        router.post(route('penghapusan.selesaikan-sk', usulan.id), {
            nomor_sk_penghapusan: nomorSk,
            tanggal_sk: tanggalSk,
        }, {
            onSuccess: () => {
                setShowSkModal(false);
                toast.success('SK Penghapusan berhasil dicatat dan status aset resmi DIHAPUS.');
            },
            onError: (err) => toast.error(Object.values(err)[0] || 'Gagal menyimpan SK.'),
        });
    };

    const canVerify = permissions.includes('penghapusan.verify') || ['super_admin', 'penatausaha'].includes(userRole);
    const canApprove = permissions.includes('penghapusan.approve') || ['super_admin', 'camat'].includes(userRole);
    const canManage = permissions.includes('penghapusan.create') || ['super_admin', 'pengurus_barang'].includes(userRole);

    return (
        <AuthenticatedLayout>
            <Head title={`Usulan ${usulan.nomor} - SIMUKTI`} />

            <div className="space-y-6 max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('penghapusan.index')}
                            className="p-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-xl transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-red-100 text-red-800">
                                    PENGHAPUSAN BMD
                                </span>
                                <span className="text-xs font-mono text-neutral-400">{usulan.nomor}</span>
                            </div>
                            <h1 className="text-xl font-bold text-neutral-900 mt-1">
                                Berkas Usulan Penghapusan Aset
                            </h1>
                            <p className="text-xs text-neutral-500 mt-0.5">
                                Dibuat pada tanggal {formatDate(usulan.tanggal)} oleh {usulan.pembuat?.name || 'Pengurus Barang'}
                            </p>
                        </div>
                    </div>

                    {/* Action Bar Berdasarkan Status & Wewenang */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Pengurus Barang: Ajukan jika draft atau dikembalikan */}
                        {canManage && ['draft', 'dikembalikan_penatausaha', 'dikembalikan_camat'].includes(statusVal) && (
                            <button
                                onClick={handleAjukan}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                            >
                                <Send className="w-4 h-4" />
                                <span>Ajukan ke Sekcam</span>
                            </button>
                        )}

                        {/* Sekcam: Verifikasi atau Kembalikan */}
                        {canVerify && statusVal === 'diajukan' && (
                            <>
                                <button
                                    onClick={() => handleOpenKembalikan('sekcam')}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-sm font-medium transition-colors"
                                >
                                    <XCircle className="w-4 h-4 text-red-500" />
                                    <span>Kembalikan Revisi</span>
                                </button>
                                <button
                                    onClick={handleVerifikasiSekcam}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Verifikasi (Teruskan ke Camat)</span>
                                </button>
                            </>
                        )}

                        {/* Camat: Setujui atau Kembalikan */}
                        {canApprove && statusVal === 'diverifikasi' && (
                            <>
                                <button
                                    onClick={() => handleOpenKembalikan('camat')}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-sm font-medium transition-colors"
                                >
                                    <XCircle className="w-4 h-4 text-red-500" />
                                    <span>Kembalikan Revisi</span>
                                </button>
                                <button
                                    onClick={handleSetujuiCamat}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>Setujui Penghapusan</span>
                                </button>
                            </>
                        )}

                        {/* Pengurus Barang: Input SK Penghapusan jika disetujui */}
                        {canManage && statusVal === 'disetujui' && (
                            <button
                                onClick={() => setShowSkModal(true)}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                            >
                                <FileSignature className="w-4 h-4" />
                                <span>Input Nomor SK & Selesaikan</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* State Machine Stepper Visual */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-4">
                        Alur Status Persetujuan Penghapusan
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                        {/* Step 1: Pengajuan */}
                        <div className={`p-3.5 rounded-xl border ${
                            statusVal !== 'draft' ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                        }`}>
                            <div className="font-bold flex items-center justify-between">
                                <span>1. Diajukan</span>
                                {statusVal !== 'draft' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                            </div>
                            <p className="text-[11px] text-neutral-500 mt-1">
                                Oleh Pengurus Barang
                            </p>
                        </div>

                        {/* Step 2: Verifikasi Sekcam */}
                        <div className={`p-3.5 rounded-xl border ${
                            ['diverifikasi', 'disetujui', 'selesai'].includes(statusVal)
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                                : statusVal === 'diajukan'
                                ? 'bg-amber-50 border-amber-300 text-amber-900 ring-1 ring-amber-400'
                                : statusVal === 'dikembalikan_penatausaha'
                                ? 'bg-red-50 border-red-300 text-red-900'
                                : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                        }`}>
                            <div className="font-bold flex items-center justify-between">
                                <span>2. Verifikasi Sekcam</span>
                                {['diverifikasi', 'disetujui', 'selesai'].includes(statusVal) ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                ) : statusVal === 'dikembalikan_penatausaha' ? (
                                    <XCircle className="w-4 h-4 text-red-600" />
                                ) : null}
                            </div>
                            <p className="text-[11px] text-neutral-500 mt-1">
                                {statusVal === 'diajukan' ? 'Menunggu Pemeriksaan' : statusVal === 'dikembalikan_penatausaha' ? 'Dikembalikan' : 'Terverifikasi'}
                            </p>
                        </div>

                        {/* Step 3: Persetujuan Camat */}
                        <div className={`p-3.5 rounded-xl border ${
                            ['disetujui', 'selesai'].includes(statusVal)
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                                : statusVal === 'diverifikasi'
                                ? 'bg-blue-50 border-blue-300 text-blue-900 ring-1 ring-blue-400'
                                : statusVal === 'dikembalikan_camat'
                                ? 'bg-red-50 border-red-300 text-red-900'
                                : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                        }`}>
                            <div className="font-bold flex items-center justify-between">
                                <span>3. Persetujuan Camat</span>
                                {['disetujui', 'selesai'].includes(statusVal) ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                ) : statusVal === 'dikembalikan_camat' ? (
                                    <XCircle className="w-4 h-4 text-red-600" />
                                ) : null}
                            </div>
                            <p className="text-[11px] text-neutral-500 mt-1">
                                {statusVal === 'diverifikasi' ? 'Menunggu Persetujuan' : statusVal === 'dikembalikan_camat' ? 'Dikembalikan' : 'Disetujui Resmi'}
                            </p>
                        </div>

                        {/* Step 4: SK Terbit */}
                        <div className={`p-3.5 rounded-xl border ${
                            statusVal === 'selesai'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                        }`}>
                            <div className="font-bold flex items-center justify-between">
                                <span>4. SK Terbit (Selesai)</span>
                                {statusVal === 'selesai' && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </div>
                            <p className={`text-[11px] mt-1 ${statusVal === 'selesai' ? 'text-emerald-100' : 'text-neutral-400'}`}>
                                Aset Resmi Dihapus
                            </p>
                        </div>
                    </div>
                </div>

                {/* Banner Catatan Pengembalian (Jika Ada) */}
                {(usulan.catatan_penatausaha || usulan.catatan_camat) && (
                    <div className="bg-red-50 border border-red-200 p-5 rounded-2xl space-y-2">
                        <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <span>Catatan Revisi / Pengembalian:</span>
                        </div>
                        {usulan.catatan_penatausaha && (
                            <div className="text-xs text-red-900">
                                <strong>Catatan Sekcam (Penatausaha):</strong> {usulan.catatan_penatausaha}
                            </div>
                        )}
                        {usulan.catatan_camat && (
                            <div className="text-xs text-red-900">
                                <strong>Catatan Camat:</strong> {usulan.catatan_camat}
                            </div>
                        )}
                    </div>
                )}

                {/* Info SK Penghapusan (Jika Selesai) */}
                {usulan.nomor_sk_penghapusan && (
                    <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
                        <div>
                            <span className="font-bold text-sm block">Surat Keputusan (SK) Penghapusan Terbit:</span>
                            <span className="font-mono text-base font-bold text-emerald-800">{usulan.nomor_sk_penghapusan}</span>
                            <span className="text-emerald-700 ml-2">Tanggal: {formatDate(usulan.tanggal_sk)}</span>
                        </div>
                        <span className="px-3 py-1 bg-emerald-600 text-white rounded-full font-bold">
                            MUTLAK SELESAI
                        </span>
                    </div>
                )}

                {/* Tabel Aset yang Diusulkan */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                    <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                        <h2 className="font-bold text-neutral-900 text-sm uppercase tracking-wider">
                            Rincian Barang Milik Daerah ({usulan.items?.length || 0} Unit)
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-50 text-xs text-neutral-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 py-3.5 text-center w-12">No</th>
                                    <th className="px-5 py-3.5">Nama Barang & Kodefikasi</th>
                                    <th className="px-5 py-3.5">Nilai Perolehan</th>
                                    <th className="px-5 py-3.5">Alasan Penghapusan</th>
                                    <th className="px-5 py-3.5">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {usulan.items && usulan.items.map((item, idx) => (
                                    <tr key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                                        <td className="px-5 py-4 text-center text-neutral-400 font-medium">
                                            {idx + 1}
                                        </td>
                                        <td className="px-5 py-4">
                                            <Link
                                                href={route('aset.show', item.aset_id)}
                                                className="font-medium text-emerald-700 hover:underline"
                                            >
                                                {item.aset?.nama}
                                            </Link>
                                            <div className="text-xs text-neutral-400 mt-0.5">
                                                {item.aset?.kode_barang} • Reg: {item.aset?.nomor_register}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 font-semibold text-neutral-900 text-xs">
                                            {item.aset?.nilai_perolehan ? formatRupiah(item.aset.nilai_perolehan) : '-'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 uppercase">
                                                {item.alasan.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-neutral-600">
                                            {item.keterangan || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Kembalikan Revisi */}
            <Modal show={showKembalikanModal} onClose={() => setShowKembalikanModal(false)} maxWidth="md">
                <form onSubmit={handleSubmitKembalikan} className="p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                        <h2 className="text-base font-bold text-neutral-900">Kembalikan Usulan untuk Revisi</h2>
                        <button type="button" onClick={() => setShowKembalikanModal(false)}>
                            <X className="w-5 h-5 text-neutral-400" />
                        </button>
                    </div>

                    <p className="text-xs text-neutral-600">
                        Masukkan catatan dan alasan pengembalian secara mendetail untuk ditindaklanjuti oleh Pengurus Barang (minimal 10 karakter).
                    </p>

                    <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">
                            Catatan Revisi <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={4}
                            placeholder="Tuliskan catatan perbaikan..."
                            value={catatanRevisi}
                            onChange={(e) => setCatatanRevisi(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500"
                            required
                        />
                        <span className="text-[11px] text-neutral-400">
                            {catatanRevisi.length} / min 10 karakter
                        </span>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100">
                        <button
                            type="button"
                            onClick={() => setShowKembalikanModal(false)}
                            className="px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-xl"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={catatanRevisi.trim().length < 10}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                        >
                            Kembalikan Berkas
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Input SK Penghapusan */}
            <Modal show={showSkModal} onClose={() => setShowSkModal(false)} maxWidth="md">
                <form onSubmit={handleSubmitSk} className="p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                        <div className="flex items-center gap-2">
                            <FileSignature className="w-5 h-5 text-purple-600" />
                            <h2 className="text-base font-bold text-neutral-900">Penerbitan SK Penghapusan</h2>
                        </div>
                        <button type="button" onClick={() => setShowSkModal(false)}>
                            <X className="w-5 h-5 text-neutral-400" />
                        </button>
                    </div>

                    <p className="text-xs text-neutral-600">
                        Input nomor Surat Keputusan resmi dari BPKAD / Bupati / Camat. Setelah disimpan, status seluruh aset terkait akan berubah permanen menjadi <strong>DIHAPUS</strong>.
                    </p>

                    <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">
                            Nomor SK Penghapusan <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Contoh: SK-BMD/028/2026/BPKAD"
                            value={nomorSk}
                            onChange={(e) => setNomorSk(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">
                            Tanggal SK <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={tanggalSk}
                            onChange={(e) => setTanggalSk(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500"
                            required
                        />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100">
                        <button
                            type="button"
                            onClick={() => setShowSkModal(false)}
                            className="px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-xl"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-colors"
                        >
                            Simpan & Hapus Aset
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
