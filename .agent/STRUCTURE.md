# 🏛️ SIMUKTI Architecture & Structure Map

Sistem Informasi Manajemen Barang Milik Daerah (BMD) — Pemerintah Kecamatan Mekarmukti, Kabupaten Garut

## 📁 System Architecture Overview

```
pkp-mekarmukti/
├── .agent/
│   ├── STRUCTURE.md            # Peta navigasi arsitektur dan modul BMD v3
│   └── PROJECT_LOG.md          # Timeline atomic log aktivitas AI
├── app/
│   ├── Enums/                  # PHP 8.2 Backed Enums type-safe
│   │   ├── UserRole.php        # Roles: camat, sekmat, pengurus_barang, pengelola_aset, pegawai
│   │   ├── GolonganKib.php     # A (Tanah), B (Peralatan), C (Gedung), D (Jalan), E (Aset Lain), F (KDP)
│   │   ├── KondisiAset.php     # baik, rusak_ringan, rusak_berat
│   │   ├── StatusAset.php      # aktif, mutasi, diusulkan_penghapusan, dihapuskan, hilang
│   │   ├── CaraPerolehan.php   # pembelian, hibah, bantuan, mutasi_masuk, lainnya
│   │   ├── SumberDana.php      # apbd_kabupaten, apbd_provinsi, apbn, lainnya
│   │   ├── JenisDokumenAset.php# sertifikat, bpkb, stnk, bast, faktur, foto, lainnya
│   │   ├── JenisMutasi.php     # internal_ruangan, penanggung_jawab, eksternal_skpd
│   │   ├── JenisPemeliharaan.php# rutin, berkala, perbaikan_berat
│   │   ├── HasilInventarisasi.php# ditemukan_sesuai, ditemukan_rusak, tidak_ditemukan, berlebih
│   │   ├── StatusInventarisasi.php# draft, dalam_proses, selesai
│   │   ├── StatusUsulanPenghapusan.php# draft, diajukan, diverifikasi_sekmat, disetujui_camat, diteruskan_bpkad, selesai, ditolak
│   │   ├── AksiRiwayatAset.php # register, update, mutasi, pemeliharaan, inventarisasi, usulan_penghapusan, penghapusan
│   │   └── NotifikasiTipe.php
│   ├── Http/
│   │   ├── Controllers/        # Request handling & Inertia responses
│   │   │   ├── Auth/           # Breeze authentication controllers (Login, Profile, Password)
│   │   │   ├── DashboardController.php # Dashboard metrik eksekutif BMD Mekarmukti
│   │   │   ├── AsetController.php      # CRUD Aset, KIB, QR Code on-demand
│   │   │   ├── FileController.php      # Streaming file storage terproteksi (whitelist)
│   │   │   ├── LaporanController.php   # Rekapitulasi BMD, PDF & Excel export
│   │   │   └── NotifikasiController.php
│   │   ├── Middleware/
│   │   │   ├── CheckUserActive.php       # Inactive user guard
│   │   │   └── HandleInertiaRequests.php # Shared auth, user role & flash
│   │   └── Requests/           # Form validation & authorization
│   │       └── Aset/
│   │           ├── StoreAsetRequest.php
│   │           └── UpdateAsetRequest.php
│   ├── Models/                 # Eloquent models, casts & relations
│   │   ├── Pegawai.php         # Master pegawai (penanggung jawab / pemegang aset)
│   │   ├── RefKodeBarang.php   # Permendagri 108 kodefikasi barang
│   │   ├── Ruangan.php         # Master ruangan/lokasi penempatan aset (KIR)
│   │   ├── NomorUrut.php       # Atomic counter lock table
│   │   ├── Aset.php            # Entitas utama BMD
│   │   ├── AsetDetailTanah.php # Detail KIB A
│   │   ├── AsetDetailPeralatan.php # Detail KIB B
│   │   ├── AsetDetailGedung.php# Detail KIB C
│   │   ├── AsetDetailJalan.php # Detail KIB D
│   │   ├── AsetDetailLainnya.php# Detail KIB E
│   │   ├── AsetDetailKdp.php   # Detail KIB F
│   │   ├── AsetDokumen.php     # Dokumen bukti kepemilikan/foto aset
│   │   ├── MutasiAset.php      # Riwayat mutasi lokasi / pemegang / SKPD
│   │   ├── Pemeliharaan.php    # Catatan servis, riwayat biaya pemeliharaan
│   │   ├── Inventarisasi.php   # Sensus / stock opname berkala
│   │   ├── InventarisasiItem.php # Item ceklis fisik sensus
│   │   ├── UsulanPenghapusan.php # Berkas usulan hapus barang rusak berat/hilang
│   │   ├── UsulanPenghapusanItem.php# Rincian aset dalam usulan penghapusan
│   │   ├── RiwayatAset.php     # Audit trail lifecycle aset
│   │   ├── User.php            # Akun pengguna SIMUKTI (Spatie Roles)
│   │   ├── Notifikasi.php
│   │   ├── Pengaturan.php
│   │   └── LogAktivitas.php
│   ├── Repositories/           # Database abstraction layer
│   │   ├── AsetRepository.php
│   │   ├── RuanganRepository.php
│   │   ├── PegawaiRepository.php
│   │   ├── KodeBarangRepository.php
│   │   └── NotifikasiRepository.php
│   ├── Services/               # Pure business logic layer
│   │   ├── AsetService.php     # Orchestrator CRUD aset, detail sub-table & QR
│   │   ├── NomorRegistrasiGeneratorService.php # Atomic sequential counter (6-digit)
│   │   ├── NomorBastGeneratorService.php       # Format resmi BAST Mekarmukti
│   │   ├── RiwayatAsetService.php              # Pencatatan lifecycle otomatis
│   │   ├── LaporanService.php  # Rekapitulasi BMD, export PDF & Excel
│   │   └── NotifikasiService.php
│   ├── Observers/
│   │   └── AsetObserver.php    # Lifecycle hook & audit logging
│   ├── Policies/
│   │   └── AsetPolicy.php      # Spatie role-permission enforcement
│   └── Exports/
│       └── RekapAsetExport.php # Excel export rekapitulasi BMD Mekarmukti
├── database/
│   ├── migrations/             # 19 database migrations SQLite/MySQL
│   └── seeders/
│       ├── RolePermissionSeeder.php # Spatie roles & 20 permissions BMD
│       ├── PengaturanSeeder.php     # Konfigurasi instansi Kecamatan Mekarmukti
│       ├── PegawaiSeeder.php        # 8 Pegawai Kecamatan Mekarmukti
│       ├── RuanganSeeder.php        # 12 Ruangan Kantor Kecamatan Mekarmukti
│       ├── KodeBarangSeeder.php     # 32 Kode Barang Permendagri 108 (Gol A–F)
│       ├── UserSeeder.php           # Akun Camat, Sekmat, Pengurus Barang, Pengelola
│       ├── AsetSeeder.php           # 12 Sampel Aset Riil Golongan A–F
│       └── DatabaseSeeder.php
├── resources/
│   ├── js/
│   │   ├── Components/         # Atomic UI (Logo, Sidebar, Topbar, Modal, etc.)
│   │   ├── Layouts/            # AuthenticatedLayout, GuestLayout
│   │   └── Pages/
│   │       ├── Auth/           # Login, ForgotPassword, ResetPassword
│   │       ├── Dashboard/      # Executive Dashboard BMD
│   │       ├── Aset/           # Daftar Aset & Detail Aset
│   │       ├── Laporan/        # Laporan & Rekapitulasi BMD
│   │       └── Profile/        # Profil User
│   └── views/
│       ├── app.blade.php       # Inertia root layout (SIMUKTI Mekarmukti)
│       └── pdf/
│           ├── kib.blade.php   # Kartu Inventaris Barang (KIB A-F)
│           ├── kir.blade.php   # Kartu Inventaris Ruangan (KIR)
│           └── rekap_aset.blade.php # Rekapitulasi BMD Mekarmukti
└── routes/
    ├── web.php                 # Rute utama SIMUKTI terproteksi Spatie auth
    ├── auth.php                # Rute autentikasi Breeze
    └── console.php             # Schedule & CLI command simukti:backup-database
```
