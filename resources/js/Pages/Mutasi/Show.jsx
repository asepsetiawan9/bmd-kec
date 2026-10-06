import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    ArrowLeft, 
    Printer, 
    FileText, 
    Calendar, 
    Building2, 
    User as UserIcon,
    ArrowLeftRight,
    CheckCircle2
} from 'lucide-react';
import { formatDate } from '@/Utils/formatDate';

export default function MutasiShow({ nomorBast, items, info }) {
    return (
        <AuthenticatedLayout>
            <Head title={`BAST ${nomorBast} - SIMUKTI`} />

            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('mutasi.index')}
                            className="p-2.5 bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 rounded-xl transition-colors shadow-sm"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-semibold">
                                    BAST RESMI
                                </span>
                                <h1 className="text-xl font-bold text-neutral-900">{nomorBast}</h1>
                            </div>
                            <p className="text-sm text-neutral-500 mt-0.5">
                                Diterbitkan pada tanggal {formatDate(info.tanggal)}
                            </p>
                        </div>
                    </div>

                    <a
                        href={route('mutasi.print-bast', encodeURIComponent(nomorBast))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
                    >
                        <Printer className="w-4 h-4" />
                        <span>Cetak BAST (PDF)</span>
                    </a>
                </div>

                {/* Ringkasan Pihak */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                            Pihak Pertama (Menyerahkan)
                        </span>
                        <div className="mt-3 flex items-start gap-3">
                            <div className="p-2.5 bg-neutral-100 rounded-xl text-neutral-600">
                                <UserIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-semibold text-neutral-900">
                                    {info.dari_pegawai?.nama || 'Pengurus Barang'}
                                </div>
                                <div className="text-xs text-neutral-500 mt-0.5">
                                    NIP: {info.dari_pegawai?.nip || '-'}
                                </div>
                                <div className="text-xs text-neutral-600 mt-1 flex items-center gap-1">
                                    <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                                    <span>Ruangan Asal: {info.dari_ruangan?.nama || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                            Pihak Kedua (Menerima)
                        </span>
                        <div className="mt-3 flex items-start gap-3">
                            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-semibold text-neutral-900">
                                    {info.ke_pegawai?.nama || (info.ke_ruangan?.nama ? 'Penanggung Jawab ' + info.ke_ruangan.nama : '-')}
                                </div>
                                <div className="text-xs text-neutral-500 mt-0.5">
                                    NIP: {info.ke_pegawai?.nip || '-'}
                                </div>
                                <div className="text-xs text-emerald-700 font-medium mt-1 flex items-center gap-1">
                                    <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Ruangan Tujuan: {info.ke_ruangan?.nama || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {info.alasan && (
                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-sm">
                        <span className="font-semibold text-neutral-700">Catatan / Alasan Mutasi:</span>{' '}
                        <span className="text-neutral-600">{info.alasan}</span>
                    </div>
                )}

                {/* Tabel Aset */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                    <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                        <h2 className="font-bold text-neutral-900 text-sm uppercase tracking-wider">
                            Daftar Barang Milik Daerah yang Dimutasi ({items.length} Unit)
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-50 text-xs text-neutral-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 py-3 text-center w-12">No</th>
                                    <th className="px-5 py-3">Nama Barang / Spesifikasi</th>
                                    <th className="px-5 py-3">Kode Barang</th>
                                    <th className="px-5 py-3 text-center">Register</th>
                                    <th className="px-5 py-3 text-center">Kondisi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {items.map((item, idx) => (
                                    <tr key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                                        <td className="px-5 py-3.5 text-center text-neutral-400 font-medium">
                                            {idx + 1}
                                        </td>
                                        <td className="px-5 py-3.5 font-medium text-neutral-900">
                                            <Link
                                                href={route('aset.show', item.aset_id)}
                                                className="text-emerald-700 hover:underline"
                                            >
                                                {item.aset?.nama}
                                            </Link>
                                            {item.aset?.merk_type && (
                                                <div className="text-xs text-neutral-400">
                                                    Merk: {item.aset.merk_type}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 text-neutral-600 font-mono text-xs">
                                            {item.aset?.kode_barang}
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded text-xs font-mono">
                                                {item.aset?.nomor_register}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                {item.aset?.kondisi?.label || 'Baik'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
