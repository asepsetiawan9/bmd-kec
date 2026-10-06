<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pemeliharaan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('aset_id')->constrained('aset')->cascadeOnDelete();
            $table->date('tanggal');
            $table->string('jenis', 50)->default('rutin'); // rutin, perbaikan, penggantian_suku_cadang
            $table->text('uraian');
            $table->decimal('biaya', 15, 2)->nullable();
            $table->string('pelaksana', 150)->nullable();
            $table->string('kondisi_sebelum', 30);
            $table->string('kondisi_sesudah', 30);
            $table->foreignId('dibuat_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pemeliharaan');
    }
};
