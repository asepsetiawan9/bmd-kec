<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mutasi_aset', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_bast', 100)->unique();
            $table->foreignId('aset_id')->constrained('aset')->cascadeOnDelete();
            $table->string('jenis', 50)->default('pindah_ruangan'); // penempatan_awal, pindah_ruangan, ganti_pemegang, pengembalian
            $table->foreignId('dari_ruangan_id')->nullable()->constrained('ruangan')->nullOnDelete();
            $table->foreignId('ke_ruangan_id')->nullable()->constrained('ruangan')->nullOnDelete();
            $table->foreignId('dari_pegawai_id')->nullable()->constrained('pegawai')->nullOnDelete();
            $table->foreignId('ke_pegawai_id')->nullable()->constrained('pegawai')->nullOnDelete();
            $table->date('tanggal');
            $table->text('alasan')->nullable();
            $table->foreignId('dibuat_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mutasi_aset');
    }
};
