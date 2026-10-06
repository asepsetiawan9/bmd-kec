<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\GolonganKib;
use App\Enums\KondisiAset;
use App\Enums\StatusAset;
use App\Enums\StatusUsulanPenghapusan;
use App\Models\Aset;
use App\Models\Inventarisasi;
use App\Models\MutasiAset;
use App\Models\Pemeliharaan;
use App\Models\Ruangan;
use App\Models\UsulanPenghapusan;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    /**
     * Dapatkan data agregasi analitik dashboard sesuai peran pengguna.
     *
     * @return array<string, mixed>
     */
    public function getDashboardData(User $user): array
    {
        $role = $user->role instanceof \BackedEnum ? $user->role->value : (string) $user->role;

        return match ($role) {
            'camat' => $this->getCamatDashboard(),
            'penatausaha' => $this->getPenatausahaDashboard(),
            'pemegang' => $this->getPemegangDashboard($user),
            default => $this->getPengurusBarangDashboard(),
        };
    }

    /**
     * Dashboard Varian 1: Camat (Pengguna Barang / Top Executive).
     *
     * @return array<string, mixed>
     */
    public function getCamatDashboard(): array
    {
        $totalAset = Aset::count();
        $totalNilai = (float) (Aset::sum('nilai_perolehan') ?? 0);

        $kondisiBreakdown = [
            'baik' => Aset::where('kondisi', KondisiAset::BAIK)->count(),
            'rusak_ringan' => Aset::where('kondisi', KondisiAset::RUSAK_RINGAN)->count(),
            'rusak_berat' => Aset::where('kondisi', KondisiAset::RUSAK_BERAT)->count(),
        ];

        // Komposisi Aset per Golongan A-F
        $komposisiGolongan = [];
        foreach (GolonganKib::cases() as $gol) {
            $unit = Aset::where('golongan', $gol->value)->count();
            $nilai = (float) (Aset::where('golongan', $gol->value)->sum('nilai_perolehan') ?? 0);
            $komposisiGolongan[] = [
                'golongan' => $gol->value,
                'label' => "Golongan {$gol->value} ({$gol->label()})",
                'unit' => $unit,
                'nilai' => $nilai,
            ];
        }

        // Pending approval Camat
        $pendingApprovalCamat = UsulanPenghapusan::with('items')
            ->where('status', StatusUsulanPenghapusan::DIVERIFIKASI)
            ->latest('tanggal')
            ->get();

        // Top 5 ruangan dengan nilai aset tertinggi
        $ruanganTop = Ruangan::withCount('aset')
            ->withSum('aset', 'nilai_perolehan')
            ->orderByDesc('aset_sum_nilai_perolehan')
            ->take(5)
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'nama' => $r->nama_ruangan,
                'kode' => $r->kode_ruangan,
                'total_unit' => $r->aset_count,
                'total_nilai' => (float) ($r->aset_sum_nilai_perolehan ?? 0),
            ]);

        // Aset kritis rusak berat yang memerlukan perhatian
        $asetRusakBerat = Aset::with(['ruangan', 'pegawai'])
            ->where('kondisi', KondisiAset::RUSAK_BERAT)
            ->latest('updated_at')
            ->take(5)
            ->get();

        return [
            'variant' => 'camat',
            'stats' => [
                'total_aset' => $totalAset,
                'total_nilai' => $totalNilai,
                'kondisi' => $kondisiBreakdown,
                'pending_approval_count' => $pendingApprovalCamat->count(),
            ],
            'komposisiGolongan' => $komposisiGolongan,
            'pendingApproval' => $pendingApprovalCamat,
            'ruanganTop' => $ruanganTop,
            'asetRusakBerat' => $asetRusakBerat,
        ];
    }

    /**
     * Dashboard Varian 2: Penatausaha BMD (Sekcam / Pengelola).
     *
     * @return array<string, mixed>
     */
    public function getPenatausahaDashboard(): array
    {
        $totalAset = Aset::count();
        $totalNilai = (float) (Aset::sum('nilai_perolehan') ?? 0);

        // Pending verifikasi Sekcam
        $pendingVerifikasiSekcam = UsulanPenghapusan::with('items')
            ->where('status', StatusUsulanPenghapusan::DIAJUKAN)
            ->latest('tanggal')
            ->get();

        // Mutasi bulan ini
        $mutasiBulanIni = MutasiAset::whereMonth('tanggal', now()->month)
            ->whereYear('tanggal', now()->year)
            ->count();

        // Sensus aktif
        $opnameAktif = Inventarisasi::withCount(['items as total_items', 'items as dicek_count' => function ($q) {
            $q->where('hasil', '!=', 'belum_dicek');
        }])->where('status', 'berjalan')->first();

        $kondisiBreakdown = [
            'baik' => Aset::where('kondisi', KondisiAset::BAIK)->count(),
            'rusak_ringan' => Aset::where('kondisi', KondisiAset::RUSAK_RINGAN)->count(),
            'rusak_berat' => Aset::where('kondisi', KondisiAset::RUSAK_BERAT)->count(),
        ];

        // 5 Mutasi terkini
        $recentMutasi = MutasiAset::with(['aset', 'keRuangan', 'kePegawai'])
            ->latest('tanggal')
            ->take(5)
            ->get();

        return [
            'variant' => 'penatausaha',
            'stats' => [
                'total_aset' => $totalAset,
                'total_nilai' => $totalNilai,
                'pending_verifikasi_count' => $pendingVerifikasiSekcam->count(),
                'mutasi_bulan_ini' => $mutasiBulanIni,
                'kondisi' => $kondisiBreakdown,
            ],
            'pendingVerifikasi' => $pendingVerifikasiSekcam,
            'opnameAktif' => $opnameAktif,
            'recentMutasi' => $recentMutasi,
        ];
    }

    /**
     * Dashboard Varian 3: Pengurus Barang & Super Admin (Komando Operasional 360°).
     *
     * @return array<string, mixed>
     */
    public function getPengurusBarangDashboard(): array
    {
        $totalAset = Aset::count();
        $totalNilai = (float) (Aset::sum('nilai_perolehan') ?? 0);

        $kondisiBreakdown = [
            'baik' => Aset::where('kondisi', KondisiAset::BAIK)->count(),
            'rusak_ringan' => Aset::where('kondisi', KondisiAset::RUSAK_RINGAN)->count(),
            'rusak_berat' => Aset::where('kondisi', KondisiAset::RUSAK_BERAT)->count(),
        ];

        $statusBreakdown = [
            'aktif' => Aset::where('status', StatusAset::AKTIF)->count(),
            'dipinjam' => Aset::where('status', StatusAset::DIPINJAM)->count(),
            'dalam_perbaikan' => Aset::where('status', StatusAset::DALAM_PERBAIKAN)->count(),
            'diusulkan_hapus' => Aset::where('status', StatusAset::DIUSULKAN_HAPUS)->count(),
            'dihapus' => Aset::where('status', StatusAset::DIHAPUS)->count(),
        ];

        // Biaya pemeliharaan tahun berjalan
        $biayaPemeliharaanTahunIni = (float) (Pemeliharaan::whereYear('tanggal', now()->year)->sum('biaya') ?? 0);

        // Sensus / Opname berjalan
        $opnameAktif = Inventarisasi::withCount(['items as total_items', 'items as dicek_count' => function ($q) {
            $q->where('hasil', '!=', 'belum_dicek');
        }])->where('status', 'berjalan')->first();

        // 5 Aset terbaru
        $recentAset = Aset::with(['ruangan', 'pegawai'])->latest('id')->take(5)->get();

        // 5 Pemeliharaan terbaru
        $recentPemeliharaan = Pemeliharaan::with('aset')->latest('tanggal')->take(5)->get();

        return [
            'variant' => 'pengurus_barang',
            'stats' => [
                'total_aset' => $totalAset,
                'total_nilai' => $totalNilai,
                'kondisi' => $kondisiBreakdown,
                'status' => $statusBreakdown,
                'biaya_pemeliharaan' => $biayaPemeliharaanTahunIni,
            ],
            'opnameAktif' => $opnameAktif,
            'recentAset' => $recentAset,
            'recentPemeliharaan' => $recentPemeliharaan,
        ];
    }

    /**
     * Dashboard Varian 4: Pemegang Aset (Pegawai / Staf).
     *
     * @return array<string, mixed>
     */
    public function getPemegangDashboard(User $user): array
    {
        $pegawaiId = $user->pegawai_id;

        // Aset yang dipegang langsung
        $asetDipegang = $pegawaiId
            ? Aset::with('ruangan')->where('pegawai_id', $pegawaiId)->get()
            : collect();

        // Ruangan tempat pegawai ditugaskan
        $ruangan = $pegawaiId ? Ruangan::where('penanggung_jawab_id', $pegawaiId)->first() : null;
        $asetRuangan = $ruangan ? Aset::where('ruangan_id', $ruangan->id)->get() : collect();

        return [
            'variant' => 'pemegang',
            'stats' => [
                'total_aset_dipegang' => $asetDipegang->count(),
                'total_nilai_dipegang' => (float) $asetDipegang->sum('nilai_perolehan'),
                'kondisi_baik' => $asetDipegang->where('kondisi', KondisiAset::BAIK)->count(),
                'kondisi_rusak' => $asetDipegang->where('kondisi', '!=', KondisiAset::BAIK)->count(),
            ],
            'asetDipegang' => $asetDipegang,
            'ruangan' => $ruangan,
            'asetRuangan' => $asetRuangan,
        ];
    }
}
