<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ref_kode_barang', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('ref_kode_barang')->nullOnDelete();
            $table->string('kode', 50)->unique()->index();
            $table->string('uraian', 255);
            $table->unsignedTinyInteger('level')->default(1);
            $table->char('golongan_kib', 1)->nullable()->index();
            $table->unsignedSmallInteger('masa_manfaat')->nullable();
            $table->boolean('is_selectable')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ref_kode_barang');
    }
};
