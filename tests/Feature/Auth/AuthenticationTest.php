<?php

declare(strict_types=1);

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_active_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create([
            'is_active' => true,
            'role' => UserRole::PENGURUS_BARANG,
        ]);
        $user->assignRole(UserRole::PENGURUS_BARANG->value);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_inactive_users_cannot_authenticate(): void
    {
        $user = User::factory()->create([
            'is_active' => false,
            'role' => UserRole::PENGURUS_BARANG,
        ]);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors(['email']);
    }

    public function test_deactivated_user_session_is_invalidated_by_middleware(): void
    {
        $user = User::factory()->create([
            'is_active' => true,
            'role' => UserRole::PENGURUS_BARANG,
        ]);

        $this->actingAs($user);

        // Nonaktifkan user
        $user->update(['is_active' => false]);

        // Mencoba akses route terproteksi
        $response = $this->get('/dashboard');

        $this->assertGuest();
        $response->assertRedirect('/login');
    }

    public function test_pengurus_barang_can_access_dashboard(): void
    {
        $user = User::factory()->create([
            'is_active' => true,
            'role' => UserRole::PENGURUS_BARANG,
        ]);
        $user->assignRole(UserRole::PENGURUS_BARANG->value);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertStatus(200);
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create([
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }
}
