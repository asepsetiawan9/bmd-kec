<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Golongan A: Tanah
        Schema::create('aset_detail_tanah', function (Blueprint $table) {
            $table->id();
            $table->foreignId('aset_id')->unique()->constrained('aset')->cascadeOnDelete();
            $table->decimal('luas_m2', 12, 2)->nullable();
            $table->text('alamat')->nullable();
            $table->string('status_hak', 100)->nullable();
            $table->string('nomor_sertifikat', 100)->nullable();
            $table->date('tanggal_sertifikat')->nullable();
            $table->string('penggunaan', 150)->nullable();
            $table->timestamps();
        });

        // Golongan B: Peralatan & Mesin
        Schema::create('aset_detail_peralatan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('aset_id')->unique()->constrained('aset')->cascadeOnDelete();
            $table->string('ukuran_cc', 50)->nullable();
            $table->string('bahan', 100)->nullable();
            $table->string('nomor_pabrik', 100)->nullable();
            $table->string('nomor_rangka', 100)->nullable();
            $table->string('nomor_mesin', 100)->nullable();
            $table->string('nomor_polisi', 50)->nullable()->index();
            $table->string('nomor_bpkb', 100)->nullable();
            $table->date('tanggal_pajak')->nullable();
            $table->timestamps();
        });

        // Golongan C: Gedung & Bangunan
        Schema::create('aset_detail_gedung', function (Blueprint $table) {
            $table->id();
            $table->foreignId('aset_id')->unique()->constrained('aset')->cascadeOnDelete();
            $table->string('kondisi_bangunan', 50)->nullable();
            $table->boolean('bertingkat')->default(false);
            $table->boolean('beton')->default(true);
            $table->decimal('luas_lantai_m2', 12, 2)->nullable();
            $table->text('alamat')->nullable();
            $table->string('nomor_dokumen', 100)->nullable();
            $table->date('tanggal_dokumen')->nullable();
            $table->decimal('luas_tanah_m2', 12, 2)->nullable();
            $table->string('status_tanah', 100)->nullable();
            $table->string('kode_tanah', 50)->nullable();
            $table->timestamps();
        });

        // Golongan D: Jalan, Irigasi & Jaringan
        Schema::create('aset_detail_jalan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('aset_id')->unique()->constrained('aset')->cascadeOnDelete();
            $table->string('konstruksi', 100)->nullable();
            $table->decimal('panjang_m', 12, 2)->nullable();
            $table->decimal('lebar_m', 12, 2)->nullable();
            $table->decimal('luas_m2', 12, 2)->nullable();
            $table->text('alamat')->nullable();
            $table->string('nomor_dokumen', 100)->nullable();
            $table->string('status_tanah', 100)->nullable();
            $table->timestamps();
        });

        // Golongan E: Aset Tetap Lainnya
        Schema::create('aset_detail_lainnya', function (Blueprint $table) {
            $table->id();
            $table->foreignId('aset_id')->unique()->constrained('aset')->cascadeOnDelete();
            $table->string('judul_pencipta', 200)->nullable();
            $table->string('spesifikasi_buku', 200)->nullable();
            $table->string('asal_daerah', 100)->nullable();
            $table->string('pencipta', 150)->nullable();
            $table->string('bahan', 100)->nullable();
            $table->string('jenis_hewan_tumbuhan', 150)->nullable();
            $table->string('ukuran', 100)->nullable();
            $table->timestamps();
        });

        // Golongan F: Konstruksi Dalam Pengerjaan (KDP)
        Schema::create('aset_detail_kdp', function (Blueprint $table) {
            $table->id();
            $table->foreignId('aset_id')->unique()->constrained('aset')->cascadeOnDelete();
            $table->string('bangunan', 150)->nullable();
            $table->boolean('bertingkat')->default(false);
            $table->boolean('beton')->default(true);
            $table->decimal('luas_m2', 12, 2)->nullable();
            $table->text('alamat')->nullable();
            $table->date('tanggal_mulai')->nullable();
            $table->string('status_tanah', 100)->nullable();
            $table->decimal('nilai_kontrak', 15, 2)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aset_detail_kdp');
        Schema::dropIfExists('aset_detail_lainnya');
        Schema::dropIfExists('aset_detail_jalan');
        Schema::dropIfExists('aset_detail_gedung');
        Schema::dropIfExists('aset_detail_peralatan');
        Schema::dropIfExists('aset_detail_tanah');
    }
};
