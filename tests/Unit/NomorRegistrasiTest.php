<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Models\NomorUrut;
use App\Services\NomorBastGeneratorService;
use App\Services\NomorRegistrasiGeneratorService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NomorRegistrasiTest extends TestCase
{
    use RefreshDatabase;

    private NomorRegistrasiGeneratorService $registerGenerator;
    private NomorBastGeneratorService $bastGenerator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->registerGenerator = app(NomorRegistrasiGeneratorService::class);
        $this->bastGenerator = app(NomorBastGeneratorService::class);
    }

    public function test_nomor_registrasi_dimulai_dari_000001(): void
    {
        $kodeBarang = '1.3.2.05.01.01.001';

        $nomor = $this->registerGenerator->generate($kodeBarang);

        $this->assertSame('000001', $nomor);
    }

    public function test_nomor_registrasi_bertambah_secara_berurutan(): void
    {
        $kodeBarang = '1.3.2.05.01.01.001';

        $nomor1 = $this->registerGenerator->generate($kodeBarang);
        $nomor2 = $this->registerGenerator->generate($kodeBarang);
        $nomor3 = $this->registerGenerator->generate($kodeBarang);

        $this->assertSame('000001', $nomor1);
        $this->assertSame('000002', $nomor2);
        $this->assertSame('000003', $nomor3);
    }

    public function test_counter_terisolasi_per_kode_barang(): void
    {
        $kodeBarangA = '1.3.2.05.01.01.001';
        $kodeBarangB = '1.3.2.05.01.02.001';

        $nomorA1 = $this->registerGenerator->generate($kodeBarangA);
        $nomorB1 = $this->registerGenerator->generate($kodeBarangB);
        $nomorA2 = $this->registerGenerator->generate($kodeBarangA);

        $this->assertSame('000001', $nomorA1);
        $this->assertSame('000001', $nomorB1);
        $this->assertSame('000002', $nomorA2);
    }

    public function test_sequential_multi_generation_tidak_ada_duplikat_atau_lompat(): void
    {
        $kodeBarang = '1.3.1.01.01.01.001';
        $generatedNumbers = [];

        for ($i = 1; $i <= 10; $i++) {
            $generatedNumbers[] = $this->registerGenerator->generate($kodeBarang);
        }

        $expectedNumbers = [
            '000001', '000002', '000003', '000004', '000005',
            '000006', '000007', '000008', '000009', '000010',
        ];

        $this->assertSame($expectedNumbers, $generatedNumbers);
        // Pastikan seluruh nomor unik (tidak ada duplikasi counter)
        $this->assertCount(10, array_unique($generatedNumbers));

        // Pastikan record di tabel nomor_urut terupdate
        $kunci = "register:{$kodeBarang}";
        $record = NomorUrut::where('kunci', $kunci)->first();
        $this->assertNotNull($record);
        $this->assertSame(10, $record->nilai_terakhir);
    }

    public function test_nomor_bast_generator_format_dan_inkremental(): void
    {
        $tahun = 2026;
        $bulan = 10; // Oktober -> X

        $bast1 = $this->bastGenerator->generate($tahun, $bulan);
        $bast2 = $this->bastGenerator->generate($tahun, $bulan);

        $this->assertSame("001/BAST-BMD/KEC-MKM/X/{$tahun}", $bast1);
        $this->assertSame("002/BAST-BMD/KEC-MKM/X/{$tahun}", $bast2);
    }
}
