import React from 'react';
import { Head, Link } from '@inertiajs/react';
import KondisiBadge from '@/Components/KondisiBadge';
import GolonganBadge from '@/Components/GolonganBadge';
import {
    ShieldCheck,
    Box,
    Building2,
    Calendar,
    DoorClosed,
    Users,
    CheckCircle2,
    QrCode,
} from 'lucide-react';

export default function AsetScanInfo({
    aset,
    instansi = 'Kecamatan Mekarmukti',
    kabupaten = 'Kabupaten Garut',
}) {
    return (
        <div className="min-h-screen bg-neutral-100 flex flex-col justify-between font-sans">
            <Head title={`Verifikasi QR Aset - ${aset.nama}`} />

            {/* Topbar Instansi */}
            <header className="bg-gradient-to-r from-[#0f4a3c] via-[#0d3d31] to-[#08261f] text-white py-4 px-6 shadow-md">
                <div className="max-w-xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/10 p-1 flex items-center justify-center border border-white/20">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold tracking-wider leading-tight">
                                SIMUKTI BMD
                            </h1>
                            <p className="text-[11px] text-emerald-200/90">{instansi} &bull; {kabupaten}</p>
                        </div>
                    </div>

                    <Link
                        href="/login"
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors"
                    >
                        Masuk Sistem
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-xl mx-auto w-full p-4 sm:p-6 space-y-4">
                {/* Official Verification Banner */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
                    <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                            Aset Terverifikasi Resmi
                        </h2>
                        <p className="text-[11px] text-emerald-800">
                            Barang ini tercatat secara sah sebagai Barang Milik Daerah (BMD) {instansi}.
                        </p>
                    </div>
                </div>

                {/* Asset Identity Card */}
                <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs space-y-4">
                    {/* Foto Aset */}
                    {aset.foto_url && (
                        <div className="w-full h-52 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-inner">
                            <img
                                src={aset.foto_url}
                                alt={aset.nama}
                                className="w-full h-full object-contain"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <GolonganBadge golongan={aset.golongan} full />
                            <KondisiBadge kondisi={aset.kondisi} />
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                                REG: {aset.nomor_register}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-neutral-900 leading-snug">
                            {aset.nama}
                        </h3>

                        <p className="font-mono text-xs text-neutral-500">
                            Kode Barang: <span className="font-bold text-neutral-800">{aset.kode_barang}</span>
                        </p>
                    </div>

                    {/* Specifications List */}
                    <div className="border-t border-neutral-100 pt-4 space-y-3 text-xs">
                        <div className="flex items-start justify-between py-1 border-b border-neutral-50">
                            <span className="text-neutral-500 flex items-center gap-1.5">
                                <DoorClosed className="w-3.5 h-3.5 text-neutral-400" /> Ruangan Penempatan
                            </span>
                            <span className="font-bold text-neutral-900 text-right">{aset.ruangan}</span>
                        </div>

                        <div className="flex items-start justify-between py-1 border-b border-neutral-50">
                            <span className="text-neutral-500 flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-neutral-400" /> Penanggung Jawab
                            </span>
                            <span className="font-bold text-neutral-900 text-right">{aset.pemegang}</span>
                        </div>

                        <div className="flex items-start justify-between py-1 border-b border-neutral-50">
                            <span className="text-neutral-500 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-neutral-400" /> Tahun Perolehan
                            </span>
                            <span className="font-mono font-bold text-neutral-900">{aset.tahun_perolehan}</span>
                        </div>

                        {aset.keterangan && (
                            <div className="pt-2 text-neutral-600 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                                <span className="font-bold text-neutral-800 block mb-0.5">Catatan:</span>
                                <p>{aset.keterangan}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center text-[11px] text-neutral-400 py-2">
                    Dipindai melalui sistem barcode resmi SIMUKTI BMD Mekarmukti
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-neutral-200 py-3 text-center text-xs text-neutral-500">
                &copy; {new Date().getFullYear()} Pemerintah {instansi}, {kabupaten}.
            </footer>
        </div>
    );
}
