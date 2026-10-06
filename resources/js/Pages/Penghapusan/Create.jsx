import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import KondisiBadge from '@/Components/KondisiBadge';
import { 
    ArrowLeft, 
    Trash2, 
    Search, 
    Plus, 
    X, 
    Calendar, 
    AlertCircle, 
    CheckCircle2,
    ShieldAlert
} from 'lucide-react';
import { formatRupiah } from '@/Utils/formatRupiah';
import { toast } from 'sonner';

export default function PenghapusanCreate({ kandidatAsets }) {
    const [searchAset, setSearchAset] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        tanggal: new Date().toISOString().split('T')[0],
        alasan_umum: '',
        items: [],
    });

    const filteredKandidat = kandidatAsets.filter((a) => {
        const q = searchAset.toLowerCase();
        return (
            a.nama.toLowerCase().includes(q) ||
            a.kode_barang.toLowerCase().includes(q) ||
            a.nomor_register.includes(q)
        );
    });

    const handleAddItem = (aset) => {
        if (data.items.some((i) => i.aset_id === aset.id)) return;

        setData('items', [
            ...data.items,
            {
                aset_id: aset.id,
                aset_nama: aset.nama,
                kode_barang: aset.kode_barang,
                nomor_register: aset.nomor_register,
                kondisi: aset.kondisi?.value || aset.kondisi,
                nilai_perolehan: aset.nilai_perolehan,
                alasan: (aset.kondisi?.value || aset.kondisi) === 'rusak_berat' ? 'rusak_berat' : 'usang',
                keterangan: '',
            },
        ]);
    };

    const handleRemoveItem = (asetId) => {
        setData('items', data.items.filter((i) => i.aset_id !== asetId));
    };

    const handleItemChange = (asetId, field, val) => {
        setData('items', data.items.map((i) => {
            if (i.aset_id === asetId) {
                return { ...i, [field]: val };
            }
            return i;
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (data.items.length === 0) {
            toast.error('Pilih minimal satu aset untuk diusulkan penghapusan.');
            return;
        }

        post(route('penghapusan.store'), {
            onSuccess: () => {
                toast.success('Draft usulan penghapusan berhasil dibuat.');
            },
            onError: (err) => {
                const msg = Object.values(err)[0] || 'Gagal menyimpan usulan.';
                toast.error(msg);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Buat Usulan Penghapusan - SIMUKTI" />

            <div className="space-y-6 max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('penghapusan.index')}
                            className="p-2.5 bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 rounded-xl transition-colors shadow-sm"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-neutral-900">Buat Draft Usulan Penghapusan</h1>
                            <p className="text-sm text-neutral-500">
                                Pilih aset yang memenuhi syarat (Rusak Berat / Hilang / Usang) untuk diajukan ke pimpinan.
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* Kolom Kiri: Form Usulan & Aset Terpilih (7 Kolom) */}
                        <div className="lg:col-span-7 space-y-6">
                            
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100 space-y-4">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-red-600" />
                                    <span>1. Informasi Usulan</span>
                                </h2>

                                <div>
                                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                                        Tanggal Usulan <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={data.tanggal}
                                        onChange={(e) => setData('tanggal', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500"
                                        required
                                    />
                                    {errors.tanggal && <p className="text-red-500 text-xs mt-1">{errors.tanggal}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                                        Alasan Umum Usulan Penghapusan <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Jelaskan dasar pertimbangan penghapusan, misal: Barang telah mengalami kerusakan total dan biaya reparasi melebihi nilai ekonomis..."
                                        value={data.alasan_umum}
                                        onChange={(e) => setData('alasan_umum', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500"
                                        required
                                    />
                                    {errors.alasan_umum && <p className="text-red-500 text-xs mt-1">{errors.alasan_umum}</p>}
                                </div>
                            </div>

                            {/* Daftar Aset Terpilih */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-2">
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                        <span>2. Aset yang Diusulkan ({data.items.length} Aset)</span>
                                    </h2>
                                </div>

                                {errors.items && (
                                    <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>{errors.items}</span>
                                    </div>
                                )}

                                {data.items.length > 0 ? (
                                    <div className="space-y-3">
                                        {data.items.map((item, idx) => (
                                            <div
                                                key={item.aset_id}
                                                className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2.5"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <div className="font-semibold text-sm text-neutral-900">
                                                            {item.aset_nama}
                                                        </div>
                                                        <div className="text-xs text-neutral-400 mt-0.5">
                                                            {item.kode_barang} • Reg: {item.nomor_register}
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItem(item.aset_id)}
                                                        className="p-1 text-red-500 hover:text-red-700 rounded"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                                    <div>
                                                        <label className="block text-neutral-500 mb-0.5">Alasan Per Item:</label>
                                                        <select
                                                            value={item.alasan}
                                                            onChange={(e) => handleItemChange(item.aset_id, 'alasan', e.target.value)}
                                                            className="w-full px-2 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs"
                                                        >
                                                            <option value="rusak_berat">Rusak Berat</option>
                                                            <option value="hilang">Hilang</option>
                                                            <option value="usang">Usang / Tidak Ekonomis</option>
                                                            <option value="lainnya">Lainnya</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-neutral-500 mb-0.5">Keterangan Spesifik:</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Catatan kondisi teknis..."
                                                            value={item.keterangan}
                                                            onChange={(e) => handleItemChange(item.aset_id, 'keterangan', e.target.value)}
                                                            className="w-full px-2 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-xs text-neutral-400 border-2 border-dashed border-neutral-200 rounded-xl">
                                        Pilih aset kandidat dari panel sebelah kanan untuk ditambahkan ke usulan ini.
                                    </div>
                                )}

                                <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100">
                                    <Link
                                        href={route('penghapusan.index')}
                                        className="px-4 py-2.5 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-xl"
                                    >
                                        Batal
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing || data.items.length === 0}
                                        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
                                    >
                                        {processing ? 'Menyimpan...' : 'Simpan Draft Usulan'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Kolom Kanan: Picker Kandidat Aset (5 Kolom) */}
                        <div className="lg:col-span-5 space-y-4">
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100 space-y-3">
                                <div>
                                    <h3 className="text-sm font-bold text-neutral-900">Kandidat Aset Rusak / Usang</h3>
                                    <p className="text-xs text-neutral-500">
                                        Menampilkan aset aktif di kecamatan (prioritas kondisi Rusak Berat).
                                    </p>
                                </div>

                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari aset..."
                                        value={searchAset}
                                        onChange={(e) => setSearchAset(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white"
                                    />
                                </div>

                                <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                                    {filteredKandidat.length > 0 ? (
                                        filteredKandidat.map((aset) => {
                                            const isSelected = data.items.some((i) => i.aset_id === aset.id);
                                            return (
                                                <div
                                                    key={aset.id}
                                                    className={`p-3 rounded-xl border transition-all text-xs flex items-center justify-between gap-2 ${
                                                        isSelected
                                                            ? 'bg-neutral-100 border-neutral-300 opacity-60'
                                                            : 'bg-white border-neutral-200 hover:border-red-300'
                                                    }`}
                                                >
                                                    <div className="min-w-0">
                                                        <div className="font-semibold text-neutral-900 truncate">
                                                            {aset.nama}
                                                        </div>
                                                        <div className="text-neutral-400 mt-0.5">
                                                            {aset.kode_barang} • Reg: {aset.nomor_register}
                                                        </div>
                                                        <div className="mt-1 flex items-center gap-2">
                                                            <KondisiBadge kondisi={aset.kondisi?.value || aset.kondisi} />
                                                            {aset.nilai_perolehan && (
                                                                <span className="text-[11px] text-neutral-500">
                                                                    {formatRupiah(aset.nilai_perolehan)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        disabled={isSelected}
                                                        onClick={() => handleAddItem(aset)}
                                                        className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 ${
                                                            isSelected
                                                                ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                                                                : 'bg-red-50 text-red-700 hover:bg-red-100'
                                                        }`}
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                        <span>{isSelected ? 'Terpilih' : 'Tambah'}</span>
                                                    </button>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="p-6 text-center text-xs text-neutral-400">
                                            Tidak ada aset yang cocok.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
