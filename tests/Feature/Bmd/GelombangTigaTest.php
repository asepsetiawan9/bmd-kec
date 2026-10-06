<?php

declare(strict_types=1);

namespace Tests\Feature\Bmd;

use App\Enums\GolonganKib;
use App\Enums\HasilInventarisasi;
use App\Enums\JenisMutasi;
use App\Enums\JenisPemeliharaan;
use App\Enums\KondisiAset;
use App\Enums\StatusAset;
use App\Enums\StatusInventarisasi;
use App\Enums\StatusUsulanPenghapusan;
use App\Enums\UserRole;
use App\Models\Aset;
use App\Models\Inventarisasi;
use App\Models\InventarisasiItem;
use App\Models\MutasiAset;
use App\Models\Pegawai;
use App\Models\Pemeliharaan;
use App\Models\RefKodeBarang;
use App\Models\Ruangan;
use App\Models\User;
use App\Models\UsulanPenghapusan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GelombangTigaTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;
    protected User $pengurusBarang;
    protected User $penatausaha;
    protected User $camat;
    protected Ruangan $ruangAwal;
    protected Ruangan $ruangTujuan;
    protected Pegawai $pegawai1;
    protected Pegawai $pegawai2;
    protected Aset $aset1;
    protected Aset $aset2;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();

        $this->superAdmin = User::where('role', UserRole::SUPER_ADMIN)->first();
        $this->pengurusBarang = User::where('role', UserRole::PENGURUS_BARANG)->first();
        $this->penatausaha = User::where('role', UserRole::PENATAUSAHA)->first();
        $this->camat = User::where('role', UserRole::CAMAT)->first();

        $this->ruangAwal = Ruangan::first();
        $this->ruangTujuan = Ruangan::skip(1)->first() ?? Ruangan::create([
            'kode' => 'RUANG-TEST-02',
            'nama' => 'Ruang Pelayanan Test',
            'is_active' => true,
        ]);

        $this->pegawai1 = Pegawai::first();
        $this->pegawai2 = Pegawai::skip(1)->first() ?? Pegawai::create([
            'nip' => '198901012015011002',
            'nama' => 'Budi Santoso',
            'jabatan' => 'Staf Pelayanan',
            'is_active' => true,
        ]);

        $kodeBarang = RefKodeBarang::where('is_selectable', true)->first();

        $this->aset1 = Aset::create([
            'qr_token' => '01HXTESTMUTASI00000000001',
            'ref_kode_barang_id' => $kodeBarang->id,
            'kode_barang' => $kodeBarang->kode,
            'nomor_register' => '900001',
            'golongan' => GolonganKib::B,
            'nama' => 'Laptop ThinkPad X1',
            'merk_type' => 'Lenovo',
            'tanggal_perolehan' => '2026-01-15',
            'tahun_perolehan' => 2026,
            'nilai_perolehan' => 18500000,
            'kondisi' => KondisiAset::BAIK,
            'status' => StatusAset::AKTIF,
            'ruangan_id' => $this->ruangAwal->id,
            'pemegang_id' => $this->pegawai1->id,
            'created_by' => $this->pengurusBarang->id,
        ]);

        $this->aset2 = Aset::create([
            'qr_token' => '01HXTESTMUTASI00000000002',
            'ref_kode_barang_id' => $kodeBarang->id,
            'kode_barang' => $kodeBarang->kode,
            'nomor_register' => '900002',
            'golongan' => GolonganKib::B,
            'nama' => 'Printer Canon G2010',
            'merk_type' => 'Canon',
            'tanggal_perolehan' => '2026-02-10',
            'tahun_perolehan' => 2026,
            'nilai_perolehan' => 2500000,
            'kondisi' => KondisiAset::RUSAK_RINGAN,
            'status' => StatusAset::AKTIF,
            'ruangan_id' => $this->ruangAwal->id,
            'pemegang_id' => $this->pegawai1->id,
            'created_by' => $this->pengurusBarang->id,
        ]);
    }

    // === STEP 10: MUTASI & BAST ===

    public function test_pengurus_barang_can_mutasi_aset_and_generates_bast(): void
    {
        $response = $this->actingAs($this->pengurusBarang)->post(route('mutasi.store'), [
            'aset_ids' => [$this->aset1->id, $this->aset2->id],
            'jenis' => 'pindah_ruangan',
            'ke_ruangan_id' => $this->ruangTujuan->id,
            'ke_pegawai_id' => $this->pegawai2->id,
            'tanggal' => date('Y-m-d'),
            'alasan' => 'Penataan ruang kerja pelayanan baru',
        ]);

        $response->assertRedirect(route('mutasi.index'));
        $response->assertSessionHas('success');

        // Pastikan ruangan & pegawai aset diupdate
        $this->aset1->refresh();
        $this->aset2->refresh();
        $this->assertEquals($this->ruangTujuan->id, $this->aset1->ruangan_id);
        $this->assertEquals($this->pegawai2->id, $this->aset1->pemegang_id);
        $this->assertEquals($this->ruangTujuan->id, $this->aset2->ruangan_id);

        // Pastikan record mutasi_aset terbuat dengan nomor BAST yang sama
        $mutasi1 = MutasiAset::where('aset_id', $this->aset1->id)->first();
        $mutasi2 = MutasiAset::where('aset_id', $this->aset2->id)->first();
        $this->assertNotNull($mutasi1);
        $this->assertNotNull($mutasi2);
        $this->assertEquals($mutasi1->nomor_bast, $mutasi2->nomor_bast);
        $this->assertStringContainsString('BAST-BMD/KEC-MKM', $mutasi1->nomor_bast);
    }

    public function test_mutasi_fails_if_destination_is_identical_to_origin(): void
    {
        $response = $this->actingAs($this->pengurusBarang)->post(route('mutasi.store'), [
            'aset_ids' => [$this->aset1->id],
            'jenis' => 'pindah_ruangan',
            'ke_ruangan_id' => $this->ruangAwal->id,
            'ke_pegawai_id' => $this->pegawai1->id,
            'tanggal' => date('Y-m-d'),
        ]);

        $response->assertSessionHasErrors('ke_ruangan_id');
    }

    public function test_can_generate_and_stream_bast_pdf(): void
    {
        // Mutasi dulu
        $this->actingAs($this->pengurusBarang)->post(route('mutasi.store'), [
            'aset_ids' => [$this->aset1->id],
            'jenis' => 'pindah_ruangan',
            'ke_ruangan_id' => $this->ruangTujuan->id,
            'tanggal' => date('Y-m-d'),
        ]);

        $mutasi = MutasiAset::first();

        $response = $this->actingAs($this->pengurusBarang)->get(
            route('mutasi.print-bast', ['nomor_bast' => $mutasi->nomor_bast])
        );

        $response->assertStatus(200);
        $this->assertStringContainsString('application/pdf', $response->headers->get('Content-Type'));
    }

    // === STEP 11: PEMELIHARAAN & BIAYA SERVIS ===

    public function test_can_record_pemeliharaan_and_updates_kondisi_aset(): void
    {
        $this->assertEquals(KondisiAset::RUSAK_RINGAN, $this->aset2->kondisi);

        $response = $this->actingAs($this->pengurusBarang)->post(route('pemeliharaan.store'), [
            'aset_id' => $this->aset2->id,
            'tanggal' => date('Y-m-d'),
            'jenis' => 'perbaikan',
            'uraian' => 'Penggantian print head dan pembersihan waste ink pad',
            'biaya' => 350000,
            'pelaksana' => 'CV Mitra Servis Garut',
            'kondisi_sesudah' => 'baik',
        ]);

        $response->assertSessionHas('success');

        $this->aset2->refresh();
        $this->assertEquals(KondisiAset::BAIK, $this->aset2->kondisi);

        $this->assertDatabaseHas('pemeliharaan', [
            'aset_id' => $this->aset2->id,
            'jenis' => 'perbaikan',
            'biaya' => 350000,
            'kondisi_sesudah' => 'baik',
        ]);
    }

    // === STEP 12: INVENTARISASI (STOCK OPNAME) ===

    public function test_can_create_opname_session_and_snapshots_active_assets(): void
    {
        $response = $this->actingAs($this->pengurusBarang)->post(route('inventarisasi.store'), [
            'nama' => 'Sensus Fisik Semester II 2026',
            'tanggal_mulai' => date('Y-m-d'),
        ]);

        $session = Inventarisasi::first();
        $this->assertNotNull($session);
        $this->assertEquals(StatusInventarisasi::BERJALAN, $session->status);

        // Pastikan aset aktif di-snapshot ke inventarisasi_item
        $itemsCount = InventarisasiItem::where('inventarisasi_id', $session->id)->count();
        $this->assertGreaterThanOrEqual(2, $itemsCount);

        // Tidak boleh membuat sesi kedua saat ada sesi berjalan (BR-OPN-01)
        $secondResponse = $this->actingAs($this->pengurusBarang)->post(route('inventarisasi.store'), [
            'nama' => 'Sensus Kedua',
            'tanggal_mulai' => date('Y-m-d'),
        ]);
        $secondResponse->assertSessionHasErrors('status');
    }

    public function test_can_inspect_item_and_closing_session_syncs_condition(): void
    {
        $this->actingAs($this->pengurusBarang)->post(route('inventarisasi.store'), [
            'nama' => 'Sensus Fisik Testing',
            'tanggal_mulai' => date('Y-m-d'),
        ]);

        $session = Inventarisasi::first();

        // Check item 1 via AJAX/Inertia
        $response = $this->actingAs($this->pengurusBarang)->post(
            route('inventarisasi.check-item', [$session->id, $this->aset1->id]),
            [
                'hasil' => 'ditemukan',
                'kondisi_temuan' => 'baik',
                'ruangan_temuan_id' => $this->ruangTujuan->id,
                'catatan' => 'Unit ada di ruang pelayanan',
            ],
            ['Accept' => 'application/json']
        );

        $response->assertStatus(200);
        $this->assertDatabaseHas('inventarisasi_item', [
            'inventarisasi_id' => $session->id,
            'aset_id' => $this->aset1->id,
            'hasil' => 'ditemukan',
            'kondisi_temuan' => 'baik',
        ]);

        // Tutup sesi
        $closeResponse = $this->actingAs($this->pengurusBarang)->post(
            route('inventarisasi.tutup', $session->id)
        );
        $closeResponse->assertRedirect(route('inventarisasi.show', $session->id));

        $session->refresh();
        $this->assertEquals(StatusInventarisasi::SELESAI, $session->status);

        // Cek bahwa tanggal verifikasi fisik aset terisi (BR-OPN-03)
        $this->aset1->refresh();
        $this->assertEquals(date('Y-m-d'), $this->aset1->tanggal_verifikasi_fisik->toDateString());
        $this->assertEquals($this->ruangTujuan->id, $this->aset1->ruangan_id);
    }

    // === STEP 13: USULAN PENGHAPUSAN (APPROVAL STATE MACHINE) ===

    public function test_full_penghapusan_approval_lifecycle(): void
    {
        // 1. Buat usulan draft
        $response = $this->actingAs($this->pengurusBarang)->post(route('penghapusan.store'), [
            'tanggal' => date('Y-m-d'),
            'alasan_umum' => 'Barang mengalami kerusakan fatal terbakar komponen utama',
            'items' => [
                [
                    'aset_id' => $this->aset2->id,
                    'alasan' => 'rusak_berat',
                    'keterangan' => 'Komponen motherboard terbakar mati total',
                ],
            ],
        ]);

        $usulan = UsulanPenghapusan::first();
        $this->assertNotNull($usulan);
        $this->assertEquals(StatusUsulanPenghapusan::DRAFT, $usulan->status);

        // 2. Pengurus barang ajukan ke Sekcam -> Aset status diusulkan_hapus
        $this->actingAs($this->pengurusBarang)->post(route('penghapusan.ajukan', $usulan->id));
        $usulan->refresh();
        $this->aset2->refresh();
        $this->assertEquals(StatusUsulanPenghapusan::DIAJUKAN, $usulan->status);
        $this->assertEquals(StatusAset::DIUSULKAN_HAPUS, $this->aset2->status);

        // 3. Sekcam verifikasi -> diteruskan ke Camat
        $this->actingAs($this->penatausaha)->post(route('penghapusan.verifikasi-sekcam', $usulan->id));
        $usulan->refresh();
        $this->assertEquals(StatusUsulanPenghapusan::DIVERIFIKASI, $usulan->status);

        // 4. Camat setujui usulan
        $this->actingAs($this->camat)->post(route('penghapusan.setujui-camat', $usulan->id));
        $usulan->refresh();
        $this->assertEquals(StatusUsulanPenghapusan::DISETUJUI, $usulan->status);

        // 5. Pengurus barang mencatat SK Penghapusan -> Aset status dihapus
        $this->actingAs($this->pengurusBarang)->post(route('penghapusan.selesaikan-sk', $usulan->id), [
            'nomor_sk_penghapusan' => 'SK-BMD/028/2026/GARUT',
            'tanggal_sk' => date('Y-m-d'),
        ]);

        $usulan->refresh();
        $this->aset2->refresh();
        $this->assertEquals(StatusUsulanPenghapusan::SELESAI, $usulan->status);
        $this->assertEquals('SK-BMD/028/2026/GARUT', $usulan->nomor_sk_penghapusan);
        $this->assertEquals(StatusAset::DIHAPUS, $this->aset2->status);
    }

    public function test_penghapusan_rejection_restores_asset_to_active(): void
    {
        // Buat usulan & ajukan
        $this->actingAs($this->pengurusBarang)->post(route('penghapusan.store'), [
            'tanggal' => date('Y-m-d'),
            'alasan_umum' => 'Testing penolakan usulan',
            'items' => [
                ['aset_id' => $this->aset2->id, 'alasan' => 'rusak_berat', 'keterangan' => 'rusak'],
            ],
        ]);
        $usulan = UsulanPenghapusan::first();
        $this->actingAs($this->pengurusBarang)->post(route('penghapusan.ajukan', $usulan->id));

        // Sekcam kembalikan dengan catatan
        $response = $this->actingAs($this->penatausaha)->post(route('penghapusan.kembalikan-sekcam', $usulan->id), [
            'catatan' => 'Mohon lampirkan berita acara cek fisik teknisi terlebih dahulu.',
        ]);

        $usulan->refresh();
        $this->aset2->refresh();
        $this->assertEquals(StatusUsulanPenghapusan::DIKEMBALIKAN_PENATAUSAHA, $usulan->status);
        $this->assertEquals(StatusAset::AKTIF, $this->aset2->status);
    }
}
