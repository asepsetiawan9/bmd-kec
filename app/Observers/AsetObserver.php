<?php

declare(strict_types=1);

namespace App\Observers;

use App\Enums\AksiRiwayatAset;
use App\Enums\KondisiAset;
use App\Enums\NotifikasiTipe;
use App\Enums\UserRole;
use App\Models\Aset;
use App\Models\LogAktivitas;
use App\Models\RiwayatAset;
use App\Models\User;
use App\Services\NotifikasiService;
use Illuminate\Support\Facades\Auth;

class AsetObserver
{
    /**
     * Handle the Aset "creating" event.
     */
    public function creating(Aset $aset): void
    {
        if ($aset->tanggal_verifikasi_fisik === null) {
            $aset->tanggal_verifikasi_fisik = now()->toDateString();
        }

        if (empty($aset->qr_token)) {
            $aset->qr_token = (string) \Illuminate\Support\Str::ulid();
        }
    }

    /**
     * Handle the Aset "created" event.
     */
    public function created(Aset $aset): void
    {
        $userId = Auth::id();

        LogAktivitas::catat(
            userId: $userId,
            aksi: 'create_aset',
            tabelTerkait: 'aset',
            recordId: (int) $aset->id,
            keterangan: "Aset BMD baru didaftarkan: {$aset->nama} ({$aset->kode_barang}) [Register: {$aset->nomor_register}]"
        );

        // Catat ke RiwayatAset
        RiwayatAset::create([
            'aset_id' => $aset->id,
            'aksi' => AksiRiwayatAset::REGISTRASI,
            'keterangan' => "Registrasi awal aset BMD: {$aset->nama} ({$aset->kode_barang})",
            'data_sebelum' => null,
            'data_sesudah' => $aset->only(['nama', 'kode_barang', 'nomor_register', 'golongan', 'nilai_perolehan', 'kondisi', 'status', 'ruangan_id', 'pemegang_id']),
            'user_id' => $userId,
        ]);

        // Notifikasi ke Pengurus Barang & Penatausaha
        $recipients = User::whereIn('role', [UserRole::PENGURUS_BARANG->value, UserRole::PENATAUSAHA->value])
            ->where('is_active', true)
            ->get();
        $notifikasiService = app(NotifikasiService::class);

        foreach ($recipients as $recipient) {
            $notifikasiService->send(
                userId: (int) $recipient->id,
                judul: 'Aset Baru Ditambahkan',
                pesan: "Aset baru didaftarkan: {$aset->nama} ({$aset->kode_barang})",
                tipe: NotifikasiTipe::INFO,
                link: "/aset/{$aset->id}"
            );
        }
    }

    /**
     * Handle the Aset "updating" event.
     */
    public function updating(Aset $aset): void
    {
        if ($aset->isDirty('kondisi') || $aset->isDirty('ruangan_id')) {
            $aset->tanggal_verifikasi_fisik = now()->toDateString();
        }
    }

    /**
     * Handle the Aset "updated" event.
     */
    public function updated(Aset $aset): void
    {
        $userId = Auth::id();
        $changes = [];

        if ($aset->wasChanged('kondisi')) {
            $oldKondisi = $aset->getOriginal('kondisi');
            $oldVal = $oldKondisi instanceof \BackedEnum ? $oldKondisi->value : (string) $oldKondisi;
            $newVal = $aset->kondisi instanceof \BackedEnum ? $aset->kondisi->value : (string) $aset->kondisi;
            $changes[] = "kondisi diubah dari '{$oldVal}' ke '{$newVal}'";

            // Kondisi rusak_berat memicu peringatan kandidat penghapusan
            if ($newVal === KondisiAset::RUSAK_BERAT->value) {
                $targetUsers = User::whereIn('role', [UserRole::PENATAUSAHA->value, UserRole::CAMAT->value])
                    ->where('is_active', true)
                    ->get();
                $notifikasiService = app(NotifikasiService::class);

                foreach ($targetUsers as $target) {
                    $notifikasiService->send(
                        userId: (int) $target->id,
                        judul: 'Peringatan Aset Rusak Berat',
                        pesan: "Aset '{$aset->nama}' ({$aset->kode_barang}) berstatus Rusak Berat dan memenuhi kriteria usulan penghapusan.",
                        tipe: NotifikasiTipe::WARNING,
                        link: "/aset/{$aset->id}"
                    );
                }
            }
        }

        if ($aset->wasChanged('ruangan_id')) {
            $changes[] = 'lokasi/ruangan aset diperbarui';
        }

        if (!empty($changes)) {
            LogAktivitas::catat(
                userId: $userId,
                aksi: 'update_aset',
                tabelTerkait: 'aset',
                recordId: (int) $aset->id,
                keterangan: "Aset '{$aset->nama}' diperbarui: " . implode(', ', $changes)
            );

            RiwayatAset::create([
                'aset_id' => $aset->id,
                'aksi' => AksiRiwayatAset::UBAH_DATA,
                'keterangan' => 'Pembaruan data aset: ' . implode(', ', $changes),
                'data_sebelum' => $aset->getOriginal(),
                'data_sesudah' => $aset->getChanges(),
                'user_id' => $userId,
            ]);
        }
    }
}
