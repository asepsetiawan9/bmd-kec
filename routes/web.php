<?php

declare(strict_types=1);

use App\Http\Controllers\AsetController;
use App\Http\Controllers\AsetDokumenController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\KodeBarangController;
use App\Http\Controllers\LabelCetakController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\NotifikasiController;
use App\Http\Controllers\PegawaiController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicScanController;
use App\Http\Controllers\RuanganController;
use Illuminate\Support\Facades\Route;

// Redirect root to dashboard or login
Route::get('/', function () {
    return auth()->check() ? redirect()->route('dashboard') : redirect()->route('login');
});

// === Public QR Scanner Info ===
Route::get('/scan/{token}', [PublicScanController::class, 'show'])->name('public.scan');
Route::get('/a/{token}', [PublicScanController::class, 'show'])->name('public.scan.alt');

Route::middleware(['auth'])->group(function () {
    // === Dashboard ===
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // === Profile ===
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // === Storage File Stream ===
    Route::get('/storage/{folder}/{filename}', [FileController::class, 'streamStorageFile'])
        ->where('folder', 'aset_foto|aset_fotos|aset_dokumen|aset_dokumens|qr_codes')
        ->where('filename', '.*')
        ->name('storage.stream');

    // === Autocomplete API ===
    Route::get('/api/master/kode-barang', [KodeBarangController::class, 'search'])->name('api.master.kode-barang');

    // === Aset / BMD ===
    Route::prefix('aset')->name('aset.')->group(function () {
        Route::get('/', [AsetController::class, 'index'])->name('index');
        Route::get('/create', [AsetController::class, 'create'])->name('create');
        Route::post('/', [AsetController::class, 'store'])->name('store');

        // Cetak Label QR Massal / Tunggal
        Route::match(['get', 'post'], '/cetak-label', [LabelCetakController::class, 'print'])->name('cetak-label');

        Route::get('/{aset}', [AsetController::class, 'show'])->name('show');
        Route::get('/{aset}/edit', [AsetController::class, 'edit'])->name('edit');
        Route::match(['put', 'post'], '/{aset}', [AsetController::class, 'update'])->name('update');
        Route::delete('/{aset}', [AsetController::class, 'destroy'])->name('destroy');
        Route::get('/{aset}/qr', [AsetController::class, 'downloadQr'])->name('download-qr');
        Route::get('/{aset}/kib-kir', [AsetController::class, 'generateKibKir'])->name('generate-kibkir');
        Route::get('/{aset}/kib-kir/download', [AsetController::class, 'downloadKibKir'])->name('download-kibkir');

        // Dokumen & Galeri Legalitas
        Route::post('/{aset}/dokumen', [AsetDokumenController::class, 'store'])->name('dokumen.store');
        Route::get('/{aset}/dokumen/{dokumen}/download', [AsetDokumenController::class, 'download'])->name('dokumen.download');
        Route::delete('/{aset}/dokumen/{dokumen}', [AsetDokumenController::class, 'destroy'])->name('dokumen.destroy');
    });

    // === Master Data Management ===
    Route::prefix('master')->name('master.')->middleware(['role_or_permission:super_admin|pengurus_barang|master.manage'])->group(function () {
        // Ruangan
        Route::get('/ruangan', [RuanganController::class, 'index'])->name('ruangan.index');
        Route::post('/ruangan', [RuanganController::class, 'store'])->name('ruangan.store');
        Route::match(['put', 'patch'], '/ruangan/{ruangan}', [RuanganController::class, 'update'])->name('ruangan.update');
        Route::delete('/ruangan/{ruangan}', [RuanganController::class, 'destroy'])->name('ruangan.destroy');

        // Pegawai
        Route::get('/pegawai', [PegawaiController::class, 'index'])->name('pegawai.index');
        Route::post('/pegawai', [PegawaiController::class, 'store'])->name('pegawai.store');
        Route::match(['put', 'patch'], '/pegawai/{pegawai}', [PegawaiController::class, 'update'])->name('pegawai.update');
        Route::delete('/pegawai/{pegawai}', [PegawaiController::class, 'destroy'])->name('pegawai.destroy');

        // Kode Barang Permendagri 108
        Route::get('/kode-barang', [KodeBarangController::class, 'index'])->name('kode-barang.index');
    });

    // === Laporan ===
    Route::prefix('laporan')->name('laporan.')->group(function () {
        Route::get('/', [LaporanController::class, 'index'])->name('index');
        Route::get('/export/pdf', [LaporanController::class, 'exportPdf'])->name('export-pdf');
        Route::get('/export/excel', [LaporanController::class, 'exportExcel'])->name('export-excel');
    });

    // === Notifikasi ===
    Route::prefix('notifikasi')->name('notifikasi.')->group(function () {
        Route::get('/', [NotifikasiController::class, 'index'])->name('index');
        Route::get('/recent', [NotifikasiController::class, 'recent'])->name('recent');
        Route::post('/{notifikasi}/read', [NotifikasiController::class, 'markAsRead'])->name('mark-read');
        Route::post('/read-all', [NotifikasiController::class, 'markAllAsRead'])->name('mark-all-read');
    });
});

require __DIR__.'/auth.php';
