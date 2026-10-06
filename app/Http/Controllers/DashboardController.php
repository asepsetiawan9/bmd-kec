<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardService $dashboardService
    ) {}

    /**
     * Dashboard eksekutif analitik BMD Kecamatan Mekarmukti (SIMUKTI).
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $dashboardData = $this->dashboardService->getDashboardData($user);

        return Inertia::render('Dashboard/Index', [
            'dashboardData' => $dashboardData,
            'userRole' => $user->role instanceof \BackedEnum ? $user->role->value : (string) $user->role,
        ]);
    }
}
