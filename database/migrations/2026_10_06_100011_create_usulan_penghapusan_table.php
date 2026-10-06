<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usulan_penghapusan', function (Blueprint $table) {
            $table->id();
            $table->string('nomor', 100)->unique();
            $table->date('tanggal');
            $table->text('alasan_umum');
            $table->string('status', 40)->default('draft')->index(); // draft, diajukan, diverifikasi, dikembalikan_penatausaha, disetujui, dikembalikan_camat, selesai
            $table->text('catatan_penatausaha')->nullable();
            $table->text('catatan_camat')->nullable();
            $table->timestamp('diajukan_pada')->nullable();
            $table->timestamp('diverifikasi_pada')->nullable();
            $table->timestamp('disetujui_pada')->nullable();
            $table->foreignId('dibuat_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('diverifikasi_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('disetujui_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->string('nomor_sk_penghapusan', 100)->nullable();
            $table->date('tanggal_sk')->nullable();
            $table->timestamps();
        });

        Schema::create('usulan_penghapusan_item', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usulan_id')->constrained('usulan_penghapusan')->cascadeOnDelete();
            $table->foreignId('aset_id')->constrained('aset')->cascadeOnDelete();
            $table->string('alasan', 50)->default('rusak_berat'); // rusak_berat, hilang, usang, lainnya
            $table->text('keterangan')->nullable();

            $table->unique(['usulan_id', 'aset_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usulan_penghapusan_item');
        Schema::dropIfExists('usulan_penghapusan');
    }
};
