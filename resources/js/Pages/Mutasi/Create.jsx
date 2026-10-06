import React, { useState, useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    ArrowLeft, 
    ArrowRight, 
    Check, 
    Search, 
    Trash2, 
    Building2, 
    User as UserIcon, 
    Calendar, 
    FileText, 
    AlertCircle,
    ArrowLeftRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function MutasiCreate({ asets, ruangans, pegawais, preselectedAsetIds = [] }) {
    const [searchAset, setSearchAset] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        aset_ids: preselectedAsetIds,
        jenis: 'pindah_ruangan',
        ke_ruangan_id: '',
        ke_pegawai_id: '',
        tanggal: new Date().toISOString().split('T')[0],
        alasan: '',
    });

    // Filter aset yang bisa dipilih
    const filteredAsets = useMemo(() => {
        if (!searchAset.trim()) return asets.slice(0, 30);
        const q = searchAset.toLowerCase();
        return asets.filter((a) =>
            a.nama.toLowerCase().includes(q) ||
            a.kode_barang.toLowerCase().includes(q) ||
            a.nomor_register.includes(q)
        ).slice(0, 30);
    }, [asets, searchAset]);

    // Daftar aset yang sedang dipilih
    const selectedAsetObjects = useMemo(() => {
        return asets.filter((a) => data.aset_ids.includes(a.id));
    }, [asets, data.aset_ids]);

    const toggleSelectAset = (id) => {
        if (data.aset_ids.includes(id)) {
            setData('aset_ids', data.aset_ids.filter((item) => item !== id));
        } else {
            setData('aset_ids', [...data.aset_ids, id]);
        }
    };

    const removeSelectedAset = (id) => {
        setData('aset_ids', data.aset_ids.filter((item) => item !== id));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (data.aset_ids.length === 0) {
            toast.error('Pilih minimal satu aset yang akan dimutasi.');
            return;
        }

        post(route('mutasi.store'), {
            onSuccess: () => {
                toast.success('Transaksi mutasi dan BAST berhasil diterbitkan.');
            },
            onError: (err) => {
                const msg = Object.values(err)[0] || 'Terjadi kesalahan saat memproses mutasi.';
                toast.error(msg);
            },
        });
    };

    const selectedRuanganObj = useMemo(() => {
        return ruangans.find((r) => r.id === parseInt(data.ke_ruangan_id, 10));
    }, [ruangans, data.ke_ruangan_id]);

    const selectedPegawaiObj = useMemo(() => {
        return pegawais.find((p) => p.id === parseInt(data.ke_pegawai_id, 10));
    }, [pegawais, data.ke_pegawai_id]);

    return (
        <AuthenticatedLayout>
            <Head title="Proses Mutasi Aset - SIMUKTI" />

            <div className="space-y-6 max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('mutasi.index')}
                            className="p-2.5 bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 rounded-xl transition-colors shadow-sm"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-neutral-900">Formulir Mutasi & BAST Internal</h1>
                            <p className="text-sm text-neutral-500">
                                Pilih satu atau lebih aset untuk dialihkan ke ruangan atau penanggung jawab baru.
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* Kolom Kiri: Pemilihan Aset (7 Kolom) */}
                        <div className="lg:col-span-7 space-y-6">
                            
                            {/* Card Pencarian & Pemilihan Aset */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-2">
                                        <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
                                        <span>1. Pilih Aset yang Dimutasi ({data.aset_ids.length} Dipilih)</span>
                                    </h2>
                                </div>

                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
                                    <input
                                        type="text"
                                        placeholder="Ketik nama, kode barang, atau nomor register..."
                                        value={searchAset}
                                        onChange={(e) => setSearchAset(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-colors"
                                    />
                                </div>

                                {errors.aset_ids && (
                                    <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>{errors.aset_ids}</span>
                                    </div>
                                )}

                                {/* List Aset Pilihan */}
                                <div className="max-h-80 overflow-y-auto space-y-2 pr-1 border border-neutral-100 p-2 rounded-xl">
                                    {filteredAsets.length > 0 ? (
                                        filteredAsets.map((aset) => {
                                            const isSelected = data.aset_ids.includes(aset.id);
                                            return (
                                                <div
                                                    key={aset.id}
                                                    onClick={() => toggleSelectAset(aset.id)}
                                                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                                                        isSelected
                                                            ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400'
                                                            : 'bg-white border-neutral-200 hover:border-neutral-300'
                                                    }`}
                                                >
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-sm text-neutral-900 truncate">
                                                                {aset.nama}
                                                            </span>
                                                            <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded">
                                                                Reg: {aset.nomor_register}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-neutral-500 mt-1 flex items-center gap-2 flex-wrap">
                                                            <span>{aset.kode_barang}</span>
                                                            <span>•</span>
                                                            <span>Ruang: {aset.ruangan?.nama || '-'}</span>
                                                            {aset.pemegang && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>PJ: {aset.pemegang.nama}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border ${
                                                        isSelected
                                                            ? 'bg-emerald-600 border-emerald-600 text-white'
                                                            : 'border-neutral-300'
                                                    }`}>
                                                        {isSelected && <Check className="w-3.5 h-3.5" />}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="p-6 text-center text-xs text-neutral-400">
                                            Tidak ditemukan aset aktif dengan kata kunci tersebut.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Daftar Aset Terpilih (Chips) */}
                            {selectedAsetObjects.length > 0 && (
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100 space-y-3">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                                        Rincian Aset yang Akan Dimutasi ({selectedAsetObjects.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {selectedAsetObjects.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl text-xs"
                                            >
                                                <div>
                                                    <span className="font-medium text-neutral-800">{item.nama}</span>
                                                    <span className="text-neutral-400 ml-1.5">({item.kode_barang} - {item.nomor_register})</span>
                                                    <div className="text-neutral-500 text-[11px] mt-0.5">
                                                        Lokasi asal: {item.ruangan?.nama || 'Tanpa Ruangan'}
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeSelectedAset(item.id)}
                                                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Kolom Kanan: Parameter Tujuan & Preview (5 Kolom) */}
                        <div className="lg:col-span-5 space-y-6">
                            
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100 space-y-4">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-emerald-600" />
                                    <span>2. Tujuan & Serah Terima</span>
                                </h2>

                                {/* Jenis Mutasi */}
                                <div>
                                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                                        Jenis Mutasi <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.jenis}
                                        onChange={(e) => setData('jenis', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="pindah_ruangan">Pindah Ruangan</option>
                                        <option value="ganti_pemegang">Ganti Pemegang / Penanggung Jawab</option>
                                        <option value="penempatan_awal">Penempatan Awal</option>
                                        <option value="pengembalian">Pengembalian ke Gudang / Pengurus</option>
                                    </select>
                                    {errors.jenis && <p className="text-red-500 text-xs mt-1">{errors.jenis}</p>}
                                </div>

                                {/* Ruangan Tujuan */}
                                <div>
                                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                                        Ruangan Tujuan Baru
                                    </label>
                                    <select
                                        value={data.ke_ruangan_id}
                                        onChange={(e) => setData('ke_ruangan_id', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="">-- Tetap / Pilih Ruangan Tujuan --</option>
                                        {ruangans.map((r) => (
                                            <option key={r.id} value={r.id}>{r.nama} ({r.kode})</option>
                                        ))}
                                    </select>
                                    {errors.ke_ruangan_id && <p className="text-red-500 text-xs mt-1">{errors.ke_ruangan_id}</p>}
                                </div>

                                {/* Pemegang Baru */}
                                <div>
                                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                                        Pegawai Penerima (Pihak Kedua)
                                    </label>
                                    <select
                                        value={data.ke_pegawai_id}
                                        onChange={(e) => setData('ke_pegawai_id', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="">-- Tanpa Pemegang Khusus / Pilih Pegawai --</option>
                                        {pegawais.map((p) => (
                                            <option key={p.id} value={p.id}>{p.nama} - {p.jabatan}</option>
                                        ))}
                                    </select>
                                    {errors.ke_pegawai_id && <p className="text-red-500 text-xs mt-1">{errors.ke_pegawai_id}</p>}
                                </div>

                                {/* Tanggal Mutasi */}
                                <div>
                                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                                        Tanggal Mutasi & BAST <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={data.tanggal}
                                        onChange={(e) => setData('tanggal', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                                    />
                                    {errors.tanggal && <p className="text-red-500 text-xs mt-1">{errors.tanggal}</p>}
                                </div>

                                {/* Alasan / Keterangan */}
                                <div>
                                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                                        Alasan Mutasi / Catatan BAST
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Contoh: Penataan ulang ruang kerja Subbag Umum..."
                                        value={data.alasan}
                                        onChange={(e) => setData('alasan', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                                    />
                                    {errors.alasan && <p className="text-red-500 text-xs mt-1">{errors.alasan}</p>}
                                </div>

                                {/* Summary Box */}
                                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs">
                                    <div className="font-semibold text-emerald-900 flex items-center gap-1.5">
                                        <FileText className="w-4 h-4 text-emerald-700" />
                                        <span>Ringkasan Pengalihan</span>
                                    </div>
                                    <div className="text-emerald-800">
                                        Aset Terpilih: <strong>{data.aset_ids.length} Unit</strong>
                                    </div>
                                    {selectedRuanganObj && (
                                        <div className="text-emerald-800">
                                            Ruangan Tujuan: <strong>{selectedRuanganObj.nama}</strong>
                                        </div>
                                    )}
                                    {selectedPegawaiObj && (
                                        <div className="text-emerald-800">
                                            Penerima: <strong>{selectedPegawaiObj.nama}</strong>
                                        </div>
                                    )}
                                    <div className="text-[11px] text-emerald-600 mt-1 italic">
                                        Nomor BAST akan di-generate otomatis secara atomik saat data disimpan.
                                    </div>
                                </div>

                                <div className="pt-2 flex items-center gap-3">
                                    <Link
                                        href={route('mutasi.index')}
                                        className="flex-1 px-4 py-2.5 text-center text-sm font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
                                    >
                                        Batal
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing || data.aset_ids.length === 0}
                                        className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
                                    >
                                        {processing ? 'Memproses...' : 'Proses & Terbitkan BAST'}
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
