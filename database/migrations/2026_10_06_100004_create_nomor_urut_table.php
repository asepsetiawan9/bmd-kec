<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nomor_urut', function (Blueprint $table) {
            $table->id();
            $table->string('kunci', 100)->unique();
            $table->unsignedBigInteger('nilai_terakhir')->default(0);
            $table->timestamp('updated_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nomor_urut');
    }
};
