<?php

declare(strict_types=1);

namespace Tests\Feature\Bmd;

use App\Enums\GolonganKib;
use App\Enums\JenisDokumenAset;
use App\Enums\KondisiAset;
use App\Enums\UserRole;
use App\Models\Aset;
use App\Models\AsetDokumen;
use App\Models\Pegawai;
use App\Models\RefKodeBarang;
use App\Models\Ruangan;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class GelombangDuaTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;
    protected User $pengurusBarang;
    protected User $staf;
    protected Ruangan $ruangan;
    protected Pegawai $pegawai;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);

        $this->superAdmin = User::factory()->create(['role' => UserRole::SUPER_ADMIN]);
        $this->superAdmin->assignRole(UserRole::SUPER_ADMIN->value);

        $this->pengurusBarang = User::factory()->create(['role' => UserRole::PENGURUS_BARANG]);
        $this->pengurusBarang->assignRole(UserRole::PENGURUS_BARANG->value);

        $this->staf = User::factory()->create(['role' => UserRole::PEMEGANG]);
        $this->staf->assignRole(UserRole::PEMEGANG->value);

        $this->pegawai = Pegawai::create([
            'nip' => '198501012010011001',
            'nama' => 'Ahmad Suhendar, S.AP',
            'jabatan' => 'Pengurus Barang Pembantu',
            'unit_kerja' => 'Subbag Umum',
            'is_active' => true,
        ]);

        $this->ruangan = Ruangan::create([
            'kode' => 'R-01',
            'nama' => 'Ruang Pelayanan Terpadu',
            'gedung' => 'Gedung Utama',
            'penanggung_jawab_id' => $this->pegawai->id,
            'is_active' => true,
        ]);

        // Seed some sample kode barang
        RefKodeBarang::create([
            'kode' => '01.01.01.01.001',
            'uraian' => 'Tanah Bangunan Kantor Pemerintah',
            'golongan_kib' => 'A',
            'level' => 5,
            'is_selectable' => true,
        ]);

        RefKodeBarang::create([
            'kode' => '02.03.01.01.001',
            'uraian' => 'Sepeda Motor Solo',
            'golongan_kib' => 'B',
            'level' => 5,
            'is_selectable' => true,
        ]);

        RefKodeBarang::create([
            'kode' => '03.01.01.01.001',
            'uraian' => 'Bangunan Gedung Kantor Permanen',
            'golongan_kib' => 'C',
            'level' => 5,
            'is_selectable' => true,
        ]);

        Storage::fake('public');
        Storage::fake('local');
    }

    public function test_pengurus_barang_can_crud_master_ruangan(): void
    {
        // 1. Create Ruangan
        $response = $this->actingAs($this->pengurusBarang)->post(route('master.ruangan.store'), [
            'kode' => 'R-02',
            'nama' => 'Ruang Sekretaris Camat',
            'gedung' => 'Gedung Utama',
            'lantai' => '2',
            'penanggung_jawab_id' => $this->pegawai->id,
            'is_active' => true,
        ]);

        $response->assertRedirect(route('master.ruangan.index'));
        $this->assertDatabaseHas('ruangan', ['kode' => 'R-02', 'nama' => 'Ruang Sekretaris Camat']);

        $ruanganBaru = Ruangan::where('kode', 'R-02')->first();

        // 2. Update Ruangan
        $updateResponse = $this->actingAs($this->pengurusBarang)->put(route('master.ruangan.update', $ruanganBaru->id), [
            'kode' => 'R-02',
            'nama' => 'Ruang Sekcam Mekarmukti',
            'gedung' => 'Gedung Utama',
            'is_active' => true,
        ]);

        $updateResponse->assertRedirect(route('master.ruangan.index'));
        $this->assertDatabaseHas('ruangan', ['nama' => 'Ruang Sekcam Mekarmukti']);

        // 3. Delete Ruangan
        $deleteResponse = $this->actingAs($this->pengurusBarang)->delete(route('master.ruangan.destroy', $ruanganBaru->id));
        $deleteResponse->assertRedirect(route('master.ruangan.index'));
        $this->assertDatabaseMissing('ruangan', ['id' => $ruanganBaru->id]);
    }

    public function test_staf_cannot_manage_master_ruangan(): void
    {
        $response = $this->actingAs($this->staf)->post(route('master.ruangan.store'), [
            'kode' => 'R-03',
            'nama' => 'Ruang Ilegal',
        ]);

        $response->assertForbidden();
    }

    public function test_pengurus_barang_can_crud_master_pegawai(): void
    {
        // 1. Create Pegawai
        $response = $this->actingAs($this->pengurusBarang)->post(route('master.pegawai.store'), [
            'nip' => '199002022015021002',
            'nama' => 'Dewi Sartika, S.STP',
            'jabatan' => 'Kasi Pelayanan Publik',
            'unit_kerja' => 'Seksi Pelayanan',
            'no_hp' => '081234567890',
            'is_active' => true,
        ]);

        $response->assertRedirect(route('master.pegawai.index'));
        $this->assertDatabaseHas('pegawai', ['nip' => '199002022015021002', 'nama' => 'Dewi Sartika, S.STP']);

        $pegawaiBaru = Pegawai::where('nip', '199002022015021002')->first();

        // 2. Update Pegawai
        $updateResponse = $this->actingAs($this->pengurusBarang)->put(route('master.pegawai.update', $pegawaiBaru->id), [
            'nip' => '199002022015021002',
            'nama' => 'Dewi Sartika, S.STP, M.Si',
            'jabatan' => 'Kasi Pelayanan Publik',
            'is_active' => true,
        ]);

        $updateResponse->assertRedirect(route('master.pegawai.index'));
        $this->assertDatabaseHas('pegawai', ['nama' => 'Dewi Sartika, S.STP, M.Si']);

        // 3. Delete Pegawai
        $deleteResponse = $this->actingAs($this->pengurusBarang)->delete(route('master.pegawai.destroy', $pegawaiBaru->id));
        $deleteResponse->assertRedirect(route('master.pegawai.index'));
        $this->assertDatabaseMissing('pegawai', ['id' => $pegawaiBaru->id]);
    }

    public function test_kode_barang_search_api_returns_autocomplete(): void
    {
        $response = $this->actingAs($this->pengurusBarang)->getJson(route('api.master.kode-barang', ['q' => 'Motor']));

        $response->assertOk();
        $response->assertJsonFragment(['kode' => '02.03.01.01.001']);
    }

    public function test_can_register_and_persist_aset_golongan_a_tanah(): void
    {
        $response = $this->actingAs($this->pengurusBarang)->post(route('aset.store'), [
            'kode_barang' => '01.01.01.01.001',
            'nama' => 'Tanah Kantor Kecamatan Mekarmukti',
            'golongan' => 'A',
            'tanggal_perolehan' => '2020-05-10',
            'tahun_perolehan' => 2020,
            'cara_perolehan' => 'hibah',
            'sumber_dana' => 'apbd_kabupaten',
            'nilai_perolehan' => 750000000,
            'kondisi' => 'baik',
            'ruangan_id' => $this->ruangan->id,
            'pemegang_id' => $this->pegawai->id,
            // Subdetail Tanah
            'luas_m2' => 2500.50,
            'alamat' => 'Jl. Raya Mekarmukti KM 12',
            'status_hak' => 'Hak Pakai',
            'nomor_sertifikat' => 'HP.0021/MKM/2020',
            'penggunaan' => 'Perkantoran Pemerintah',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('aset', [
            'kode_barang' => '01.01.01.01.001',
            'nama' => 'Tanah Kantor Kecamatan Mekarmukti',
            'golongan' => 'A',
            'nomor_register' => '000001',
        ]);

        $aset = Aset::where('kode_barang', '01.01.01.01.001')->first();
        $this->assertNotNull($aset);
        $this->assertDatabaseHas('aset_detail_tanah', [
            'aset_id' => $aset->id,
            'status_hak' => 'Hak Pakai',
            'nomor_sertifikat' => 'HP.0021/MKM/2020',
        ]);

        // Audit Trail check
        $this->assertDatabaseHas('riwayat_aset', [
            'aset_id' => $aset->id,
            'aksi' => 'registrasi',
        ]);
    }

    public function test_can_register_and_persist_aset_golongan_b_peralatan_with_qr_and_photo(): void
    {
        $fakePhoto = UploadedFile::fake()->image('motor_dinas.jpg');

        $response = $this->actingAs($this->pengurusBarang)->post(route('aset.store'), [
            'kode_barang' => '02.03.01.01.001',
            'nama' => 'Sepeda Motor Dinas Honda Vario',
            'golongan' => 'B',
            'tanggal_perolehan' => '2024-02-15',
            'tahun_perolehan' => 2024,
            'cara_perolehan' => 'pembelian',
            'sumber_dana' => 'apbd_kabupaten',
            'nilai_perolehan' => 24500000,
            'kondisi' => 'baik',
            'ruangan_id' => $this->ruangan->id,
            'pemegang_id' => $this->pegawai->id,
            'foto' => $fakePhoto,
            // Subdetail Peralatan
            'merk_type' => 'Honda Vario 125 CBS',
            'ukuran_cc' => '125 CC',
            'bahan' => 'Besi / Plastik',
            'nomor_polisi' => 'Z 2145 D',
            'nomor_rangka' => 'MH1JM2190812',
            'nomor_mesin' => 'JM21E198210',
            'nomor_bpkb' => 'N-0918231',
        ]);

        $response->assertRedirect();
        $aset = Aset::where('kode_barang', '02.03.01.01.001')->first();
        $this->assertNotNull($aset);

        $this->assertEquals('000001', $aset->nomor_register);
        $this->assertNotEmpty($aset->qr_token);
        $this->assertNotEmpty($aset->qr_code_path);
        Storage::disk('public')->assertExists($aset->qr_code_path);

        $this->assertDatabaseHas('aset_detail_peralatan', [
            'aset_id' => $aset->id,
            'nomor_polisi' => 'Z 2145 D',
            'nomor_bpkb' => 'N-0918231',
        ]);
    }

    public function test_label_cetak_massal_renders_stickers(): void
    {
        $aset = Aset::create([
            'kode_barang' => '02.03.01.01.001',
            'nomor_register' => '000001',
            'golongan' => GolonganKib::B,
            'nama' => 'Laptop Acer Aspire',
            'tanggal_perolehan' => '2023-01-01',
            'tahun_perolehan' => 2023,
            'cara_perolehan' => 'pembelian',
            'nilai_perolehan' => 8500000,
            'kondisi' => KondisiAset::BAIK,
            'ruangan_id' => $this->ruangan->id,
            'qr_token' => 'TOKEN123TEST',
        ]);

        $response = $this->actingAs($this->pengurusBarang)->get(route('aset.cetak-label', ['ids' => $aset->id]));

        $response->assertOk();
        $response->assertSee('Laptop Acer Aspire');
        $response->assertSee('02.03.01.01.001');
        $response->assertSee('000001');
    }

    public function test_public_scan_portal_accessible_without_auth(): void
    {
        $aset = Aset::create([
            'kode_barang' => '02.03.01.01.001',
            'nomor_register' => '000001',
            'golongan' => GolonganKib::B,
            'nama' => 'Komputer PC All-in-One',
            'tanggal_perolehan' => '2023-01-01',
            'tahun_perolehan' => 2023,
            'cara_perolehan' => 'pembelian',
            'nilai_perolehan' => 12000000,
            'kondisi' => KondisiAset::BAIK,
            'ruangan_id' => $this->ruangan->id,
            'qr_token' => 'SCANTOKEN999',
        ]);

        $response = $this->get(route('public.scan', 'SCANTOKEN999'));

        $response->assertOk();
    }

    public function test_legal_document_storage_is_private_and_access_controlled(): void
    {
        $aset = Aset::create([
            'kode_barang' => '01.01.01.01.001',
            'nomor_register' => '000001',
            'golongan' => GolonganKib::A,
            'nama' => 'Tanah Balai Pertemuan',
            'tanggal_perolehan' => '2021-01-01',
            'tahun_perolehan' => 2021,
            'cara_perolehan' => 'hibah',
            'nilai_perolehan' => 500000000,
            'kondisi' => KondisiAset::BAIK,
        ]);

        $fakePdf = UploadedFile::fake()->create('sertifikat_tanah.pdf', 500, 'application/pdf');

        // 1. Upload sensitive document (Sertifikat)
        $uploadResponse = $this->actingAs($this->pengurusBarang)->post(route('aset.dokumen.store', $aset->id), [
            'file' => $fakePdf,
            'jenis' => JenisDokumenAset::SERTIFIKAT->value,
            'nama_dokumen' => 'Sertifikat Hak Pakai Asli',
            'nomor_dokumen' => 'HP-2021-99',
        ]);

        $uploadResponse->assertRedirect();
        $dokumen = AsetDokumen::where('aset_id', $aset->id)->first();
        $this->assertNotNull($dokumen);

        // Document stored on private 'local' disk, NOT 'public'
        $this->assertEquals('local', $dokumen->disk);
        Storage::disk('local')->assertExists($dokumen->file_path);

        // 2. Staf without sensitive permission CANNOT download sensitive document
        $forbiddenResponse = $this->actingAs($this->staf)->get(route('aset.dokumen.download', [$aset->id, $dokumen->id]));
        $forbiddenResponse->assertForbidden();

        // 3. Pengurus Barang CAN download sensitive document
        $downloadResponse = $this->actingAs($this->pengurusBarang)->get(route('aset.dokumen.download', [$aset->id, $dokumen->id]));
        $downloadResponse->assertOk();
    }
}
