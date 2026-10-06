<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Enums\UserRole;
use App\Models\Notifikasi;
use App\Models\Pengaturan;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $permissions = ($user && method_exists($user, 'getAllPermissions'))
            ? $user->getAllPermissions()->pluck('name')->toArray()
            : [];

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role instanceof \BackedEnum ? $user->role->value : (string) $user->role,
                    'nip' => $user->nip,
                    'jabatan' => $user->jabatan,
                    'no_hp' => $user->no_hp,
                    'avatar' => $user->avatar,
                    'permissions' => $permissions,
                ] : null,
                'permissions' => $permissions,
            ],
            'pengaturan' => fn () => [
                'nama_instansi' => Pengaturan::get('nama_instansi', 'Kecamatan Mekarmukti'),
                'kabupaten' => Pengaturan::get('kabupaten', 'Kabupaten Garut'),
                'tahun_aktif' => Pengaturan::get('tahun_aktif', date('Y')),
                'app_name' => config('app.name', 'SIMUKTI'),
            ],
            'notif_count' => fn () => $user ? Notifikasi::where('user_id', $user->id)->where('is_read', false)->count() : 0,
            'sidebar_badges' => fn () => $user ? [] : [],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
            ],
        ];
    }
}
