<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\RefKodeBarang;
use App\Repositories\KodeBarangRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KodeBarangController extends Controller
{
    public function __construct(
        protected KodeBarangRepository $kodeBarangRepository
    ) {}

    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $golongan = $request->query('golongan');

        $query = RefKodeBarang::withCount('aset')
            ->orderBy('kode');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('kode', 'like', "%{$search}%")
                    ->orWhere('uraian', 'like', "%{$search}%");
            });
        }

        if ($golongan) {
            $query->where('golongan_kib', $golongan);
        }

        $kodeBarang = $query->paginate(20)->withQueryString();

        return Inertia::render('Master/KodeBarang/Index', [
            'kodeBarang' => $kodeBarang,
            'filters' => [
                'search' => $search ?? '',
                'golongan' => $golongan ?? '',
            ],
        ]);
    }

    /**
     * Autocomplete search API for select dropdowns.
     */
    public function search(Request $request): JsonResponse
    {
        $keyword = (string) $request->query('q', '');
        $golongan = $request->query('golongan');

        if (empty($keyword) && empty($golongan)) {
            $results = RefKodeBarang::selectable()
                ->orderBy('kode')
                ->limit(20)
                ->get(['id', 'kode', 'uraian', 'golongan_kib']);

            return response()->json($results);
        }

        $query = RefKodeBarang::query()
            ->selectable();

        if (! empty($keyword)) {
            $query->where(function ($q) use ($keyword) {
                $q->where('kode', 'like', "%{$keyword}%")
                    ->orWhere('uraian', 'like', "%{$keyword}%");
            });
        }

        if (! empty($golongan)) {
            $query->where('golongan_kib', $golongan);
        }

        $results = $query->orderBy('kode')
            ->limit(25)
            ->get(['id', 'kode', 'uraian', 'golongan_kib']);

        return response()->json($results);
    }
}
