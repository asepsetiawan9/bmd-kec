<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\LogAktivitas;
use App\Models\RiwayatAset;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LogAktivitasController extends Controller
{
    /**
     * Tampilkan riwayat audit trail aktivitas pengguna dan mutasi data aset.
     */
    public function index(Request $request): Response
    {
        abort_unless(
            in_array($request->user()->role?->value ?? (string) $request->user()->role, ['super_admin', 'camat', 'penatausaha']),
            403,
            'Akses audit trail hanya untuk Super Admin, Camat, dan Penatausaha.'
        );

        $tab = $request->input('tab', 'sistem'); // 'sistem' (LogAktivitas) atau 'aset' (RiwayatAset)

        $sistemQuery = LogAktivitas::with('user')->latest('id');
        $asetQuery = RiwayatAset::with(['user', 'aset'])->latest('id');

        if ($request->filled('search')) {
            $search = (string) $request->input('search');
            $sistemQuery->where(function ($q) use ($search) {
                $q->where('aksi', 'like', "%{$search}%")
                  ->orWhere('tabel_terkait', 'like', "%{$search}%")
                  ->orWhere('keterangan', 'like', "%{$search}%");
            });

            $asetQuery->where(function ($q) use ($search) {
                $q->where('keterangan', 'like', "%{$search}%")
                  ->orWhereHas('aset', fn ($sub) => $sub->where('nama', 'like', "%{$search}%")->orWhere('kode_barang', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('aksi')) {
            $aksi = (string) $request->input('aksi');
            $sistemQuery->where('aksi', $aksi);
            $asetQuery->where('aksi', $aksi);
        }

        $sistemLogs = $sistemQuery->paginate(20)->withQueryString();
        $asetLogs = $asetQuery->paginate(20)->withQueryString();

        return Inertia::render('AuditTrail/Index', [
            'sistemLogs' => $sistemLogs,
            'asetLogs' => $asetLogs,
            'currentTab' => $tab,
            'filters' => $request->only(['search', 'aksi', 'tab']),
        ]);
    }
}
