import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    ArrowLeft, 
    QrCode, 
    Search, 
    CheckCircle2, 
    XCircle, 
    AlertCircle, 
    Camera, 
    Building2, 
    RotateCcw,
    Sparkles,
    Check
} from 'lucide-react';
import { toast } from 'sonner';

export default function SensusLapangan({ session, progress, ruangans }) {
    const [tokenInput, setTokenInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [foundAset, setFoundAset] = useState(null);
    const [ruanganTemuanId, setRuanganTemuanId] = useState('');
    const [catatan, setCatatan] = useState('');
    const [stats, setStats] = useState(progress);

    // Pencarian aset berdasarkan Token QR atau Kode / Register
    const handleSearchAset = async (e) => {
        if (e) e.preventDefault();
        const query = tokenInput.trim();
        if (!query) return;

        setIsLoading(true);
        try {
            // Kita fetch item dari sesi ini via API
            const res = await fetch(`/api/inventarisasi/${session.id}/search-item?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            
            if (data.item) {
                setFoundAset(data.item);
                setRuanganTemuanId(data.item.ruangan_temuan_id || data.item.aset?.ruangan_id || '');
                setCatatan(data.item.catatan || '');
                toast.success(`Aset ditemukan: ${data.item.aset.nama}`);
            } else {
                toast.error('Aset tidak terdaftar dalam sesi sensus ini.');
            }
        } catch (err) {
            toast.error('Gagal memindai atau mencari aset.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickAction = async (kondisi, hasil = 'ditemukan') => {
        if (!foundAset) return;

        setIsLoading(true);
        try {
            const res = await fetch(`/inventarisasi/${session.id}/check/${foundAset.aset_id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    hasil,
                    kondisi_temuan: kondisi,
                    ruangan_temuan_id: ruanganTemuanId ? parseInt(ruanganTemuanId, 10) : null,
                    catatan: catatan || null,
                }),
            });

            const resData = await res.json();
            if (resData.success) {
                toast.success(`Berhasil diverifikasi: ${kondisi ? kondisi.toUpperCase() : hasil.toUpperCase()}`);
                
                // Update local stats
                setStats((prev) => ({
                    ...prev,
                    sudah_dicek: prev.sudah_dicek + (foundAset.hasil === 'belum_dicek' ? 1 : 0),
                    belum_dicek: Math.max(0, prev.belum_dicek - (foundAset.hasil === 'belum_dicek' ? 1 : 0)),
                    ditemukan: hasil === 'ditemukan' ? prev.ditemukan + 1 : prev.ditemukan,
                    tidak_ditemukan: hasil === 'tidak_ditemukan' ? prev.tidak_ditemukan + 1 : prev.tidak_ditemukan,
                    persentase: Math.round(((prev.sudah_dicek + 1) / prev.total) * 100),
                }));

                // Reset untuk item berikutnya
                setFoundAset(null);
                setTokenInput('');
                setCatatan('');
            } else {
                toast.error(resData.message || 'Gagal menyimpan.');
            }
        } catch (err) {
            toast.error('Terjadi kesalahan jaringan.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-white flex flex-col">
            <Head title={`Sensus Lapangan - ${session.nama}`} />

            {/* Mobile Sticky Top Header */}
            <header className="sticky top-0 z-30 bg-neutral-950/90 backdrop-blur border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link
                        href={route('inventarisasi.show', session.id)}
                        className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-sm font-bold truncate max-w-[200px] sm:max-w-xs">{session.nama}</h1>
                        <p className="text-[11px] text-emerald-400 font-medium">
                            Progres: {stats.persentase}% ({stats.sudah_dicek}/{stats.total})
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <span className="text-xs px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-semibold">
                        Sensus Aktif
                    </span>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 p-4 max-w-lg mx-auto w-full space-y-4">
                
                {/* Search / Scan Bar */}
                <div className="bg-neutral-800/80 border border-neutral-700/80 p-4 rounded-2xl shadow-lg space-y-3">
                    <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                            <QrCode className="w-4 h-4 text-emerald-400" />
                            <span>Scan Stiker QR / Input Manual</span>
                        </span>
                    </div>

                    <form onSubmit={handleSearchAset} className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-500" />
                            <input
                                type="text"
                                placeholder="Scan QR / Token / Reg Aset..."
                                value={tokenInput}
                                onChange={(e) => setTokenInput(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !tokenInput}
                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm disabled:opacity-50 transition-colors"
                        >
                            Cari
                        </button>
                    </form>
                    <p className="text-[11px] text-neutral-400">
                        Arahkan pemindai barcode kamera atau ketikkan 6 digit nomor register / kode barang.
                    </p>
                </div>

                {/* Card Aset yang Ditemukan */}
                {foundAset ? (
                    <div className="bg-neutral-800 border-2 border-emerald-500/80 p-5 rounded-2xl shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-start justify-between gap-2 border-b border-neutral-700 pb-3">
                            <div>
                                <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-mono">
                                    Reg: {foundAset.aset?.nomor_register}
                                </span>
                                <h2 className="text-base font-bold text-white mt-1">
                                    {foundAset.aset?.nama}
                                </h2>
                                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                                    {foundAset.aset?.kode_barang}
                                </p>
                            </div>
                            <span className="text-xs px-2 py-1 bg-neutral-700 text-neutral-300 rounded-lg">
                                Master: {foundAset.aset?.ruangan?.nama || 'Tanpa Ruangan'}
                            </span>
                        </div>

                        {/* Pilihan Ruangan Terkini */}
                        <div>
                            <label className="block text-xs font-semibold text-neutral-300 mb-1 flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                                <span>Lokasi Fisik Ruangan Saat Ini:</span>
                            </label>
                            <select
                                value={ruanganTemuanId}
                                onChange={(e) => setRuanganTemuanId(e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:border-emerald-500"
                            >
                                <option value="">-- Tetap Sesuai Master Ruangan --</option>
                                {ruangans.map((r) => (
                                    <option key={r.id} value={r.id}>{r.nama}</option>
                                ))}
                            </select>
                        </div>

                        {/* Catatan Cepat */}
                        <div>
                            <input
                                type="text"
                                placeholder="Catatan opsional (misal: di atas meja kasubag)..."
                                value={catatan}
                                onChange={(e) => setCatatan(e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder-neutral-500"
                            />
                        </div>

                        {/* Quick Action Tap Buttons */}
                        <div className="space-y-2 pt-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block text-center">
                                Tap Satu Sentuhan untuk Konfirmasi:
                            </span>

                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    disabled={isLoading}
                                    onClick={() => handleQuickAction('baik', 'ditemukan')}
                                    className="py-3 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex flex-col items-center justify-center gap-1 shadow-md transition-all active:scale-95"
                                >
                                    <span className="text-base">🟢</span>
                                    <span>BAIK</span>
                                </button>

                                <button
                                    type="button"
                                    disabled={isLoading}
                                    onClick={() => handleQuickAction('rusak_ringan', 'ditemukan')}
                                    className="py-3 px-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl flex flex-col items-center justify-center gap-1 shadow-md transition-all active:scale-95"
                                >
                                    <span className="text-base">🟡</span>
                                    <span>RUSAK RINGAN</span>
                                </button>

                                <button
                                    type="button"
                                    disabled={isLoading}
                                    onClick={() => handleQuickAction('rusak_berat', 'ditemukan')}
                                    className="py-3 px-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex flex-col items-center justify-center gap-1 shadow-md transition-all active:scale-95"
                                >
                                    <span className="text-base">🔴</span>
                                    <span>RUSAK BERAT</span>
                                </button>
                            </div>

                            <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => handleQuickAction(null, 'tidak_ditemukan')}
                                className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-red-400 border border-red-500/30 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                            >
                                <XCircle className="w-4 h-4" />
                                <span>Tandai Barang Hilang / Tidak Ditemukan</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center border-2 border-dashed border-neutral-800 rounded-2xl text-neutral-500 space-y-2">
                        <Camera className="w-10 h-10 mx-auto text-neutral-600" />
                        <p className="text-sm font-medium">Siap Memindai Aset</p>
                        <p className="text-xs text-neutral-600 max-w-xs mx-auto">
                            Gunakan kotak input di atas atau pemindai stiker barcode untuk memuat aset yang sedang diperiksa.
                        </p>
                    </div>
                )}

            </main>
        </div>
    );
}
