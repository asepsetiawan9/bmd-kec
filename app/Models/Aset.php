<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\CaraPerolehan;
use App\Enums\GolonganKib;
use App\Enums\KondisiAset;
use App\Enums\StatusAset;
use App\Enums\SumberDana;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Aset extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'aset';

    protected $fillable = [
        'qr_token',
        'ref_kode_barang_id',
        'kode_barang',
        'nomor_register',
        'golongan',
        'nama',
        'merk_type',
        'spesifikasi',
        'tanggal_perolehan',
        'tahun_perolehan',
        'cara_perolehan',
        'sumber_dana',
        'nilai_perolehan',
        'satuan',
        'kondisi',
        'status',
        'ruangan_id',
        'pemegang_id',
        'tanggal_verifikasi_fisik',
        'foto_path',
        'qr_code_path',
        'keterangan',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'golongan' => GolonganKib::class,
            'kondisi' => KondisiAset::class,
            'status' => StatusAset::class,
            'cara_perolehan' => CaraPerolehan::class,
            'sumber_dana' => SumberDana::class,
            'tanggal_perolehan' => 'date',
            'tahun_perolehan' => 'integer',
            'nilai_perolehan' => 'decimal:2',
            'tanggal_verifikasi_fisik' => 'date',
        ];
    }

    public function refKodeBarang(): BelongsTo
    {
        return $this->belongsTo(RefKodeBarang::class, 'ref_kode_barang_id');
    }

    public function ruangan(): BelongsTo
    {
        return $this->belongsTo(Ruangan::class, 'ruangan_id');
    }

    public function pemegang(): BelongsTo
    {
        return $this->belongsTo(Pegawai::class, 'pemegang_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Detail per Golongan
    public function detailTanah(): HasOne
    {
        return $this->hasOne(AsetDetailTanah::class, 'aset_id');
    }

    public function detailPeralatan(): HasOne
    {
        return $this->hasOne(AsetDetailPeralatan::class, 'aset_id');
    }

    public function detailGedung(): HasOne
    {
        return $this->hasOne(AsetDetailGedung::class, 'aset_id');
    }

    public function detailJalan(): HasOne
    {
        return $this->hasOne(AsetDetailJalan::class, 'aset_id');
    }

    public function detailLainnya(): HasOne
    {
        return $this->hasOne(AsetDetailLainnya::class, 'aset_id');
    }

    public function detailKdp(): HasOne
    {
        return $this->hasOne(AsetDetailKdp::class, 'aset_id');
    }

    public function getDetailAttribute(): ?Model
    {
        return match ($this->golongan) {
            GolonganKib::A => $this->detailTanah,
            GolonganKib::B => $this->detailPeralatan,
            GolonganKib::C => $this->detailGedung,
            GolonganKib::D => $this->detailJalan,
            GolonganKib::E => $this->detailLainnya,
            GolonganKib::F => $this->detailKdp,
            default => null,
        };
    }

    // Transaksi & Arsip Relasional
    public function dokumen(): HasMany
    {
        return $this->hasMany(AsetDokumen::class, 'aset_id');
    }

    public function mutasi(): HasMany
    {
        return $this->hasMany(MutasiAset::class, 'aset_id')->latest('tanggal');
    }

    public function pemeliharaan(): HasMany
    {
        return $this->hasMany(Pemeliharaan::class, 'aset_id')->latest('tanggal');
    }

    public function riwayat(): HasMany
    {
        return $this->hasMany(RiwayatAset::class, 'aset_id')->latest('created_at');
    }

    // Scopes
    public function scopeAktif($query)
    {
        return $query->where('status', StatusAset::AKTIF);
    }

    public function scopePerluPerhatian($query)
    {
        return $query->whereIn('kondisi', [KondisiAset::RUSAK_RINGAN, KondisiAset::RUSAK_BERAT]);
    }

    // Backward compatibility helper accessors for views
    public function getNilaiAttribute(): float
    {
        return (float) $this->nilai_perolehan;
    }

    public function getLokasiAttribute(): ?string
    {
        return $this->ruangan?->nama ?? '-';
    }

    public function penanggungJawab(): BelongsTo
    {
        return $this->pemegang();
    }

    public function pegawai(): BelongsTo
    {
        return $this->pemegang();
    }

    public function kodeBarangRef(): BelongsTo
    {
        return $this->refKodeBarang();
    }

    public function getNamaBarangAttribute(): string
    {
        return (string) ($this->nama ?? '');
    }

    public function getMerkTipeAttribute(): ?string
    {
        return $this->merk_type;
    }
}
