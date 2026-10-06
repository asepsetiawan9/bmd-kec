<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Aset;
use App\Models\Pengaturan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Dashboard eksekutif BMD Kecamatan Mekarmukti (SIMUKTI).
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Agregasi statistik aset BMD jika tabel aset sudah ada
        $totalAset = 0;
        $totalNilai = 0;
        $kondisiBaik = 0;
        $kondisiRusakRingan = 0;
        $kondisiRusakBerat = 0;
        $recentAset = [];

        try {
            $totalAset = Aset::count();
            $totalNilai = (float) (Aset::sum('nilai_perolehan') ?? 0);
            $kondisiBaik = Aset::where('kondisi', 'baik')->count();
            $kondisiRusakRingan = Aset::where('kondisi', 'rusak_ringan')->count();
            $kondisiRusakBerat = Aset::where('kondisi', 'rusak_berat')->count();
            $recentAset = Aset::latest()->take(5)->get();
        } catch (\Throwable $e) {
            // Fallback during fresh migration setup
        }

        return Inertia::render('Dashboard/Index', [
            'stats' => [
                'total_aset' => $totalAset,
                'total_nilai' => $totalNilai,
                'kondisi_baik' => $kondisiBaik,
                'kondisi_rusak_ringan' => $kondisiRusakRingan,
                'kondisi_rusak_berat' => $kondisiRusakBerat,
            ],
            'recentAset' => $recentAset,
            'userRole' => $user?->role instanceof \BackedEnum ? $user->role->value : (string) $user?->role,
        ]);
    }
}
