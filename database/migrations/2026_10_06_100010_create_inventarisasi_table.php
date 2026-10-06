<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventarisasi', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 50)->unique();
            $table->string('nama', 150);
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai')->nullable();
            $table->string('status', 30)->default('berjalan')->index(); // berjalan, selesai
            $table->foreignId('ruangan_scope')->nullable()->constrained('ruangan')->nullOnDelete();
            $table->foreignId('dibuat_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('inventarisasi_item', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventarisasi_id')->constrained('inventarisasi')->cascadeOnDelete();
            $table->foreignId('aset_id')->constrained('aset')->cascadeOnDelete();
            $table->string('hasil', 30)->default('belum_dicek')->index(); // belum_dicek, ditemukan, tidak_ditemukan
            $table->string('kondisi_temuan', 30)->nullable();
            $table->foreignId('ruangan_temuan_id')->nullable()->constrained('ruangan')->nullOnDelete();
            $table->text('catatan')->nullable();
            $table->foreignId('diperiksa_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('diperiksa_pada')->nullable();

            $table->unique(['inventarisasi_id', 'aset_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventarisasi_item');
        Schema::dropIfExists('inventarisasi');
    }
};
