<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aset', function (Blueprint $table) {
            $table->id();
            $table->string('qr_token', 64)->unique()->index();
            $table->foreignId('ref_kode_barang_id')->nullable()->constrained('ref_kode_barang')->nullOnDelete();
            $table->string('kode_barang', 50)->index();
            $table->string('nomor_register', 10)->index();
            $table->char('golongan', 1)->index(); // A, B, C, D, E, F
            $table->string('nama', 255);
            $table->string('merk_type', 150)->nullable();
            $table->text('spesifikasi')->nullable();
            $table->date('tanggal_perolehan')->index();
            $table->unsignedSmallInteger('tahun_perolehan')->index();
            $table->string('cara_perolehan', 50)->default('pembelian');
            $table->string('sumber_dana', 50)->nullable();
            $table->decimal('nilai_perolehan', 15, 2)->default(0);
            $table->string('satuan', 30)->default('unit');
            $table->string('kondisi', 30)->default('baik')->index(); // baik, rusak_ringan, rusak_berat
            $table->string('status', 30)->default('aktif')->index(); // aktif, dipinjam, dalam_perbaikan, diusulkan_hapus, dihapus, hilang
            $table->foreignId('ruangan_id')->nullable()->constrained('ruangan')->nullOnDelete();
            $table->foreignId('pemegang_id')->nullable()->constrained('pegawai')->nullOnDelete();
            $table->date('tanggal_verifikasi_fisik')->nullable();
            $table->string('foto_path')->nullable();
            $table->string('qr_code_path')->nullable();
            $table->text('keterangan')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['kode_barang', 'nomor_register']);
            $table->index(['golongan', 'status']);
            $table->index(['ruangan_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aset');
    }
};
