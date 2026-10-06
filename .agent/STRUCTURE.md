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
│   │   │   ├── AsetController.php      # CRUD Aset multi-golongan A-F, KIB, QR Code
│   │   │   ├── LabelCetakController.php # Engine cetak stiker label QR A4 (12 per lembar)
│   │   │   ├── AsetDokumenController.php# Secure storage & legal document management
│   │   │   ├── PublicScanController.php# Endpoint publik verifikasi fisik /scan/{token}
│   │   │   ├── MutasiAsetController.php # Mutasi aset ruangan & pegawai, BAST PDF & detail
│   │   │   ├── PemeliharaanController.php # Riwayat servis, biaya & update kondisi fisik
│   │   │   ├── InventarisasiController.php# Sensus/Opname fisik mobile-first, QR Scanner & tutup sesi
│   │   │   ├── UsulanPenghapusanController.php # State machine approval berjenjang & SK penghapusan
│   │   │   ├── RuanganController.php   # CRUD Master Ruangan penempatan aset
│   │   │   ├── PegawaiController.php   # CRUD Master Pegawai penanggung jawab
│   │   │   ├── KodeBarangController.php# Master & Autocomplete API Permendagri 108
│   │   │   ├── FileController.php      # Streaming file storage terproteksi (whitelist)
│   │   │   ├── LaporanController.php   # Rekapitulasi BMD, PDF & Excel export
│   │   │   └── NotifikasiController.php
│   │   ├── Middleware/
│   │   │   ├── CheckUserActive.php       # Inactive user guard
│   │   │   └── HandleInertiaRequests.php # Shared auth, user role, flash & realtime badge counters
│   │   └── Requests/           # Form validation & authorization
│   │       ├── Aset/
│   │       │   ├── StoreAsetRequest.php  # Validasi dinamis Golongan A–F
│   │       │   └── UpdateAsetRequest.php
│   │       ├── Master/
│   │       │   ├── StoreRuanganRequest.php
│   │       │   ├── UpdateRuanganRequest.php
│   │       │   ├── StorePegawaiRequest.php
│   │       │   └── UpdatePegawaiRequest.php
│   │       ├── StoreMutasiRequest.php
│   │       ├── StorePemeliharaanRequest.php
│   │       ├── StoreInventarisasiRequest.php
│   │       └── StoreUsulanPenghapusanRequest.php
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
│   │   ├── AsetDokumen.php     # Dokumen bukti kepemilikan/foto aset (public & private)
│   │   ├── MutasiAset.php      # Riwayat mutasi lokasi / pemegang / SKPD & BAST
│   │   ├── Pemeliharaan.php    # Catatan servis, riwayat biaya pemeliharaan
│   │   ├── Inventarisasi.php   # Sensus / stock opname berkala (1 sesi aktif)
│   │   ├── InventarisasiItem.php # Item ceklis fisik sensus & temuan lapangan
│   │   ├── UsulanPenghapusan.php # Berkas usulan hapus barang rusak berat/hilang (State Machine)
│   │   ├── UsulanPenghapusanItem.php# Rincian aset dalam usulan penghapusan
│   │   ├── RiwayatAset.php     # Audit trail lifecycle aset
│   │   ├── User.php            # Akun pengguna SIMUKTI (Spatie Roles)
│   │   ├── Notifikasi.php
│   │   ├── Pengaturan.php
│   │   └── LogAktivitas.php
│   ├── Repositories/           # Database abstraction layer
│   │   ├── AsetRepository.php
│   │   ├── MutasiAsetRepository.php
│   │   ├── PemeliharaanRepository.php
│   │   ├── InventarisasiRepository.php
│   │   ├── UsulanPenghapusanRepository.php
│   │   ├── RuanganRepository.php
│   │   ├── PegawaiRepository.php
│   │   ├── KodeBarangRepository.php
│   │   └── NotifikasiRepository.php
│   ├── Services/               # Pure business logic layer
│   │   ├── AsetService.php     # Orchestrator CRUD aset, detail sub-table & QR
│   │   ├── MutasiAsetService.php # Mutasi multi-aset atomik & BAST PDF generator
│   │   ├── PemeliharaanService.php # Catatan servis & auto update kondisi fisik aset
│   │   ├── InventarisasiService.php # Sensus fisik mobile-first, snapshot & sync tutup sesi
│   │   ├── UsulanPenghapusanService.php # Approval state machine & penguncian aset
│   │   ├── NomorRegistrasiGeneratorService.php # Atomic sequential counter (6-digit)
│   │   ├── NomorBastGeneratorService.php       # Format resmi BAST Mekarmukti
│   │   ├── RiwayatAsetService.php              # Pencatatan lifecycle otomatis
│   │   ├── DashboardService.php # 4 Varian Dashboard Eksekutif (Camat, Sekcam, Pengurus, Pemegang)
│   │   ├── LaporanService.php  # Generator Laporan Resmi BMD (KIB A-F, KIR, Mutasi, Penghapusan, Sensus)
│   │   └── NotifikasiService.php
│   ├── Observers/
│   │   └── AsetObserver.php    # Lifecycle hook & audit logging
│   ├── Policies/
│   │   └── AsetPolicy.php      # Spatie role-permission enforcement
│   └── Exports/
│       └── BmdLaporanExport.php# Multi-format Excel export (KIB A-F, KIR, Mutasi, Penghapusan, Sensus)
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
│   │   ├── Components/         # Atomic UI (Sidebar, GolonganBadge, StatCard, etc.)
│   │   ├── Layouts/            # AuthenticatedLayout, GuestLayout
│   │   └── Pages/
│   │       ├── Auth/           # Login, ForgotPassword, ResetPassword
│   │       ├── Dashboard/      # Executive Dashboard BMD (4 Role-specific Variants)
│   │       ├── Aset/           # Index (Table-to-Card & Bulk), Form (6 Golongan), Detail (5 Tabs)
│   │       ├── Mutasi/         # Index, Create (Multi-aset), Show (Rincian BAST & Unduh PDF)
│   │       ├── Pemeliharaan/   # Index (Pencatatan Servis & Riwayat Biaya)
│   │       ├── Inventarisasi/  # Index, Show (Progress Ruangan & Rekap), SensusLapangan (Mobile-first QR Scanner)
│   │       ├── Penghapusan/    # Index (Antrean Approval), Create (Pilih Aset), Show (Timeline Approval & Eksekusi SK)
│   │       ├── Master/         # Ruangan/Index, Pegawai/Index, KodeBarang/Index
│   │       ├── Public/         # AsetScanInfo (Portal Publik Sanitized QR Scan)
│   │       ├── Laporan/        # Laporan & Rekapitulasi BMD (KIB A-F, KIR, Mutasi, Penghapusan, Sensus)
│   │       ├── AuditTrail/     # Audit Trail & Log Aktivitas Sistem
│   │       └── Profile/        # Profil User
│   └── views/
│       ├── app.blade.php       # Inertia root layout (SIMUKTI Mekarmukti)
│       ├── print/
│       │   ├── label_qr_a4.blade.php # Lembar cetak stiker QR label A4 (12 per lembar)
│       │   └── bast_mutasi.blade.php # Berita Acara Serah Terima (BAST) Mutasi BMD A4 Resmi
│       └── pdf/
│           ├── kib_golongan.blade.php # KIB A-F Landscape Tabel Resmi Permendagri 108
│           ├── kir_ruangan.blade.php # KIR Ruangan Resmi Berita Acara & Tanda Tangan
│           ├── laporan_mutasi.blade.php # Laporan Mutasi Barang Resmi
│           ├── laporan_penghapusan.blade.php # Daftar Usulan Penghapusan Barang
│           ├── laporan_inventarisasi.blade.php # Laporan Hasil Sensus/Opname Fisik
│           └── rekap_aset.blade.php # Buku Inventaris Rekapitulasi BMD Mekarmukti
└── routes/
    ├── web.php                 # 81 Rute utama SIMUKTI terproteksi Spatie auth & policies
    ├── auth.php                # Rute autentikasi Breeze
    └── console.php             # Schedule & CLI command simukti:backup-database
```

