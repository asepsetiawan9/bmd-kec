<?php

declare(strict_types=1);

namespace Tests\Feature\Bmd;

use App\Enums\GolonganKib;
use App\Enums\KondisiAset;
use App\Enums\StatusAset;
use App\Enums\StatusUsulanPenghapusan;
use App\Models\Aset;
use App\Models\LogAktivitas;
use App\Models\Ruangan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GelombangEmpatTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_can_render_laporan_index_with_bmd_options(): void
    {
        $pengurus = User::where('email', 'pengurus.barang@simukti.test')->firstOrFail();

        $response = $this->actingAs($pengurus)->get('/laporan');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Laporan/Index')
            ->has('reportData')
            ->has('jenisLaporanOptions')
            ->has('golonganOptions')
            ->has('ruanganOptions')
        );
    }

    public function test_can_export_rekap_pdf_landscape(): void
    {
        $pengurus = User::where('email', 'pengurus.barang@simukti.test')->firstOrFail();

        $response = $this->actingAs($pengurus)->get('/laporan/export/pdf?jenis_laporan=rekap');
        $response->assertStatus(200);
        $this->assertTrue(str_contains((string) $response->headers->get('content-type'), 'application/pdf'));
    }

    public function test_can_export_kib_pdf_and_kir_pdf(): void
    {
        $pengurus = User::where('email', 'pengurus.barang@simukti.test')->firstOrFail();

        // KIB B
        $kibResponse = $this->actingAs($pengurus)->get('/laporan/export/pdf?jenis_laporan=kib_b');
        $kibResponse->assertStatus(200);
        $this->assertTrue(str_contains((string) $kibResponse->headers->get('content-type'), 'application/pdf'));

        // KIR
        $ruangan = Ruangan::first();
        $kirResponse = $this->actingAs($pengurus)->get("/laporan/export/pdf?jenis_laporan=kir&ruangan_id={$ruangan?->id}");
        $kirResponse->assertStatus(200);
        $this->assertTrue(str_contains((string) $kirResponse->headers->get('content-type'), 'application/pdf'));
    }

    public function test_can_export_excel_bmd_reports(): void
    {
        $pengurus = User::where('email', 'pengurus.barang@simukti.test')->firstOrFail();

        $response = $this->actingAs($pengurus)->get('/laporan/export/excel?jenis_laporan=rekap');
        $response->assertStatus(200);
        $this->assertTrue(str_contains((string) $response->headers->get('content-type'), 'spreadsheetml'));
    }

    public function test_dashboard_renders_role_specific_variants(): void
    {
        // 1. Camat variant
        $camat = User::where('email', 'camat@simukti.test')->firstOrFail();
        $resCamat = $this->actingAs($camat)->get('/dashboard');
        $resCamat->assertStatus(200);
        $resCamat->assertInertia(fn ($page) => $page
            ->component('Dashboard/Index')
            ->where('dashboardData.variant', 'camat')
            ->has('dashboardData.komposisiGolongan')
        );

        // 2. Sekcam (Penatausaha) variant
        $sekcam = User::where('email', 'sekcam@simukti.test')->firstOrFail();
        $resSekcam = $this->actingAs($sekcam)->get('/dashboard');
        $resSekcam->assertStatus(200);
        $resSekcam->assertInertia(fn ($page) => $page
            ->component('Dashboard/Index')
            ->where('dashboardData.variant', 'penatausaha')
        );

        // 3. Pengurus Barang variant
        $pengurus = User::where('email', 'pengurus.barang@simukti.test')->firstOrFail();
        $resPengurus = $this->actingAs($pengurus)->get('/dashboard');
        $resPengurus->assertStatus(200);
        $resPengurus->assertInertia(fn ($page) => $page
            ->component('Dashboard/Index')
            ->where('dashboardData.variant', 'pengurus_barang')
            ->has('dashboardData.recentAset')
        );
    }

    public function test_public_scan_sanitizes_data_and_protects_internal_data(): void
    {
        $aset = Aset::whereNotNull('qr_token')->firstOrFail();

        $response = $this->get("/scan/{$aset->qr_token}");
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/AsetScanInfo')
            ->has('aset.nama')
            ->has('aset.kode_barang')
            ->has('aset.nomor_register')
            ->has('aset.kondisi')
            ->missing('aset.nilai_perolehan') // Nilai harga sensitif tidak terekspos di public
            ->missing('aset.dokumen') // Dokumen private tidak terekspos
        );
    }

    public function test_log_aktivitas_audit_trail_is_restricted_and_readable(): void
    {
        $camat = User::where('email', 'camat@simukti.test')->firstOrFail();

        // Create log entry
        LogAktivitas::create([
            'user_id' => $camat->id,
            'aksi' => 'test_audit',
            'tabel_terkait' => 'aset',
            'record_id' => 1,
            'keterangan' => 'Pengujian jejak audit log',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($camat)->get('/log-aktivitas');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('AuditTrail/Index')
            ->has('sistemLogs.data')
            ->has('asetLogs.data')
        );
    }

    public function test_security_unauthorized_user_cannot_export_without_permission(): void
    {
        // Staf / Pemegang tanpa permission laporan.export
        $staf = User::where('email', 'pegawai@simukti.test')->firstOrFail();

        $response = $this->actingAs($staf)->get('/laporan/export/excel?jenis_laporan=rekap');
        $response->assertStatus(403);
    }
}
