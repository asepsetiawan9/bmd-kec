# 🗺️ Roadmap & Urutan Pengerjaan Rombak Sistem BMD Mekarmukti

**File Acuan Utama**: [CATATAN-ROMBAK-SISTEM-BMD.md](file:///c:/Users/Pongo/Desktop/PROJECT/pkp-mekarmukti/CATATAN-ROMBAK-SISTEM-BMD.md)  
**Total Tahapan**: 19 Langkah Terukur (Step 0 s/d Step 18)  
**Status**: Siap Dieksekusi Bertahap

---

## 📊 Ringkasan 4 Gelombang Pengerjaan (Phased Waves)

| Gelombang | Tahapan Terlibat | Fokus Pekerjaan | Gate Criteria |
|---|---|---|---|
| **Gelombang 1: Pembersihan & Fondasi** | Step 0 s/d Step 4 | Safety sandbox, hapus modul SPJ, rebranding Mekarmukti, migrasi skema tabel baru & seeder, clean architecture layer | `php artisan migrate:fresh --seed` sukses, route bersih, 0 modul SPJ |
| **Gelombang 2: Shell, Master Data & Core Aset** | Step 5 s/d Step 9 | Spatie roles, layout sidebar dinamis, CRUD master data, registrasi aset golongan A–F, engine QR label & media security | CRUD 6 golongan lancar, QR terbaca, dokumen private terproteksi |
| **Gelombang 3: Transaksi BMD & Approval** | Step 10 s/d Step 13 | Mutasi & cetak BAST, pemeliharaan servis, sensus/opname fisik mobile scanner, workflow approval berjenjang (Sekcam & Camat) | Transaksi atomik berhasil, BAST terbit, state machine penghapusan valid |
| **Gelombang 4: Output, Intelligence & Production** | Step 14 s/d Step 18 | Laporan resmi KIB A–F & KIR (PDF/Excel), 4 varian dashboard eksekutif, public scan, polish UI/UX, security hardening & deploy prep | Laporan match format BPKAD, performa 60 FPS, lolos audit keamanan |

---

## 🎯 Detail Tahapan Eksekusi Singkat

1. **Step 0 (`PREP`)**: Git baseline branch `refactor/overhaul-bmd-v3` & backup SQLite.
2. **Step 1 (`PURGE`)**: Hapus 17+ file SPJ, bersihkan `routes/web.php` & menu sidebar.
3. **Step 2 (`BRAND`)**: Rebranding nama sistem ke SIMUKTI & instansi Kecamatan Mekarmukti.
4. **Step 3 (`SCHEMA`)**: Migrasi 14 tabel database BMD baru & seeder awal.
5. **Step 4 (`ARCH`)**: Setup Enums PHP 8.2+, Repository & Service layer.
6. **Step 5 (`AUTH`)**: Konfigurasi Spatie permission & shell layout UI responsif.
7. **Step 6 (`MASTER`)**: CRUD Master Ruangan, Pegawai & Kodefikasi Permendagri 108.
8. **Step 7 (`CORE`)**: Registrasi & inventarisasi aset multi-golongan (A–F) + dynamic form.
9. **Step 8 (`QR`)**: Generator token QR acak & cetak lembar stiker label A4 (12 stiker/lembar).
10. **Step 9 (`MEDIA`)**: Galeri foto visual & secure storage dokumen hukum private.
11. **Step 10 (`MUTASI`)**: Mutasi internal ruangan/pemegang & otomatisasi cetak BAST PDF.
12. **Step 11 (`RAWAT`)**: Pencatatan pemeliharaan/servis, nota, dan pembaruan kondisi fisik.
13. **Step 12 (`OPNAME`)**: Sensus fisik mobile-first (scanner kamera + quick action tap).
14. **Step 13 (`HAPUS`)**: State machine usulan penghapusan: Pengurus Barang → Sekcam → Camat.
15. **Step 14 (`REPORT`)**: Generator laporan resmi KIB A–F, KIR, Rekap (Excel & PDF landscape).
16. **Step 15 (`DASH`)**: 4 Varian dashboard analitik berbasis peran pengguna.
17. **Step 16 (`AUDIT`)**: Endpoint publik `/scan/{token}` & audit trail riwayat aktivitas.
18. **Step 17 (`POLISH`)**: Finishing tema Emerald/Teal, micro-motion, table-to-card mobile.
19. **Step 18 (`PROD`)**: Audit celah keamanan, SQLite WAL tuning, build produksi & deployment readiness.
