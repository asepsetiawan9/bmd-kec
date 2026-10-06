<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\CaraPerolehan;
use App\Enums\GolonganKib;
use App\Enums\KondisiAset;
use App\Enums\StatusAset;
use App\Enums\SumberDana;
use App\Models\Aset;
use App\Models\AsetDetailGedung;
use App\Models\AsetDetailJalan;
use App\Models\AsetDetailKdp;
use App\Models\AsetDetailLainnya;
use App\Models\AsetDetailPeralatan;
use App\Models\AsetDetailTanah;
use App\Models\NomorUrut;
use App\Models\Pegawai;
use App\Models\RefKodeBarang;
use App\Models\Ruangan;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AsetSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'super_admin')->first();
        $pengurus = Pegawai::where('jabatan', 'like', '%Pengurus Barang%')->first();
        $camat = Pegawai::where('jabatan', 'like', '%Camat%')->first();
        $kasi = Pegawai::where('jabatan', 'like', '%Pemerintahan%')->first();

        $ruangCamat = Ruangan::where('kode', 'R-01')->first();
        $ruangUmum = Ruangan::where('kode', 'R-03')->first();
        $ruangPem = Ruangan::where('kode', 'R-05')->first();

        // 1. Golongan A: Tanah Kantor
        $refTanah = RefKodeBarang::where('kode', '1.3.1.01.01.01.001')->first();
        if ($refTanah) {
            $tanah = Aset::create([
                'qr_token' => (string) Str::ulid(),
                'ref_kode_barang_id' => $refTanah->id,
                'kode_barang' => $refTanah->kode,
                'nomor_register' => '000001',
                'golongan' => GolonganKib::A,
                'nama' => 'Tanah Kompleks Kantor Kecamatan Mekarmukti',
                'merk_type' => null,
                'spesifikasi' => 'Lokasi strategis pusat pemerintahan kecamatan',
                'tanggal_perolehan' => '1995-04-12',
                'tahun_perolehan' => 1995,
                'cara_perolehan' => CaraPerolehan::PEMBELIAN,
                'sumber_dana' => SumberDana::APBD,
                'nilai_perolehan' => 850000000.00,
                'satuan' => 'm2',
                'kondisi' => KondisiAset::BAIK,
                'status' => StatusAset::AKTIF,
                'ruangan_id' => null,
                'pemegang_id' => $camat?->id,
                'tanggal_verifikasi_fisik' => now()->toDateString(),
                'keterangan' => 'Sertifikat Hak Pakai Pemkab Garut',
                'created_by' => $admin?->id,
            ]);

            AsetDetailTanah::create([
                'aset_id' => $tanah->id,
                'luas_m2' => 2500.00,
                'alamat' => 'Jl. Raya Mekarmukti No. 1, Kec. Mekarmukti, Kab. Garut',
                'status_hak' => 'Hak Pakai Pemerintah Kabupaten Garut',
                'nomor_sertifikat' => 'HP-0012/MKM/1995',
                'tanggal_sertifikat' => '1995-06-20',
                'penggunaan' => 'Bangunan Gedung Perkantoran Pemerintah Kecamatan',
            ]);

            NomorUrut::updateOrCreate(['kunci' => "register:{$refTanah->kode}"], ['nilai_terakhir' => 1, 'updated_at' => now()]);
        }

        // 2. Golongan B: Laptop & Kendaraan
        $refLaptop = RefKodeBarang::where('kode', '1.3.2.10.01.02.001')->first();
        if ($refLaptop) {
            $laptop = Aset::create([
                'qr_token' => (string) Str::ulid(),
                'ref_kode_barang_id' => $refLaptop->id,
                'kode_barang' => $refLaptop->kode,
                'nomor_register' => '000001',
                'golongan' => GolonganKib::B,
                'nama' => 'Laptop HP ProBook 450 G9 Core i5',
                'merk_type' => 'HP ProBook 450 G9 (16GB RAM / 512GB SSD)',
                'spesifikasi' => 'Intel Core i5-1235U, Layar 15.6 FHD, Windows 11 Pro',
                'tanggal_perolehan' => '2023-05-15',
                'tahun_perolehan' => 2023,
                'cara_perolehan' => CaraPerolehan::PEMBELIAN,
                'sumber_dana' => SumberDana::APBD,
                'nilai_perolehan' => 14850000.00,
                'satuan' => 'unit',
                'kondisi' => KondisiAset::BAIK,
                'status' => StatusAset::AKTIF,
                'ruangan_id' => $ruangUmum?->id,
                'pemegang_id' => $pengurus?->id,
                'tanggal_verifikasi_fisik' => now()->toDateString(),
                'keterangan' => 'Digunakan untuk operasional penatausahaan aset BMD',
                'created_by' => $admin?->id,
            ]);

            AsetDetailPeralatan::create([
                'aset_id' => $laptop->id,
                'ukuran_cc' => null,
                'bahan' => 'Aluminium & Polikarbonat',
                'nomor_pabrik' => '5CD3204X9K',
                'nomor_rangka' => null,
                'nomor_mesin' => null,
                'nomor_polisi' => null,
                'nomor_bpkb' => null,
                'tanggal_pajak' => null,
            ]);

            NomorUrut::updateOrCreate(['kunci' => "register:{$refLaptop->kode}"], ['nilai_terakhir' => 1, 'updated_at' => now()]);
        }

        // Sepeda Motor Dinas
        $refMotor = RefKodeBarang::where('kode', '1.3.2.01.01.01.001')->first();
        if ($refMotor) {
            $motor = Aset::create([
                'qr_token' => (string) Str::ulid(),
                'ref_kode_barang_id' => $refMotor->id,
                'kode_barang' => $refMotor->kode,
                'nomor_register' => '000001',
                'golongan' => GolonganKib::B,
                'nama' => 'Honda Vario 160 CBS Dinas',
                'merk_type' => 'Honda Vario 160cc Warna Hitam Doff',
                'spesifikasi' => 'Mesin 160cc eSP+, Kapasitas Tangki 5.5 Liter',
                'tanggal_perolehan' => '2022-09-10',
                'tahun_perolehan' => 2022,
                'cara_perolehan' => CaraPerolehan::PEMBELIAN,
                'sumber_dana' => SumberDana::APBD,
                'nilai_perolehan' => 26500000.00,
                'satuan' => 'unit',
                'kondisi' => KondisiAset::BAIK,
                'status' => StatusAset::AKTIF,
                'ruangan_id' => $ruangPem?->id,
                'pemegang_id' => $kasi?->id,
                'tanggal_verifikasi_fisik' => now()->toDateString(),
                'keterangan' => 'Kendaraan dinas operasional pelayanan lapangan',
                'created_by' => $admin?->id,
            ]);

            AsetDetailPeralatan::create([
                'aset_id' => $motor->id,
                'ukuran_cc' => '160 cc',
                'bahan' => 'Baja & Plastik Komposit',
                'nomor_pabrik' => 'HND-VR160-2022',
                'nomor_rangka' => 'MH1KF1114NK109283',
                'nomor_mesin' => 'KF11E1109283',
                'nomor_polisi' => 'Z 2345 MK',
                'nomor_bpkb' => 'N-09823101-MK',
                'tanggal_pajak' => '2026-09-10',
            ]);

            NomorUrut::updateOrCreate(['kunci' => "register:{$refMotor->kode}"], ['nilai_terakhir' => 1, 'updated_at' => now()]);
        }

        // 3. Golongan C: Gedung Kantor
        $refGedung = RefKodeBarang::where('kode', '1.3.3.01.01.01.001')->first();
        if ($refGedung) {
            $gedung = Aset::create([
                'qr_token' => (string) Str::ulid(),
                'ref_kode_barang_id' => $refGedung->id,
                'kode_barang' => $refGedung->kode,
                'nomor_register' => '000001',
                'golongan' => GolonganKib::C,
                'nama' => 'Gedung Kantor Utama Kecamatan Mekarmukti',
                'merk_type' => 'Konstruksi Beton Bertulang 2 Lantai',
                'spesifikasi' => 'Struktur beton bertulang, atap genteng press, lantai keramik 60x60',
                'tanggal_perolehan' => '2010-11-20',
                'tahun_perolehan' => 2010,
                'cara_perolehan' => CaraPerolehan::PEMBELIAN,
                'sumber_dana' => SumberDana::APBD,
                'nilai_perolehan' => 1250000000.00,
                'satuan' => 'm2',
                'kondisi' => KondisiAset::BAIK,
                'status' => StatusAset::AKTIF,
                'ruangan_id' => null,
                'pemegang_id' => $camat?->id,
                'tanggal_verifikasi_fisik' => now()->toDateString(),
                'keterangan' => 'Gedung operasional kantor kecamatan',
                'created_by' => $admin?->id,
            ]);

            AsetDetailGedung::create([
                'aset_id' => $gedung->id,
                'kondisi_bangunan' => 'Baik',
                'bertingkat' => true,
                'beton' => true,
                'luas_lantai_m2' => 850.00,
                'alamat' => 'Jl. Raya Mekarmukti No. 1, Kec. Mekarmukti, Kab. Garut',
                'nomor_dokumen' => 'IMB-0045/DTR/2010',
                'tanggal_dokumen' => '2010-08-15',
                'luas_tanah_m2' => 2500.00,
                'status_tanah' => 'Tanah Milik Pemkab Garut',
                'kode_tanah' => '1.3.1.01.01.01.001',
            ]);

            NomorUrut::updateOrCreate(['kunci' => "register:{$refGedung->kode}"], ['nilai_terakhir' => 1, 'updated_at' => now()]);
        }

        // 4. Golongan D: Jaringan LAN
        $refLan = RefKodeBarang::where('kode', '1.3.4.03.02.001')->first();
        if ($refLan) {
            $lan = Aset::create([
                'qr_token' => (string) Str::ulid(),
                'ref_kode_barang_id' => $refLan->id,
                'kode_barang' => $refLan->kode,
                'nomor_register' => '000001',
                'golongan' => GolonganKib::D,
                'nama' => 'Jaringan LAN & Server Ruang Kerja Kecamatan',
                'merk_type' => 'Kabel UTP Cat6, Mikrotik Router & Switch Gigabit',
                'spesifikasi' => '24 Node titik kabel LAN terhubung ke seluruh ruangan kantor',
                'tanggal_perolehan' => '2021-04-10',
                'tahun_perolehan' => 2021,
                'cara_perolehan' => CaraPerolehan::PEMBELIAN,
                'sumber_dana' => SumberDana::APBD,
                'nilai_perolehan' => 38000000.00,
                'satuan' => 'jaringan',
                'kondisi' => KondisiAset::BAIK,
                'status' => StatusAset::AKTIF,
                'ruangan_id' => $ruangUmum?->id,
                'pemegang_id' => $pengurus?->id,
                'tanggal_verifikasi_fisik' => now()->toDateString(),
                'keterangan' => 'Infrastruktur internet dan intranet kecamatan',
                'created_by' => $admin?->id,
            ]);

            AsetDetailJalan::create([
                'aset_id' => $lan->id,
                'konstruksi' => 'Instalasi Kabel UTP & Rak Server',
                'panjang_m' => 450.00,
                'lebar_m' => null,
                'luas_m2' => null,
                'alamat' => 'Kompleks Kantor Kecamatan Mekarmukti',
                'nomor_dokumen' => 'BASTP-04/NET/2021',
                'status_tanah' => 'Milik Pemkab Garut',
            ]);

            NomorUrut::updateOrCreate(['kunci' => "register:{$refLan->kode}"], ['nilai_terakhir' => 1, 'updated_at' => now()]);
        }

        // 5. Golongan E: Aset Tetap Lainnya
        $refBuku = RefKodeBarang::where('kode', '1.3.5.01.01.01.001')->first();
        if ($refBuku) {
            $buku = Aset::create([
                'qr_token' => (string) Str::ulid(),
                'ref_kode_barang_id' => $refBuku->id,
                'kode_barang' => $refBuku->kode,
                'nomor_register' => '000001',
                'golongan' => GolonganKib::E,
                'nama' => 'Himpunan Peraturan Daerah & Perbup Garut Edisi Eksklusif',
                'merk_type' => 'Jilid Hardcover Kulit Sintetis (10 Jilid Lengkap)',
                'spesifikasi' => 'Buku dokumentasi hukum pemerintahan daerah',
                'tanggal_perolehan' => '2020-02-18',
                'tahun_perolehan' => 2020,
                'cara_perolehan' => CaraPerolehan::HIBAH,
                'sumber_dana' => SumberDana::HIBAH,
                'nilai_perolehan' => 5000000.00,
                'satuan' => 'set',
                'kondisi' => KondisiAset::BAIK,
                'status' => StatusAset::AKTIF,
                'ruangan_id' => $ruangCamat?->id,
                'pemegang_id' => $camat?->id,
                'tanggal_verifikasi_fisik' => now()->toDateString(),
                'keterangan' => 'Koleksi perpustakaan ruang kerja camat',
                'created_by' => $admin?->id,
            ]);

            AsetDetailLainnya::create([
                'aset_id' => $buku->id,
                'judul_pencipta' => 'Himpunan Produk Hukum Daerah Kabupaten Garut',
                'spesifikasi_buku' => 'Hardcover, 10 Jilid, Kertas HVS 80gr',
                'asal_daerah' => 'Kabupaten Garut',
                'pencipta' => 'Bagian Hukum Setda Kabupaten Garut',
                'bahan' => 'Kertas & Kulit Sintetis',
                'jenis_hewan_tumbuhan' => null,
                'ukuran' => 'A4',
            ]);

            NomorUrut::updateOrCreate(['kunci' => "register:{$refBuku->kode}"], ['nilai_terakhir' => 1, 'updated_at' => now()]);
        }

        // 6. Golongan F: KDP (Konstruksi Dalam Pengerjaan)
        $refKdp = RefKodeBarang::where('kode', '1.3.6.01.01.01.001')->first();
        if ($refKdp) {
            $kdp = Aset::create([
                'qr_token' => (string) Str::ulid(),
                'ref_kode_barang_id' => $refKdp->id,
                'kode_barang' => $refKdp->kode,
                'nomor_register' => '000001',
                'golongan' => GolonganKib::F,
                'nama' => 'Renovasi Aula Pertemuan Kecamatan (Tahap II)',
                'merk_type' => 'Pekerjaan Struktur Rangka Atap Baja Ringan & Plafon',
                'spesifikasi' => 'Konstruksi renovasi perluasan aula serbaguna kecamatan',
                'tanggal_perolehan' => '2026-08-01',
                'tahun_perolehan' => 2026,
                'cara_perolehan' => CaraPerolehan::PEMBELIAN,
                'sumber_dana' => SumberDana::APBD,
                'nilai_perolehan' => 175000000.00,
                'satuan' => 'pekerjaan',
                'kondisi' => KondisiAset::BAIK,
                'status' => StatusAset::AKTIF,
                'ruangan_id' => null,
                'pemegang_id' => $pengurus?->id,
                'tanggal_verifikasi_fisik' => now()->toDateString(),
                'keterangan' => 'Progres fisik 65% dalam masa pelaksanaan kontrak',
                'created_by' => $admin?->id,
            ]);

            AsetDetailKdp::create([
                'aset_id' => $kdp->id,
                'bangunan' => 'Gedung Aula Serbaguna',
                'bertingkat' => false,
                'beton' => true,
                'luas_m2' => 300.00,
                'alamat' => 'Kompleks Kantor Kecamatan Mekarmukti',
                'tanggal_mulai' => '2026-07-01',
                'status_tanah' => 'Tanah Milik Pemkab Garut',
                'nilai_kontrak' => 175000000.00,
            ]);

            NomorUrut::updateOrCreate(['kunci' => "register:{$refKdp->kode}"], ['nilai_terakhir' => 1, 'updated_at' => now()]);
        }
    }
}
