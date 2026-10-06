<?php

use App\Models\User;
use App\Support\Rbac\PermissionCatalog;
use App\Support\Rbac\RbacBootstrap;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * Every permission that some route demands with a "can:" middleware.
 *
 * @return list<string>
 */
function permissionsRequiredByRoutes(): array
{
    return collect(Route::getRoutes()->getRoutes())
        ->flatMap(fn ($route) => $route->gatherMiddleware())
        ->filter(fn ($middleware) => is_string($middleware) && str_starts_with($middleware, 'can:'))
        ->map(fn (string $middleware) => substr($middleware, 4))
        ->unique()
        ->values()
        ->all();
}

test('every permission offered on the user form protects at least one route', function () {
    $unused = array_values(array_diff(PermissionCatalog::all(), permissionsRequiredByRoutes()));

    expect($unused)->toBe([]);
});

test('every permission a route asks for is part of the catalog', function () {
    $unknown = array_values(array_diff(permissionsRequiredByRoutes(), PermissionCatalog::all()));

    expect($unknown)->toBe([]);
});

test('every permission has a plain label and every group a description', function () {
    expect(array_values(array_diff(PermissionCatalog::all(), array_keys(PermissionCatalog::labels()))))->toBe([])
        ->and(array_values(array_diff(array_keys(PermissionCatalog::groups()), array_keys(PermissionCatalog::groupDescriptions()))))->toBe([]);
});

test('the user form receives plain labels and only permissions that change something', function () {
    $superAdmin = User::factory()->superAdmin()->create();

    $this->actingAs($superAdmin)->get(route('admin.users.create'))->assertInertia(fn (AssertableInertia $page) => $page
        ->where('permissionLabels', fn ($labels) => ($labels['orders.update_status'] ?? null) === 'Update order status & tracking')
        ->where('groupDescriptions', fn ($descriptions) => ! empty($descriptions['Orders']))
        ->where('permissionGroups', function ($groups) {
            // Laravel hands closures a Collection, so unwrap it before looking at keys.
            $groups = collect($groups);
            $offered = $groups->flatten()->all();

            return in_array('orders.view', $offered, true)
                // Every staff member gets the dashboard by role, so it is not a choice.
                && ! $groups->has('Dashboard')
                // Super Admin only, never handed out.
                && ! $groups->has('Activity Log')
                && ! $groups->has('Inventory');
        }));
});

test('content and settings are separate permissions', function () {
    $contentEditor = User::factory()->staff()->create();
    $contentEditor->givePermissionTo(['cms.view', 'cms.manage']);

    $settingsEditor = User::factory()->staff()->create();
    $settingsEditor->givePermissionTo(['settings.view', 'settings.manage']);

    $this->actingAs($contentEditor)->get('/admin/cms-pages')->assertOk();
    $this->actingAs($contentEditor)->get('/admin/faqs')->assertOk();
    $this->actingAs($contentEditor)->post('/admin/faqs', ['question' => 'Do you fit blinds?', 'answer' => 'Yes.', 'is_active' => true])->assertRedirect();
    $this->actingAs($contentEditor)->get('/admin/settings/store')->assertForbidden();

    $this->actingAs($settingsEditor)->get('/admin/settings/store')->assertOk();
    $this->actingAs($settingsEditor)->get('/admin/cms-pages')->assertForbidden();
    $this->actingAs($settingsEditor)->get('/admin/faqs')->assertForbidden();
    $this->actingAs($settingsEditor)->post('/admin/faqs', ['question' => 'Q?', 'answer' => 'A.', 'is_active' => true])->assertForbidden();
});

test('retired and super admin only permissions are taken away from every other role', function () {
    foreach (['roles.view', 'inventory.view', 'inventory.manage'] as $legacy) {
        Permission::findOrCreate($legacy);
    }

    Permission::findOrCreate('roles.edit');
    Role::findByName('admin')->givePermissionTo(['roles.view', 'inventory.view', 'roles.edit', 'activity_logs.view']);
    Role::findByName('staff')->givePermissionTo(['activity_logs.view', 'inventory.manage']);

    RbacBootstrap::ensureRolesAndPermissions();

    foreach (['admin', 'staff', 'customer'] as $role) {
        $held = Role::findByName($role)->permissions->pluck('name')->all();

        expect(array_intersect($held, ['roles.view', 'roles.edit', 'activity_logs.view', 'inventory.view', 'inventory.manage']))->toBe([]);
    }

    expect(Role::findByName('super-admin')->hasPermissionTo('activity_logs.view'))->toBeTrue();
});
