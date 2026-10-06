import React, { useState } from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import KondisiBadge from '@/Components/KondisiBadge';
import GolonganBadge from '@/Components/GolonganBadge';
import Modal from '@/Components/Modal';
import ConfirmModal from '@/Components/ConfirmModal';
import { formatRupiah } from '@/Utils/formatRupiah';
import { formatDate } from '@/Utils/formatDate';
import {
    ArrowLeft,
    Box,
    Building2,
    Calendar,
    DollarSign,
    QrCode,
    FileText,
    Clock,
    User as UserIcon,
    Edit3,
    CheckCircle2,
    AlertTriangle,
    Download,
    Layers,
    Shield,
    History,
    Printer,
    UploadCloud,
    Trash2,
    Image as ImageIcon,
    ZoomIn,
    X,
    FileCheck,
    Wrench,
    MapPin,
    Truck,
    HardHat,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Detail({ aset, pegawaiList = [], ruanganList = [] }) {
    const { auth } = usePage().props;
    const userRole = auth?.user?.role;
    const permissions = auth?.user?.permissions || auth?.permissions || [];
    const canUpdate = permissions.includes('aset.update') || ['pengurus_barang', 'super_admin'].includes(userRole);
    const canPrintLabel = permissions.includes('aset.label.print') || ['pengurus_barang', 'super_admin', 'camat', 'penatausaha'].includes(userRole);

    const [activeTab, setActiveTab] = useState('spesifikasi');
    const [lightboxImage, setLightboxImage] = useState(null);
    const [uploadDocModalOpen, setUploadDocModalOpen] = useState(false);
    const [deletingDoc, setDeletingDoc] = useState(null);

    // Form upload dokumen
    const { data: docData, setData: setDocData, post: postDoc, processing: docProcessing, errors: docErrors, reset: resetDoc } = useForm({
        file: null,
        jenis: 'sertifikat',
        nama_dokumen: '',
        nomor_dokumen: '',
    });

    const handleUploadDoc = (e) => {
        e.preventDefault();
        postDoc(`/aset/${aset.id}/dokumen`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setUploadDocModalOpen(false);
                resetDoc();
            },
        });
    };

    const handleDeleteDocConfirm = () => {
        if (!deletingDoc) return;
        router.delete(`/aset/${aset.id}/dokumen/${deletingDoc.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeletingDoc(null),
        });
    };

    // Subdetail data
    const subdetail = aset.detailTanah ||
        aset.detailPeralatan ||
        aset.detailGedung ||
        aset.detailJalan ||
        aset.detailLainnya ||
        aset.detailKdp || {};

    const golonganKey = aset.golongan?.value || aset.golongan || 'B';

    // Separate photos vs legal documents
    const allDocs = aset.dokumen || [];
    const fotoDocs = allDocs.filter((d) => d.jenis === 'foto');
    const legalDocs = allDocs.filter((d) => d.jenis !== 'foto');

    return (
        <AuthenticatedLayout title={`Aset: ${aset.nama}`}>
            <Head title={`Detail Aset BMD - ${aset.nama}`} />

            <div className="space-y-6">
                {/* Navigation Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
                    <Link
                        href="/aset"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Daftar Aset
                    </Link>

                    <div className="flex items-center gap-2 flex-wrap">
                        {canPrintLabel && (
                            <a
                                href={`/aset/cetak-label?ids=${aset.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-800 hover:bg-neutral-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                            >
                                <Printer className="w-4 h-4 text-emerald-400" />
                                Cetak Label Stiker A4
                            </a>
                        )}

                        <a
                            href={`/aset/${aset.id}/qr`}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-semibold border border-purple-200 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Unduh QR PNG
                        </a>

                        {canUpdate && (
                            <Link
                                href={`/aset/${aset.id}/edit`}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                            >
                                <Edit3 className="w-4 h-4" />
                                Edit Spesifikasi Aset
                            </Link>
                        )}
                    </div>
                </div>

                {/* Hero Header Card */}
                <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs">
                    <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                        <div className="flex gap-5 items-start">
                            {/* Main Asset Photo */}
                            <div
                                onClick={() => aset.foto_path && setLightboxImage(`/storage/${aset.foto_path}`)}
                                className={`w-28 h-28 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 flex items-center justify-center ${
                                    aset.foto_path ? 'cursor-pointer hover:opacity-90 shadow-sm' : ''
                                }`}
                            >
                                {aset.foto_path ? (
                                    <img
                                        src={`/storage/${aset.foto_path}`}
                                        alt={aset.nama}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Box className="w-10 h-10 text-neutral-300" />
                                )}
                            </div>

                            {/* Titles & Tags */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <GolonganBadge golongan={golonganKey} full />
                                    <KondisiBadge kondisi={aset.kondisi?.value || aset.kondisi} />
                                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                        REG: {aset.nomor_register}
                                    </span>
                                </div>

                                <h1 className="text-xl font-bold text-neutral-900 leading-snug">
                                    {aset.nama}
                                </h1>

                                <div className="flex items-center gap-4 text-xs text-neutral-500 font-mono">
                                    <span>Kode: {aset.kode_barang}</span>
                                    <span>&bull;</span>
                                    <span>Tahun: {aset.tahun_perolehan}</span>
                                    <span>&bull;</span>
                                    <span className="text-emerald-700 font-bold">
                                        {formatRupiah(aset.nilai_perolehan || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* QR Code Mini Card */}
                        <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200/80 flex items-center gap-3 shrink-0">
                            <div className="w-16 h-16 bg-white p-1 rounded-xl border border-neutral-200 shadow-2xs">
                                {aset.qr_code_path ? (
                                    <img
                                        src={`/storage/${aset.qr_code_path}`}
                                        alt="QR"
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <QrCode className="w-full h-full text-neutral-400" />
                                )}
                            </div>
                            <div className="text-[11px] space-y-0.5">
                                <p className="font-bold text-neutral-800">QR Verifikasi</p>
                                <p className="text-neutral-500 font-mono text-[10px]">
                                    {aset.qr_token?.substring(0, 12)}...
                                </p>
                                <a
                                    href={`/scan/${aset.qr_token}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-600 hover:text-emerald-700 font-semibold block text-[11px]"
                                >
                                    Uji Portal Scan &rarr;
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-2 border-t border-neutral-100 mt-6 pt-4 overflow-x-auto scrollbar-none text-xs">
                        {[
                            { key: 'spesifikasi', label: 'Spesifikasi & Detail', icon: Layers },
                            { key: 'foto', label: `Galeri Foto (${fotoDocs.length + (aset.foto_path ? 1 : 0)})`, icon: ImageIcon },
                            { key: 'dokumen', label: `Dokumen Legalitas (${legalDocs.length})`, icon: Shield },
                            { key: 'transaksi', label: `Mutasi & Pemeliharaan (${(aset.mutasi?.length || 0) + (aset.pemeliharaan?.length || 0)})`, icon: History },
                            { key: 'audit', label: `Audit Trail (${aset.riwayat?.length || 0})`, icon: Clock },
                        ].map((tab) => {
                            const active = activeTab === tab.key;
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                                        active
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* TAB 1: SPESIFIKASI & DETAIL */}
                {activeTab === 'spesifikasi' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        {/* Data Umum & Finansial */}
                        <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
                            <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-emerald-600" />
                                Data Pembukuan & Finansial
                            </h3>

                            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                                <div>
                                    <dt className="text-neutral-400 font-medium">Nilai Perolehan</dt>
                                    <dd className="font-bold text-neutral-900 text-sm font-mono mt-0.5">
                                        {formatRupiah(aset.nilai_perolehan || 0)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-neutral-400 font-medium">Tahun Perolehan</dt>
                                    <dd className="font-bold text-neutral-800 mt-0.5">{aset.tahun_perolehan}</dd>
                                </div>
                                <div>
                                    <dt className="text-neutral-400 font-medium">Tanggal Perolehan</dt>
                                    <dd className="font-semibold text-neutral-800 mt-0.5">
                                        {aset.tanggal_perolehan ? formatDate(aset.tanggal_perolehan) : '-'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-neutral-400 font-medium">Cara Perolehan</dt>
                                    <dd className="font-semibold text-neutral-800 mt-0.5 capitalize">
                                        {aset.cara_perolehan?.value || aset.cara_perolehan || '-'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-neutral-400 font-medium">Sumber Dana</dt>
                                    <dd className="font-semibold text-neutral-800 mt-0.5 uppercase">
                                        {aset.sumber_dana?.value || aset.sumber_dana || '-'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-neutral-400 font-medium">Satuan Barang</dt>
                                    <dd className="font-semibold text-neutral-800 mt-0.5">{aset.satuan || 'Unit'}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Lokasi & Pemegang */}
                        <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
                            <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-blue-600" />
                                Penempatan & Penanggung Jawab
                            </h3>

                            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                                <div>
                                    <dt className="text-neutral-400 font-medium">Ruangan Penempatan</dt>
                                    <dd className="font-bold text-neutral-900 mt-0.5">
                                        {aset.ruangan?.nama || 'Belum ditentukan'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-neutral-400 font-medium">Kode Ruangan</dt>
                                    <dd className="font-mono text-neutral-800 mt-0.5">
                                        {aset.ruangan?.kode || '-'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-neutral-400 font-medium">Pegawai Pemegang</dt>
                                    <dd className="font-bold text-neutral-900 mt-0.5">
                                        {aset.pemegang?.nama || 'Umum / Tidak tercatat'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-neutral-400 font-medium">Jabatan Pemegang</dt>
                                    <dd className="text-neutral-700 mt-0.5">
                                        {aset.pemegang?.jabatan || '-'}
                                    </dd>
                                </div>
                                <div className="col-span-2">
                                    <dt className="text-neutral-400 font-medium">Keterangan Tambahan</dt>
                                    <dd className="text-neutral-700 mt-0.5">
                                        {aset.keterangan || 'Tidak ada catatan tambahan.'}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Spesifikasi Khusus Golongan A-F */}
                        <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
                            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                                    <Wrench className="w-4 h-4 text-purple-600" />
                                    Spesifikasi Teknis Formal KIB {golonganKey}
                                </h3>
                                <GolonganBadge golongan={golonganKey} />
                            </div>

                            {/* GOLONGAN A: TANAH */}
                            {golonganKey === 'A' && (
                                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                                    <div>
                                        <dt className="text-neutral-400 font-medium">Luas Tanah</dt>
                                        <dd className="font-bold text-neutral-900 mt-0.5">{subdetail.luas_m2 ? `${subdetail.luas_m2} m²` : '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-neutral-400 font-medium">Status Hak</dt>
                                        <dd className="font-semibold text-neutral-800 mt-0.5">{subdetail.status_hak || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-neutral-400 font-medium">Penggunaan</dt>
                                        <dd className="font-semibold text-neutral-800 mt-0.5">{subdetail.penggunaan || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-neutral-400 font-medium">Nomor Sertifikat</dt>
                                        <dd className="font-mono font-bold text-neutral-900 mt-0.5">{subdetail.nomor_sertifikat || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-neutral-400 font-medium">Tanggal Sertifikat</dt>
                                        <dd className="font-semibold text-neutral-800 mt-0.5">{subdetail.tanggal_sertifikat ? formatDate(subdetail.tanggal_sertifikat) : '-'}</dd>
                                    </div>
                                    <div className="sm:col-span-3">
                                        <dt className="text-neutral-400 font-medium">Letak / Alamat</dt>
                                        <dd className="text-neutral-800 mt-0.5">{subdetail.alamat || '-'}</dd>
                                    </div>
                                </dl>
                            )}

                            {/* GOLONGAN B: PERALATAN & MESIN */}
                            {golonganKey === 'B' && (
                                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                                    <div>
                                        <dt className="text-neutral-400 font-medium">Merk / Tipe</dt>
                                        <dd className="font-bold text-neutral-900 mt-0.5">{aset.merk_type || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-neutral-400 font-medium">Ukuran / CC</dt>
                                        <dd className="font-semibold text-neutral-800 mt-0.5">{subdetail.ukuran_cc || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-neutral-400 font-medium">Bahan</dt>
                                        <dd className="font-semibold text-neutral-800 mt-0.5">{subdetail.bahan || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-neutral-400 font-medium">Nomor Polisi (Plat)</dt>
                                        <dd className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded mt-0.5 inline-block">
                                            {subdetail.nomor_polisi || '-'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-neutral-400 font-medium">Nomor Rangka</dt>
                                        <dd className="font-mono text-neutral-800 mt-0.5">{subdetail.nomor_rangka || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-neutral-400 font-medium">Nomor Mesin</dt>
                                        <dd className="font-mono text-neutral-800 mt-0.5">{subdetail.nomor_mesin || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-neutral-400 font-medium">Nomor BPKB</dt>
                                        <dd className="font-mono text-neutral-800 mt-0.5">{subdetail.nomor_bpkb || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-neutral-400 font-medium">Jatuh Tempo Pajak</dt>
                                        <dd className="font-semibold text-neutral-800 mt-0.5">
                                            {subdetail.tanggal_pajak ? formatDate(subdetail.tanggal_pajak) : '-'}
                                        </dd>
                                    </div>
                                </dl>
                            )}

                            {/* GOLONGAN C: GEDUNG & BANGUNAN */}
                            {golonganKey === 'C' && (
                                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                                    <div>
                                        <dt className="text-neutral-400 font-medium">Kondisi Bangunan</dt>
                                        <dd className="font-bold text-neutral-900 mt-0.5">{subdetail.kondisi_bangunan || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-neutral-400 font-medium">Bertingkat</dt>
                                        <dd className="font-semibold text-neutral-800 mt-0.5">{subdetail.bertingkat ? 'Ya' : 'Tidak'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-neutral-400 font-medium">Konstruksi Beton</dt>
                                        <dd className="font-semibold text-neutral-800 mt-0.5">{subdetail.beton ? 'Ya (Beton)' : 'Bukan'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-neutral-400 font-medium">Luas Lantai</dt>
                                        <dd className="font-bold text-neutral-900 mt-0.5">{subdetail.luas_lantai_m2 ? `${subdetail.luas_lantai_m2} m²` : '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-neutral-400 font-medium">No. Dokumen / IMB</dt>
                                        <dd className="font-mono text-neutral-800 mt-0.5">{subdetail.nomor_dokumen || '-'}</dd>
                                    </div>
                                    <div className="sm:col-span-3">
                                        <dt className="text-neutral-400 font-medium">Lokasi Bangunan</dt>
                                        <dd className="text-neutral-800 mt-0.5">{subdetail.alamat || '-'}</dd>
                                    </div>
                                </dl>
                            )}

                            {/* GOLONGAN D: JALAN, IRIGASI & JARINGAN */}
                            {golonganKey === 'D' && (
                                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                                    <div>
                                        <dt className="text-neutral-400 font-medium">Konstruksi</dt>
                                        <dd className="font-bold text-neutral-900 mt-0.5">{subdetail.konstruksi || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-neutral-400 font-medium">Panjang</dt>
                                        <dd className="font-semibold text-neutral-800 mt-0.5">{subdetail.panjang_m ? `${subdetail.panjang_m} m` : '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-neutral-400 font-medium">Lebar</dt>
                                        <dd className="font-semibold text-neutral-800 mt-0.5">{subdetail.lebar_m ? `${subdetail.lebar_m} m` : '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-neutral-400 font-medium">Luas Total</dt>
                                        <dd className="font-bold text-neutral-900 mt-0.5">{subdetail.luas_m2 ? `${subdetail.luas_m2} m²` : '-'}</dd>
                                    </div>
                                </dl>
                            )}

                            {/* GOLONGAN E: ASET TETAP LAINNYA */}
                            {golonganKey === 'E' && (
                                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                                    <div>
                                        <dt className="text-neutral-400 font-medium">Judul / Spesifikasi</dt>
                                        <dd className="font-bold text-neutral-900 mt-0.5">{subdetail.judul_pencipta || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-neutral-400 font-medium">Asal Daerah</dt>
                                        <dd className="font-semibold text-neutral-800 mt-0.5">{subdetail.asal_daerah || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-neutral-400 font-medium">Jenis Hewan / Tumbuhan</dt>
                                        <dd className="font-semibold text-neutral-800 mt-0.5">{subdetail.jenis_hewan_tumbuhan || '-'}</dd>
                                    </div>
                                </dl>
                            )}

                            {/* GOLONGAN F: KDP */}
                            {golonganKey === 'F' && (
                                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                                    <div>
                                        <dt className="text-neutral-400 font-medium">Rencana Bangunan</dt>
                                        <dd className="font-bold text-neutral-900 mt-0.5">{subdetail.bangunan || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-neutral-400 font-medium">Tanggal Mulai Pengerjaan</dt>
                                        <dd className="font-semibold text-neutral-800 mt-0.5">
                                            {subdetail.tanggal_mulai ? formatDate(subdetail.tanggal_mulai) : '-'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-neutral-400 font-medium">Nilai Kontrak Pelaksanaan</dt>
                                        <dd className="font-mono font-bold text-emerald-700 mt-0.5">
                                            {formatRupiah(subdetail.nilai_kontrak || 0)}
                                        </dd>
                                    </div>
                                </dl>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 2: GALERI FOTO FISIK */}
                {activeTab === 'foto' && (
                    <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-neutral-900">
                                    Galeri Foto Fisik Aset
                                </h3>
                                <p className="text-[11px] text-neutral-500">
                                    Dokumentasi visual kondisi aset di lapangan
                                </p>
                            </div>
                            {canUpdate && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDocData('jenis', 'foto');
                                        setDocData('nama_dokumen', `Foto Fisik ${aset.nama}`);
                                        setUploadDocModalOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                                >
                                    <UploadCloud className="w-4 h-4" />
                                    Unggah Foto Baru
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-2">
                            {/* Primary photo if available */}
                            {aset.foto_path && (
                                <div
                                    onClick={() => setLightboxImage(`/storage/${aset.foto_path}`)}
                                    className="group relative aspect-4/3 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 cursor-pointer shadow-2xs hover:shadow-md transition-all"
                                >
                                    <img
                                        src={`/storage/${aset.foto_path}`}
                                        alt={aset.nama}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                                        Foto Utama
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                        <ZoomIn className="w-6 h-6" />
                                    </div>
                                </div>
                            )}

                            {/* Additional uploaded photos */}
                            {fotoDocs.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="group relative aspect-4/3 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-2xs hover:shadow-md transition-all"
                                >
                                    <img
                                        src={`/storage/${doc.file_path}`}
                                        alt={doc.nama_dokumen}
                                        onClick={() => setLightboxImage(`/storage/${doc.file_path}`)}
                                        className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white text-[10px] font-medium truncate">
                                        {doc.nama_dokumen}
                                    </div>
                                    {canUpdate && (
                                        <button
                                            type="button"
                                            onClick={() => setDeletingDoc(doc)}
                                            className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-xs hover:bg-rose-700"
                                            title="Hapus Foto"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            ))}

                            {!aset.foto_path && fotoDocs.length === 0 && (
                                <div className="col-span-full py-12 text-center text-neutral-400 space-y-2">
                                    <ImageIcon className="w-10 h-10 mx-auto stroke-1" />
                                    <p className="text-xs">Belum ada foto dokumentasi aset.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 3: DOKUMEN LEGALITAS (SECURE PRIVATE STORAGE) */}
                {activeTab === 'dokumen' && (
                    <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-neutral-900">
                                    Dokumen Legalitas & Surat Kepemilikan
                                </h3>
                                <p className="text-[11px] text-neutral-500">
                                    Arsip digital surat hukum, BPKB, sertifikat, dan faktur (Tersimpan aman & terproteksi hak akses)
                                </p>
                            </div>
                            {canUpdate && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDocData('jenis', 'sertifikat');
                                        setDocData('nama_dokumen', '');
                                        setDocData('nomor_dokumen', '');
                                        setUploadDocModalOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                                >
                                    <UploadCloud className="w-4 h-4" />
                                    Unggah Dokumen Legal
                                </button>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 font-semibold uppercase tracking-wider text-[11px]">
                                        <th className="px-4 py-3">Jenis Dokumen</th>
                                        <th className="px-4 py-3">Nama Berkas</th>
                                        <th className="px-4 py-3">Nomor Surat/Dokumen</th>
                                        <th className="px-4 py-3">Ukuran / Format</th>
                                        <th className="px-4 py-3">Pengunggah</th>
                                        <th className="px-4 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {legalDocs.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-12 text-center text-neutral-400">
                                                Belum ada dokumen legalitas yang diunggah untuk aset ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        legalDocs.map((doc) => (
                                            <tr key={doc.id} className="hover:bg-neutral-50/70 transition-colors">
                                                <td className="px-4 py-3">
                                                    <span className="font-bold text-[11px] uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                                        {doc.jenis}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-neutral-900">
                                                    {doc.nama_dokumen}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-neutral-700">
                                                    {doc.nomor_dokumen || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-neutral-500 font-mono text-[11px]">
                                                    {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-neutral-600">
                                                    {doc.uploader?.name || 'Sistem'}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <a
                                                            href={`/aset/${aset.id}/dokumen/${doc.id}/download`}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors"
                                                            title="Unduh Berkas Aman"
                                                        >
                                                            <Download className="w-3.5 h-3.5" />
                                                            Unduh
                                                        </a>
                                                        {canUpdate && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setDeletingDoc(doc)}
                                                                className="p-1 hover:bg-rose-50 rounded-lg text-neutral-400 hover:text-rose-600 transition-colors"
                                                                title="Hapus Dokumen"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 4: RIWAYAT TRANSAKSI (MUTASI & PEMELIHARAAN) */}
                {activeTab === 'transaksi' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        {/* Riwayat Mutasi */}
                        <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
                            <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-2">
                                <History className="w-4 h-4 text-blue-600" />
                                Riwayat Mutasi Penempatan & Tanggung Jawab
                            </h3>

                            {(!aset.mutasi || aset.mutasi.length === 0) ? (
                                <p className="text-xs text-neutral-400 text-center py-6">Belum ada riwayat mutasi.</p>
                            ) : (
                                <div className="space-y-3">
                                    {aset.mutasi.map((m) => (
                                        <div key={m.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60 text-xs space-y-1">
                                            <div className="flex items-center justify-between font-bold text-neutral-900">
                                                <span>No. BAST: {m.nomor_bast || '-'}</span>
                                                <span className="text-[11px] text-neutral-400">{formatDate(m.tanggal)}</span>
                                            </div>
                                            <p className="text-neutral-600">
                                                Ruangan: {m.dari_ruangan?.nama || 'Awal'} &rarr; <span className="font-semibold text-emerald-700">{m.ke_ruangan?.nama || '-'}</span>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Riwayat Pemeliharaan */}
                        <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
                            <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-2">
                                <Wrench className="w-4 h-4 text-amber-600" />
                                Riwayat Pemeliharaan & Perbaikan
                            </h3>

                            {(!aset.pemeliharaan || aset.pemeliharaan.length === 0) ? (
                                <p className="text-xs text-neutral-400 text-center py-6">Belum ada catatan servis/pemeliharaan.</p>
                            ) : (
                                <div className="space-y-3">
                                    {aset.pemeliharaan.map((p) => (
                                        <div key={p.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60 text-xs space-y-1">
                                            <div className="flex items-center justify-between font-bold text-neutral-900">
                                                <span>{p.uraian}</span>
                                                <span className="text-emerald-700 font-mono">{formatRupiah(p.biaya || 0)}</span>
                                            </div>
                                            <p className="text-neutral-500 text-[11px]">{formatDate(p.tanggal)} &bull; Vendor: {p.pelaksana || '-'}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 5: AUDIT TRAIL LOG */}
                {activeTab === 'audit' && (
                    <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
                        <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-emerald-600" />
                            Audit Trail Log Aktivitas Aset
                        </h3>

                        {(!aset.riwayat || aset.riwayat.length === 0) ? (
                            <p className="text-xs text-neutral-400 text-center py-6">Belum ada riwayat aktivitas yang tercatat.</p>
                        ) : (
                            <div className="relative pl-6 space-y-4 border-l-2 border-emerald-100">
                                {aset.riwayat.map((log) => (
                                    <div key={log.id} className="relative space-y-1 text-xs">
                                        <div className="absolute -left-[31px] top-0 w-3 h-3 rounded-full bg-emerald-600 border-2 border-white" />
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-neutral-900">{log.keterangan}</span>
                                            <span className="text-[10px] text-neutral-400 font-mono">{formatDate(log.created_at)}</span>
                                        </div>
                                        <p className="text-neutral-500 text-[11px]">
                                            Oleh: <span className="font-medium text-neutral-700">{log.user?.name || 'Sistem'}</span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Upload Dokumen Legalitas */}
            <Modal show={uploadDocModalOpen} onClose={() => setUploadDocModalOpen(false)} maxWidth="md">
                <form onSubmit={handleUploadDoc} className="p-6 space-y-4 text-xs">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                        <div className="flex items-center gap-2">
                            <UploadCloud className="w-5 h-5 text-emerald-600" />
                            <h3 className="text-base font-bold text-neutral-900">
                                Unggah Dokumen Legalitas Aset
                            </h3>
                        </div>
                    </div>

                    <div className="space-y-3.5">
                        <div>
                            <label className="font-semibold text-neutral-700 block mb-1">
                                Jenis Dokumen <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={docData.jenis}
                                onChange={(e) => setDocData('jenis', e.target.value)}
                                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                            >
                                <option value="sertifikat">Sertifikat Tanah</option>
                                <option value="bpkb">BPKB Kendaraan</option>
                                <option value="stnk">STNK</option>
                                <option value="bast">Berita Acara Serah Terima (BAST)</option>
                                <option value="faktur">Faktur / Kwitansi Pembelian</option>
                                <option value="kontrak">Surat Perjanjian / Kontrak</option>
                                <option value="foto">Foto Fisik</option>
                                <option value="lainnya">Dokumen Legalitas Lainnya</option>
                            </select>
                            {docErrors.jenis && <p className="text-rose-500 mt-1">{docErrors.jenis}</p>}
                        </div>

                        <div>
                            <label className="font-semibold text-neutral-700 block mb-1">
                                Nama Dokumen / Judul Berkas <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={docData.nama_dokumen}
                                onChange={(e) => setDocData('nama_dokumen', e.target.value)}
                                placeholder="cth: Sertifikat Hak Pakai No. 12 Tahun 2020"
                                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                            />
                            {docErrors.nama_dokumen && <p className="text-rose-500 mt-1">{docErrors.nama_dokumen}</p>}
                        </div>

                        <div>
                            <label className="font-semibold text-neutral-700 block mb-1">
                                Nomor Surat / Dokumen
                            </label>
                            <input
                                type="text"
                                value={docData.nomor_dokumen}
                                onChange={(e) => setDocData('nomor_dokumen', e.target.value)}
                                placeholder="cth: BPKB-N0918231"
                                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 font-mono"
                            />
                        </div>

                        <div>
                            <label className="font-semibold text-neutral-700 block mb-1">
                                Pilih Berkas File (PDF, JPG, PNG &bull; Maks 5MB) <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => setDocData('file', e.target.files[0])}
                                className="w-full text-xs text-neutral-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                            />
                            {docErrors.file && <p className="text-rose-500 mt-1">{docErrors.file}</p>}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100">
                        <button
                            type="button"
                            onClick={() => setUploadDocModalOpen(false)}
                            className="px-4 py-2 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 rounded-xl text-xs font-semibold"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={docProcessing}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
                        >
                            {docProcessing ? 'Mengunggah...' : 'Unggah Dokumen'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Zoom Foto (Lightbox) */}
            {lightboxImage && (
                <div
                    onClick={() => setLightboxImage(null)}
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
                >
                    <div className="relative max-w-4xl max-h-[90vh]">
                        <button
                            onClick={() => setLightboxImage(null)}
                            className="absolute -top-10 right-0 text-white hover:text-neutral-300"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <img
                            src={lightboxImage}
                            alt="Zoom"
                            className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
                        />
                    </div>
                </div>
            )}

            {/* Confirm Modal Hapus Dokumen */}
            {deletingDoc && (
                <ConfirmModal
                    isOpen={Boolean(deletingDoc)}
                    onClose={() => setDeletingDoc(null)}
                    onConfirm={handleDeleteDocConfirm}
                    title="Hapus Dokumen Aset"
                    message={`Apakah Anda yakin ingin menghapus berkas '${deletingDoc.nama_dokumen}'? Berkas fisik akan dihapus dari server.`}
                    confirmText="Hapus Dokumen"
                    variant="danger"
                />
            )}
        </AuthenticatedLayout>
    );
}
