import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import KodeBarangSearchSelect from '@/Components/KodeBarangSearchSelect';
import GolonganBadge from '@/Components/GolonganBadge';
import {
    ArrowLeft,
    Save,
    UploadCloud,
    Package,
    Building2,
    Calendar,
    DollarSign,
    Layers,
    FileText,
    Image as ImageIcon,
    AlertCircle,
    Info,
    Check,
    Wrench,
    MapPin,
    Truck,
    HardHat,
} from 'lucide-react';

export default function Form({
    isEdit = false,
    aset = null,
    pegawaiList = [],
    ruanganList = [],
    golonganOptions = {},
}) {
    // Determine active subdetail object if in edit mode
    const subdetail = aset?.detailTanah ||
        aset?.detailPeralatan ||
        aset?.detailGedung ||
        aset?.detailJalan ||
        aset?.detailLainnya ||
        aset?.detailKdp || {};

    const initialGolongan = aset?.golongan?.value || aset?.golongan || 'B';

    const { data, setData, post, put, processing, errors, transform } = useForm({
        // Main Asset Fields
        kode_barang: aset?.kode_barang || '',
        nama: aset?.nama || '',
        golongan: initialGolongan,
        merk_type: aset?.merk_type || '',
        spesifikasi: aset?.spesifikasi || '',
        tanggal_perolehan: aset?.tanggal_perolehan ? aset.tanggal_perolehan.substring(0, 10) : new Date().toISOString().substring(0, 10),
        tahun_perolehan: aset?.tahun_perolehan || new Date().getFullYear(),
        cara_perolehan: aset?.cara_perolehan?.value || aset?.cara_perolehan || 'pembelian',
        sumber_dana: aset?.sumber_dana?.value || aset?.sumber_dana || 'apbd_kabupaten',
        nilai_perolehan: aset?.nilai_perolehan || '',
        satuan: aset?.satuan || 'Unit',
        kondisi: aset?.kondisi?.value || aset?.kondisi || 'baik',
        ruangan_id: aset?.ruangan_id || '',
        pemegang_id: aset?.pemegang_id || '',
        keterangan: aset?.keterangan || '',
        foto: null,

        // Golongan A: Tanah
        luas_m2: subdetail.luas_m2 || '',
        alamat: subdetail.alamat || '',
        status_hak: subdetail.status_hak || '',
        nomor_sertifikat: subdetail.nomor_sertifikat || '',
        tanggal_sertifikat: subdetail.tanggal_sertifikat ? subdetail.tanggal_sertifikat.substring(0, 10) : '',
        penggunaan: subdetail.penggunaan || '',

        // Golongan B: Peralatan & Mesin
        ukuran_cc: subdetail.ukuran_cc || '',
        bahan: subdetail.bahan || '',
        nomor_pabrik: subdetail.nomor_pabrik || '',
        nomor_rangka: subdetail.nomor_rangka || '',
        nomor_mesin: subdetail.nomor_mesin || '',
        nomor_polisi: subdetail.nomor_polisi || '',
        nomor_bpkb: subdetail.nomor_bpkb || '',
        tanggal_pajak: subdetail.tanggal_pajak ? subdetail.tanggal_pajak.substring(0, 10) : '',

        // Golongan C: Gedung & Bangunan
        kondisi_bangunan: subdetail.kondisi_bangunan || 'Permanen',
        bertingkat: Boolean(subdetail.bertingkat),
        beton: subdetail.beton !== undefined ? Boolean(subdetail.beton) : true,
        luas_lantai_m2: subdetail.luas_lantai_m2 || '',
        nomor_dokumen: subdetail.nomor_dokumen || '',
        tanggal_dokumen: subdetail.tanggal_dokumen ? subdetail.tanggal_dokumen.substring(0, 10) : '',
        luas_tanah_m2: subdetail.luas_tanah_m2 || '',
        status_tanah: subdetail.status_tanah || '',
        kode_tanah: subdetail.kode_tanah || '',

        // Golongan D: Jalan, Irigasi & Jaringan
        konstruksi: subdetail.konstruksi || '',
        panjang_m: subdetail.panjang_m || '',
        lebar_m: subdetail.lebar_m || '',

        // Golongan E: Aset Tetap Lainnya
        judul_pencipta: subdetail.judul_pencipta || '',
        spesifikasi_buku: subdetail.spesifikasi_buku || '',
        asal_daerah: subdetail.asal_daerah || '',
        pencipta: subdetail.pencipta || '',
        jenis_hewan_tumbuhan: subdetail.jenis_hewan_tumbuhan || '',
        ukuran: subdetail.ukuran || '',

        // Golongan F: KDP
        bangunan: subdetail.bangunan || '',
        tanggal_mulai: subdetail.tanggal_mulai ? subdetail.tanggal_mulai.substring(0, 10) : '',
        nilai_kontrak: subdetail.nilai_kontrak || '',
    });

    const [previewUrl, setPreviewUrl] = useState(
        aset?.foto_path ? `/storage/${aset.foto_path}` : null
    );

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('foto', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleGolonganChange = (g) => {
        setData('golongan', g);
    };

    const handleKodeBarangSelect = (item) => {
        if (item) {
            setData((prev) => ({
                ...prev,
                kode_barang: item.kode,
                nama: prev.nama ? prev.nama : item.uraian,
                golongan: item.golongan_kib ? item.golongan_kib : prev.golongan,
            }));
        } else {
            setData('kode_barang', '');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEdit) {
            transform((currentData) => ({
                ...currentData,
                _method: 'put',
            }));
            post(`/aset/${aset.id}`, {
                forceFormData: true,
                preserveScroll: true,
            });
        } else {
            post('/aset', {
                forceFormData: true,
                preserveScroll: true,
            });
        }
    };

    const golonganTabs = [
        { key: 'A', name: 'KIB A - Tanah', icon: MapPin },
        { key: 'B', name: 'KIB B - Peralatan & Mesin', icon: Truck },
        { key: 'C', name: 'KIB C - Gedung & Bangunan', icon: Building2 },
        { key: 'D', name: 'KIB D - Jalan & Jaringan', icon: Layers },
        { key: 'E', name: 'KIB E - Aset Tetap Lainnya', icon: Package },
        { key: 'F', name: 'KIB F - KDP (Konstruksi)', icon: HardHat },
    ];

    return (
        <AuthenticatedLayout title={isEdit ? `Edit Aset: ${aset?.nama}` : 'Pendaftaran Aset BMD Baru'}>
            <Head title={isEdit ? `Edit Aset - ${aset?.nama}` : 'Tambah Aset BMD Baru'} />

            <div className="max-w-5xl mx-auto space-y-6">
                {/* Back button */}
                <div className="flex items-center justify-between">
                    <Link
                        href={isEdit ? `/aset/${aset.id}` : '/aset'}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {isEdit ? 'Kembali ke Detail Aset' : 'Kembali ke Daftar Aset'}
                    </Link>

                    {isEdit && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-neutral-500 font-medium">Nomor Register:</span>
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                {aset.nomor_register}
                            </span>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Golongan KIB Selector Tabs */}
                    <div className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-xs space-y-2">
                        <label className="text-xs font-bold text-neutral-700 block uppercase tracking-wider">
                            Pilih Golongan KIB (Permendagri 108/2016) <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                            {golonganTabs.map((tab) => {
                                const active = data.golongan === tab.key;
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => handleGolonganChange(tab.key)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                                            active
                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-[1.02]'
                                                : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200/80'
                                        }`}
                                    >
                                        <Icon className={`w-5 h-5 mb-1 ${active ? 'text-white' : 'text-neutral-500'}`} />
                                        <span className="text-xs font-bold leading-tight">{tab.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Section 1: Informasi Induk & Kodefikasi */}
                    <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
                        <div className="flex items-center gap-2.5 border-b border-neutral-100 pb-3">
                            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                                <Package className="w-5 h-5" />
                            </span>
                            <div>
                                <h3 className="text-sm font-bold text-neutral-900">
                                    Identitas & Kodefikasi Barang Milik Daerah
                                </h3>
                                <p className="text-[11px] text-neutral-500">
                                    Pilih kodefikasi Permendagri 108 dan lengkapi nama spesifik barang
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Autocomplete Kode Barang */}
                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">
                                        Kodefikasi Barang Permendagri 108 <span className="text-rose-500">*</span>
                                    </label>
                                    <KodeBarangSearchSelect
                                        value={data.kode_barang}
                                        golongan={data.golongan}
                                        onSelect={handleKodeBarangSelect}
                                        error={errors.kode_barang}
                                    />
                                    {errors.kode_barang && <p className="text-rose-500 mt-1">{errors.kode_barang}</p>}
                                </div>

                                {/* Nama Barang */}
                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">
                                        Nama / Uraian Barang <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nama}
                                        onChange={(e) => setData('nama', e.target.value)}
                                        placeholder="cth: Laptop Lenovo ThinkPad E14 Gen 4"
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                    />
                                    {errors.nama && <p className="text-rose-500 mt-1">{errors.nama}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Ruangan */}
                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">
                                        Lokasi Ruangan Penempatan
                                    </label>
                                    <select
                                        value={data.ruangan_id}
                                        onChange={(e) => setData('ruangan_id', e.target.value)}
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                    >
                                        <option value="">-- Pilih Lokasi Ruangan --</option>
                                        {ruanganList.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {r.nama} ({r.kode})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.ruangan_id && <p className="text-rose-500 mt-1">{errors.ruangan_id}</p>}
                                </div>

                                {/* Penanggung Jawab Pegawai */}
                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">
                                        Pemegang / Penanggung Jawab
                                    </label>
                                    <select
                                        value={data.pemegang_id}
                                        onChange={(e) => setData('pemegang_id', e.target.value)}
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                    >
                                        <option value="">-- Pilih Pegawai Pemegang --</option>
                                        {pegawaiList.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.nama} ({p.jabatan})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.pemegang_id && <p className="text-rose-500 mt-1">{errors.pemegang_id}</p>}
                                </div>

                                {/* Kondisi Fisik */}
                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">
                                        Kondisi Fisik Barang <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.kondisi}
                                        onChange={(e) => setData('kondisi', e.target.value)}
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 font-medium"
                                    >
                                        <option value="baik">🟢 Baik (Siap Digunakan)</option>
                                        <option value="rusak_ringan">🟡 Rusak Ringan (Perlu Servis)</option>
                                        <option value="rusak_berat">🔴 Rusak Berat (Tidak Berfungsi)</option>
                                    </select>
                                    {errors.kondisi && <p className="text-rose-500 mt-1">{errors.kondisi}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Data Finansial & Perolehan */}
                    <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
                        <div className="flex items-center gap-2.5 border-b border-neutral-100 pb-3">
                            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                                <DollarSign className="w-5 h-5" />
                            </span>
                            <div>
                                <h3 className="text-sm font-bold text-neutral-900">
                                    Nilai Perolehan & Sumber Anggaran
                                </h3>
                                <p className="text-[11px] text-neutral-500">
                                    Catatan nilai rupiah, tahun pembukuan dan asal-usul perolehan BMD
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            {/* Nilai Perolehan (Rp) */}
                            <div>
                                <label className="font-semibold text-neutral-700 block mb-1">
                                    Nilai Perolehan (Rp) <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-neutral-400">Rp</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={data.nilai_perolehan}
                                        onChange={(e) => setData('nilai_perolehan', e.target.value)}
                                        placeholder="cth: 15000000"
                                        className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 font-mono font-bold"
                                    />
                                </div>
                                {errors.nilai_perolehan && <p className="text-rose-500 mt-1">{errors.nilai_perolehan}</p>}
                            </div>

                            {/* Tanggal Perolehan */}
                            <div>
                                <label className="font-semibold text-neutral-700 block mb-1">
                                    Tanggal Perolehan <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.tanggal_perolehan}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setData((prev) => ({
                                            ...prev,
                                            tanggal_perolehan: val,
                                            tahun_perolehan: val ? new Date(val).getFullYear() : prev.tahun_perolehan,
                                        }));
                                    }}
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                />
                                {errors.tanggal_perolehan && <p className="text-rose-500 mt-1">{errors.tanggal_perolehan}</p>}
                            </div>

                            {/* Tahun Perolehan */}
                            <div>
                                <label className="font-semibold text-neutral-700 block mb-1">
                                    Tahun Anggaran / Pembukuan <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1945"
                                    max={new Date().getFullYear() + 1}
                                    value={data.tahun_perolehan}
                                    onChange={(e) => setData('tahun_perolehan', e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 font-mono"
                                />
                                {errors.tahun_perolehan && <p className="text-rose-500 mt-1">{errors.tahun_perolehan}</p>}
                            </div>

                            {/* Cara Perolehan */}
                            <div>
                                <label className="font-semibold text-neutral-700 block mb-1">
                                    Cara Perolehan <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.cara_perolehan}
                                    onChange={(e) => setData('cara_perolehan', e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                >
                                    <option value="pembelian">Pembelian / Pengadaan</option>
                                    <option value="hibah">Hibah</option>
                                    <option value="bantuan_provinsi">Bantuan Provinsi</option>
                                    <option value="bantuan_kabupaten">Bantuan Kabupaten</option>
                                    <option value="swakelola">Swakelola</option>
                                    <option value="lainnya">Lainnya / Warisan</option>
                                </select>
                            </div>

                            {/* Sumber Dana */}
                            <div>
                                <label className="font-semibold text-neutral-700 block mb-1">
                                    Sumber Dana
                                </label>
                                <select
                                    value={data.sumber_dana}
                                    onChange={(e) => setData('sumber_dana', e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                >
                                    <option value="apbd_kabupaten">APBD Kabupaten</option>
                                    <option value="apbd_provinsi">APBD Provinsi</option>
                                    <option value="apbn">APBN</option>
                                    <option value="pad">Pendapatan Asli Daerah (PAD)</option>
                                    <option value="btt">Belanja Tidak Terduga (BTT)</option>
                                    <option value="lainnya">Sumber Lainnya</option>
                                </select>
                            </div>

                            {/* Satuan */}
                            <div>
                                <label className="font-semibold text-neutral-700 block mb-1">
                                    Satuan Ukuran
                                </label>
                                <input
                                    type="text"
                                    value={data.satuan}
                                    onChange={(e) => setData('satuan', e.target.value)}
                                    placeholder="cth: Unit, Buah, Bidang, m2"
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Spesifikasi Teknis Dinamis Sesuai Golongan KIB (A–F) */}
                    <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                            <div className="flex items-center gap-2.5">
                                <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
                                    <Wrench className="w-5 h-5" />
                                </span>
                                <div>
                                    <h3 className="text-sm font-bold text-neutral-900">
                                        Spesifikasi Teknis Khusus Golongan {data.golongan}
                                    </h3>
                                    <p className="text-[11px] text-neutral-500">
                                        Atribut teknis resmi yang disyaratkan dalam format KIB Permendagri 108
                                    </p>
                                </div>
                            </div>
                            <GolonganBadge golongan={data.golongan} full />
                        </div>

                        {/* ============ GOLONGAN A: TANAH ============ */}
                        {data.golongan === 'A' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">Luas Tanah (m²)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.luas_m2}
                                        onChange={(e) => setData('luas_m2', e.target.value)}
                                        placeholder="cth: 1500"
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">Status Hak Tanah</label>
                                    <input
                                        type="text"
                                        value={data.status_hak}
                                        onChange={(e) => setData('status_hak', e.target.value)}
                                        placeholder="cth: Hak Pakai / Hak Milik Pemda"
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">Peruntukan / Penggunaan</label>
                                    <input
                                        type="text"
                                        value={data.penggunaan}
                                        onChange={(e) => setData('penggunaan', e.target.value)}
                                        placeholder="cth: Kompleks Perkantoran Kecamatan"
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">Nomor Sertifikat</label>
                                    <input
                                        type="text"
                                        value={data.nomor_sertifikat}
                                        onChange={(e) => setData('nomor_sertifikat', e.target.value)}
                                        placeholder="cth: HP.0012/MKM/2018"
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">Tanggal Sertifikat</label>
                                    <input
                                        type="date"
                                        value={data.tanggal_sertifikat}
                                        onChange={(e) => setData('tanggal_sertifikat', e.target.value)}
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="font-semibold text-neutral-700 block mb-1">Letak / Alamat Tanah</label>
                                    <textarea
                                        value={data.alamat}
                                        onChange={(e) => setData('alamat', e.target.value)}
                                        placeholder="cth: Jl. Raya Mekarmukti No. 1, Desa Mekarmukti"
                                        rows={2}
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* ============ GOLONGAN B: PERALATAN & MESIN ============ */}
                        {data.golongan === 'B' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">Merk / Tipe Pabrikan</label>
                                    <input
                                        type="text"
                                        value={data.merk_type}
                                        onChange={(e) => setData('merk_type', e.target.value)}
                                        placeholder="cth: Honda Vario 125 CBS"
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">Ukuran / Kapasitas Silinder (CC)</label>
                                    <input
                                        type="text"
                                        value={data.ukuran_cc}
                                        onChange={(e) => setData('ukuran_cc', e.target.value)}
                                        placeholder="cth: 125 CC / 14 Inch"
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">Bahan Material</label>
                                    <input
                                        type="text"
                                        value={data.bahan}
                                        onChange={(e) => setData('bahan', e.target.value)}
                                        placeholder="cth: Logam / Aluminium / Plastik"
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">Nomor Polisi (Plat Merah)</label>
                                    <input
                                        type="text"
                                        value={data.nomor_polisi}
                                        onChange={(e) => setData('nomor_polisi', e.target.value)}
                                        placeholder="cth: Z 2145 D"
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 font-mono font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">Nomor Rangka</label>
                                    <input
                                        type="text"
                                        value={data.nomor_rangka}
                                        onChange={(e) => setData('nomor_rangka', e.target.value)}
                                        placeholder="cth: MH1JM21..."
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">Nomor Mesin</label>
                                    <input
                                        type="text"
                                        value={data.nomor_mesin}
                                        onChange={(e) => setData('nomor_mesin', e.target.value)}
                                        placeholder="cth: JM21E1..."
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">Nomor BPKB</label>
                                    <input
                                        type="text"
                                        value={data.nomor_bpkb}
                                        onChange={(e) => setData('nomor_bpkb', e.target.value)}
                                        placeholder="cth: N-0918231"
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">Nomor Seri Pabrik</label>
                                    <input
                                        type="text"
                                        value={data.nomor_pabrik}
                                        onChange={(e) => setData('nomor_pabrik', e.target.value)}
                                        placeholder="cth: SN-82910283"
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">Jatuh Tempo Pajak</label>
                                    <input
                                        type="date"
                                        value={data.tanggal_pajak}
                                        onChange={(e) => setData('tanggal_pajak', e.target.value)}
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* ============ GOLONGAN C: GEDUNG & BANGUNAN ============ */}
                        {data.golongan === 'C' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">Kondisi Bangunan</label>
                                    <select
                                        value={data.kondisi_bangunan}
                                        onChange={(e) => setData('kondisi_bangunan', e.target.value)}
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                    >
                                        <option value="Permanen">Permanen</option>
                                        <option value="Semi Permanen">Semi Permanen</option>
                                        <option value="Darurat">Darurat</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">Luas Lantai (m²)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.luas_lantai_m2}
                                        onChange={(e) => setData('luas_lantai_m2', e.target.value)}
                                        placeholder="cth: 350"
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">Nomor Dokumen / IMB</label>
                                    <input
                                        type="text"
                                        value={data.nomor_dokumen}
                                        onChange={(e) => setData('nomor_dokumen', e.target.value)}
                                        placeholder="cth: 640/IMB-KEC/2020"
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 font-mono"
                                    />
                                </div>
                                <div className="flex items-center gap-6 pt-2 md:col-span-3">
                                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-neutral-700">
                                        <input
                                            type="checkbox"
                                            checked={data.bertingkat}
                                            onChange={(e) => setData('bertingkat', e.target.checked)}
                                            className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        Bangunan Bertingkat
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-neutral-700">
                                        <input
                                            type="checkbox"
                                            checked={data.beton}
                                            onChange={(e) => setData('beton', e.target.checked)}
                                            className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        Konstruksi Beton
                                    </label>
                                </div>
                                <div className="md:col-span-3">
                                    <label className="font-semibold text-neutral-700 block mb-1">Letak / Lokasi Bangunan</label>
                                    <textarea
                                        value={data.alamat}
                                        onChange={(e) => setData('alamat', e.target.value)}
                                        placeholder="Alamat lengkap bangunan gedung..."
                                        rows={2}
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* ============ GOLONGAN D: JALAN, IRIGASI & JARINGAN ============ */}
                        {data.golongan === 'D' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">Konstruksi</label>
                                    <input
                                        type="text"
                                        value={data.konstruksi}
                                        onChange={(e) => setData('konstruksi', e.target.value)}
                                        placeholder="cth: Aspal Hotmix / Rabat Beton"
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">Panjang (m)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.panjang_m}
                                        onChange={(e) => setData('panjang_m', e.target.value)}
                                        placeholder="cth: 1200"
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">Lebar (m)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.lebar_m}
                                        onChange={(e) => setData('lebar_m', e.target.value)}
                                        placeholder="cth: 3.5"
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="font-semibold text-neutral-700 block mb-1">Lokasi / Ruas Jaringan</label>
                                    <textarea
                                        value={data.alamat}
                                        onChange={(e) => setData('alamat', e.target.value)}
                                        placeholder="Lokasi ruas jalan / irigasi..."
                                        rows={2}
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* ============ GOLONGAN E: ASET TETAP LAINNYA ============ */}
                        {data.golongan === 'E' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">Judul / Pencipta</label>
                                    <input
                                        type="text"
                                        value={data.judul_pencipta}
                                        onChange={(e) => setData('judul_pencipta', e.target.value)}
                                        placeholder="cth: Ensiklopedia Hukum Daerah"
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">Penerbit / Asal Daerah</label>
                                    <input
                                        type="text"
                                        value={data.asal_daerah}
                                        onChange={(e) => setData('asal_daerah', e.target.value)}
                                        placeholder="cth: Jawa Barat / Garut"
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">Jenis Hewan / Tumbuhan / Seni</label>
                                    <input
                                        type="text"
                                        value={data.jenis_hewan_tumbuhan}
                                        onChange={(e) => setData('jenis_hewan_tumbuhan', e.target.value)}
                                        placeholder="cth: Tanaman Hias Palem Merah"
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* ============ GOLONGAN F: KDP (KONSTRUKSI) ============ */}
                        {data.golongan === 'F' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">Rencana Bangunan</label>
                                    <input
                                        type="text"
                                        value={data.bangunan}
                                        onChange={(e) => setData('bangunan', e.target.value)}
                                        placeholder="cth: Pembangunan Aula Pertemuan"
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">Tanggal Mulai Pengerjaan</label>
                                    <input
                                        type="date"
                                        value={data.tanggal_mulai}
                                        onChange={(e) => setData('tanggal_mulai', e.target.value)}
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">Nilai Kontrak Proyek (Rp)</label>
                                    <input
                                        type="number"
                                        value={data.nilai_kontrak}
                                        onChange={(e) => setData('nilai_kontrak', e.target.value)}
                                        placeholder="cth: 250000000"
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 font-mono font-bold"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Section 4: Foto Fisik & Berkas Pendukung */}
                    <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
                        <div className="flex items-center gap-2.5 border-b border-neutral-100 pb-3">
                            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                                <ImageIcon className="w-5 h-5" />
                            </span>
                            <div>
                                <h3 className="text-sm font-bold text-neutral-900">
                                    Dokumentasi Visual & Foto Fisik Barang
                                </h3>
                                <p className="text-[11px] text-neutral-500">
                                    Unggah foto penampakan fisik aset (Format JPG/PNG, maksimal 5MB)
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-xs">
                            <div className="space-y-3">
                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">
                                        Unggah Foto Aset
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg"
                                        onChange={handleFileChange}
                                        className="w-full text-xs text-neutral-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                                    />
                                    {errors.foto && <p className="text-rose-500 mt-1">{errors.foto}</p>}
                                </div>

                                <div>
                                    <label className="font-semibold text-neutral-700 block mb-1">
                                        Catatan / Keterangan Tambahan
                                    </label>
                                    <textarea
                                        value={data.keterangan}
                                        onChange={(e) => setData('keterangan', e.target.value)}
                                        placeholder="Kondisi riil lapangan, kelengkapan aksesoris, dll..."
                                        rows={3}
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>

                            {/* Preview Foto */}
                            <div className="border border-neutral-200 rounded-2xl p-4 bg-neutral-50 flex flex-col items-center justify-center min-h-[160px]">
                                {previewUrl ? (
                                    <div className="relative group w-full h-44 rounded-xl overflow-hidden shadow-inner bg-black/5 flex items-center justify-center">
                                        <img
                                            src={previewUrl}
                                            alt="Preview Aset"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center text-neutral-400 space-y-1">
                                        <ImageIcon className="w-8 h-8 mx-auto stroke-1" />
                                        <p className="text-xs">Belum ada foto dipilih</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-xs flex items-center justify-between">
                        <Link
                            href={isEdit ? `/aset/${aset.id}` : '/aset'}
                            className="px-5 py-2.5 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 rounded-xl text-xs font-semibold transition-colors"
                        >
                            Batal
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {processing ? 'Menyimpan...' : isEdit ? 'Simpan Pembaruan Aset' : 'Daftarkan Aset BMD'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
