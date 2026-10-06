<?php

use App\Enums\UserRole;
use App\Models\ActivityLog;
use App\Models\Order;
use App\Models\User;
use App\Support\Rbac\PermissionCatalog;
use App\Support\Rbac\RbacBootstrap;
use Inertia\Testing\AssertableInertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * @return array<string, mixed>
 */
function userPayload(string $role, array $overrides = []): array
{
    return [
        'first_name' => 'New',
        'last_name' => 'Person',
        'email' => fake()->unique()->safeEmail(),
        'mobile_number' => '555 0100',
        'password' => 'Password-123!',
        'password_confirmation' => 'Password-123!',
        'role' => $role,
        'status' => 'active',
        ...$overrides,
    ];
}

describe('roles and the existing admin upgrade', function () {
    test('the four roles exist and Super Admin holds every permission', function () {
        expect(Role::query()->pluck('name')->all())->toContain('super-admin', 'admin', 'staff', 'customer');

        $superAdmin = Role::findByName('super-admin');

        expect($superAdmin->permissions->pluck('name')->sort()->values()->all())
            ->toBe(collect(PermissionCatalog::all())->sort()->values()->all());
    });

    test('the existing admin is upgraded to super admin in place', function () {
        $admin = User::factory()->admin()->create(['email' => 'owner@example.com']);
        $order = Order::factory()->create(['user_id' => $admin->id]);
        $id = $admin->id;
        $password = $admin->password;

        $promoted = RbacBootstrap::promoteExistingAdmin();

        expect($promoted->is($admin))->toBeTrue();

        $admin->refresh();

        expect($admin->id)->toBe($id)
            ->and($admin->email)->toBe('owner@example.com')
            ->and($admin->password)->toBe($password)
            ->and($admin->getRoleNames()->all())->toBe(['super-admin'])
            ->and($order->fresh()->user_id)->toBe($id)
            ->and(User::query()->where('email', 'owner@example.com')->count())->toBe(1);
    });

    test('the upgrade runs once and leaves every other admin alone', function () {
        $first = User::factory()->admin()->create();
        $second = User::factory()->admin()->create();

        RbacBootstrap::promoteExistingAdmin();
        // Running it again (the migration is safe to repeat) changes nothing.
        expect(RbacBootstrap::promoteExistingAdmin())->toBeNull();

        expect($first->fresh()->isSuperAdmin())->toBeTrue()
            ->and($second->fresh()->isAdmin())->toBeTrue()
            ->and($second->fresh()->isSuperAdmin())->toBeFalse();
    });

    test('the data migration upgrades the admin, keeps staff read access and can be re-run', function () {
        $admin = User::factory()->admin()->create();
        $staff = User::factory()->staff()->create();

        $migration = require database_path('migrations/2026_10_03_120000_upgrade_admin_to_super_admin_and_add_rbac_permissions.php');
        $migration->up();
        $migration->up();

        expect($admin->fresh()->isSuperAdmin())->toBeTrue()
            ->and($staff->fresh()->can('orders.view'))->toBeTrue()
            ->and($staff->fresh()->can('products.view'))->toBeTrue()
            ->and($staff->fresh()->can('orders.refund'))->toBeFalse()
            ->and(User::query()->count())->toBe(2);
    });

    test('admins keep exactly the access they had when permissions move from the role onto each person', function () {
        // The old model: the Admin role itself held every business permission.
        $role = Role::findByName('admin');
        $role->givePermissionTo(PermissionCatalog::assignable());

        $first = User::factory()->create();
        $first->assignRole('admin');
        $second = User::factory()->create();
        $second->assignRole('admin');
        $removed = User::factory()->create();
        $removed->assignRole('admin');
        $removed->delete();
        $staff = User::factory()->staff()->create();
        $staff->givePermissionTo('orders.view');

        $migration = require database_path('migrations/2026_10_03_130000_give_each_admin_their_own_permissions.php');
        $migration->up();
        $migration->up();

        $expected = collect(PermissionCatalog::assignable())->reject(fn ($permission) => $permission === 'dashboard.view')->sort()->values()->all();

        foreach ([$first, $second, User::withTrashed()->find($removed->id)] as $admin) {
            $admin = $admin->fresh() ?? User::withTrashed()->find($admin->id);

            expect($admin->getDirectPermissions()->pluck('name')->sort()->values()->all())->toBe($expected)
                ->and($admin->can('products.delete'))->toBeTrue()
                ->and($admin->can('orders.refund'))->toBeTrue()
                ->and($admin->can('activity_logs.view'))->toBeFalse();
        }

        // The role keeps only what every Admin gets, and nobody else is touched.
        expect(Role::findByName('admin')->permissions->pluck('name')->all())->toBe(['dashboard.view'])
            ->and($staff->fresh()->getDirectPermissions()->pluck('name')->all())->toBe(['orders.view']);
    });

    test('an admin can then be restricted without affecting the others', function () {
        $role = Role::findByName('admin');
        $role->givePermissionTo(PermissionCatalog::assignable());

        $restricted = User::factory()->create();
        $restricted->assignRole('admin');
        $untouched = User::factory()->create();
        $untouched->assignRole('admin');

        (require database_path('migrations/2026_10_03_130000_give_each_admin_their_own_permissions.php'))->up();

        $restricted->fresh()->revokePermissionTo('settings.manage');

        expect($restricted->fresh()->can('settings.manage'))->toBeFalse()
            ->and($untouched->fresh()->can('settings.manage'))->toBeTrue();
    });

    test('a permission taken away from a role is not handed back by a later seed or migration', function () {
        Role::findByName('staff')->revokePermissionTo('dashboard.view');

        RbacBootstrap::ensureRolesAndPermissions();

        expect(Role::findByName('staff')->hasPermissionTo('dashboard.view'))->toBeFalse()
            ->and(Permission::query()->where('name', 'orders.refund')->exists())->toBeTrue();
    });
});

describe('server-side access to the panel', function () {
    test('customers cannot reach any admin url', function (string $url) {
        $customer = User::factory()->create();

        $this->actingAs($customer)->get($url)->assertForbidden();
    })->with(['/admin/dashboard', '/admin/users', '/admin/activity-logs', '/admin/orders', '/admin/products', '/admin/customers']);

    test('guests are sent to login', function () {
        $this->get('/admin/users')->assertRedirect(route('login'));
    });

    test('staff start with the dashboard only and are refused everything else by url', function (string $url) {
        $staff = User::factory()->staff()->create();

        $this->actingAs($staff)->get('/admin/dashboard')->assertOk();
        $this->actingAs($staff)->get($url)->assertForbidden();
    })->with(['/admin/orders', '/admin/products', '/admin/users', '/admin/customers', '/admin/activity-logs', '/admin/reports', '/admin/settings/store']);

    test('staff reach exactly the modules they are given', function () {
        $staff = User::factory()->staff()->create();
        $staff->givePermissionTo('orders.view');
        $order = Order::factory()->create();

        $this->actingAs($staff)->get('/admin/orders')->assertOk();
        $this->actingAs($staff)->get("/admin/orders/{$order->id}")->assertOk();
        $this->actingAs($staff)->patch("/admin/orders/{$order->id}/status", ['status' => 'confirmed'])->assertForbidden();
        $this->actingAs($staff)->get('/admin/products')->assertForbidden();

        $staff->givePermissionTo('orders.update_status');
        $this->actingAs($staff->fresh())->patch("/admin/orders/{$order->id}/status", ['status' => 'confirmed'])->assertRedirect();
    });

    test('products are protected action by action', function () {
        $staff = User::factory()->staff()->create();
        $staff->givePermissionTo('products.view');

        $this->actingAs($staff)->get('/admin/products')->assertOk();
        $this->actingAs($staff)->get('/admin/products/create')->assertForbidden();
        $this->actingAs($staff)->post('/admin/products', [])->assertForbidden();
    });

    test('admins run the business but cannot reach super admin areas', function () {
        $admin = User::factory()->admin()->create();

        foreach (['/admin/dashboard', '/admin/orders', '/admin/products', '/admin/users', '/admin/customers', '/admin/reports'] as $url) {
            $this->actingAs($admin)->get($url)->assertOk();
        }

        $this->actingAs($admin)->get('/admin/activity-logs')->assertForbidden();
    });

    test('super admins reach everything', function () {
        $superAdmin = User::factory()->superAdmin()->create();

        foreach (['/admin/dashboard', '/admin/orders', '/admin/products', '/admin/users', '/admin/activity-logs', '/admin/customers', '/admin/reports', '/admin/settings/store'] as $url) {
            $this->actingAs($superAdmin)->get($url)->assertOk();
        }
    });

    test('customers only ever see their own orders', function () {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $order = Order::factory()->create(['user_id' => $owner->id]);

        $this->actingAs($owner)->get(route('orders.show', $order))->assertOk();
        expect($this->actingAs($other)->get(route('orders.show', $order))->status())->toBeIn([403, 404]);
    });
});

describe('the interface knows the role', function () {
    test('the role label and full permission list are shared with the interface', function () {
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)->get('/admin/dashboard')->assertInertia(fn (AssertableInertia $page) => $page
            ->where('auth.role.label', 'Super Admin')
            ->where('auth.role.panel', 'Super Admin Panel')
            ->where('auth.permissions', fn ($permissions) => collect($permissions)->contains('activity_logs.view')));

        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->get('/admin/dashboard')->assertInertia(fn (AssertableInertia $page) => $page
            ->where('auth.role.label', 'Admin')
            ->where('auth.permissions', fn ($permissions) => ! collect($permissions)->contains('activity_logs.view')));
    });
});

describe('managing users by rank', function () {
    test('a super admin can create admin, staff, customer and super admin accounts', function (string $role) {
        $superAdmin = User::factory()->superAdmin()->create();
        $payload = userPayload($role);

        $this->actingAs($superAdmin)->post(route('admin.users.store'), $payload)->assertRedirect(route('admin.users.index'));

        $created = User::query()->where('email', $payload['email'])->firstOrFail();

        expect($created->highestRole()->value)->toBe($role)
            ->and($created->email_verified_at)->not->toBeNull()
            ->and(ActivityLog::query()->where('action', 'created')->where('subject_id', $created->id)->exists())->toBeTrue();
    })->with(['admin', 'staff', 'customer', 'super-admin']);

    test('an admin can create staff and customers only', function () {
        $admin = User::factory()->admin()->create();

        foreach (['staff', 'customer'] as $role) {
            $this->actingAs($admin)->post(route('admin.users.store'), userPayload($role))->assertRedirect();
        }

        $count = User::query()->count();

        foreach (['admin', 'super-admin'] as $role) {
            $this->actingAs($admin)->post(route('admin.users.store'), userPayload($role))->assertForbidden();
        }

        expect(User::query()->count())->toBe($count);
    });

    test('the role choices offered match the signed in role', function () {
        $labels = fn (User $user) => collect($this->actingAs($user)->get(route('admin.users.create'))->inertiaProps('roles'))->pluck('value')->all();

        expect($labels(User::factory()->superAdmin()->create()))->toBe(['super-admin', 'admin', 'staff', 'customer'])
            ->and($labels(User::factory()->admin()->create()))->toBe(['staff', 'customer']);

        $staff = User::factory()->staff()->create();
        $staff->givePermissionTo(['users.view', 'users.create']);

        expect($labels($staff->fresh()))->toBe(['customer']);
    });

    test('an admin cannot see, edit, change or delete a super admin or another admin', function () {
        $admin = User::factory()->admin()->create();
        $superAdmin = User::factory()->superAdmin()->create();
        $otherAdmin = User::factory()->admin()->create();

        $this->actingAs($admin)->get(route('admin.users.index'))->assertInertia(fn (AssertableInertia $page) => $page
            ->where('users.data', fn ($rows) => collect($rows)->pluck('id')->doesntContain($superAdmin->id)
                && collect($rows)->pluck('id')->doesntContain($otherAdmin->id)));

        foreach ([$superAdmin, $otherAdmin] as $target) {
            $this->actingAs($admin)->get(route('admin.users.edit', $target))->assertForbidden();
            $this->actingAs($admin)->put(route('admin.users.update', $target), userPayload('customer', ['email' => $target->email]))->assertForbidden();
            $this->actingAs($admin)->delete(route('admin.users.destroy', $target))->assertForbidden();
        }

        expect($superAdmin->fresh()->isSuperAdmin())->toBeTrue()
            ->and(User::query()->whereKey($superAdmin->id)->exists())->toBeTrue();
    });

    test('an admin cannot promote themselves or anyone else to super admin', function () {
        $admin = User::factory()->admin()->create();
        $staff = User::factory()->staff()->create();

        $this->actingAs($admin)->put(route('admin.users.update', $admin), userPayload('super-admin', ['email' => $admin->email]))->assertForbidden();
        $this->actingAs($admin)->put(route('admin.users.update', $staff), userPayload('super-admin', ['email' => $staff->email]))->assertForbidden();

        expect($admin->fresh()->isSuperAdmin())->toBeFalse()
            ->and($staff->fresh()->isSuperAdmin())->toBeFalse();
    });

    test('an admin can edit and remove staff and customers', function () {
        $admin = User::factory()->admin()->create();
        $staff = User::factory()->staff()->create();

        $this->actingAs($admin)->put(route('admin.users.update', $staff), userPayload('customer', ['email' => $staff->email]))->assertRedirect();
        expect($staff->fresh()->highestRole()->value)->toBe('customer');

        $this->actingAs($admin)->delete(route('admin.users.destroy', $staff))->assertRedirect();
        expect(User::query()->whereKey($staff->id)->exists())->toBeFalse();
    });

    test('staff with user permissions can only manage customers', function () {
        $staff = User::factory()->staff()->create();
        $staff->givePermissionTo(['users.view', 'users.edit', 'users.delete']);
        $colleague = User::factory()->staff()->create();
        $customer = User::factory()->create();

        $this->actingAs($staff)->get(route('admin.users.edit', $customer))->assertOk();
        $this->actingAs($staff)->get(route('admin.users.edit', $colleague))->assertForbidden();
        $this->actingAs($staff)->put(route('admin.users.update', $customer), userPayload('staff', ['email' => $customer->email]))->assertForbidden();
        $this->actingAs($staff)->delete(route('admin.users.destroy', $colleague))->assertForbidden();
    });

    test('nobody can change their own role, deactivate or delete themselves', function () {
        $superAdmin = User::factory()->superAdmin()->create();
        User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)->put(route('admin.users.update', $superAdmin), userPayload('admin', ['email' => $superAdmin->email]))->assertForbidden();
        $this->actingAs($superAdmin)->put(route('admin.users.update', $superAdmin), userPayload('super-admin', ['email' => $superAdmin->email, 'status' => 'inactive']))->assertForbidden();
        $this->actingAs($superAdmin)->delete(route('admin.users.destroy', $superAdmin))->assertForbidden();

        expect($superAdmin->fresh()->isSuperAdmin())->toBeTrue();
    });

    test('a super admin can edit their own profile details', function () {
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)->put(route('admin.users.update', $superAdmin), userPayload('super-admin', [
            'email' => $superAdmin->email,
            'first_name' => 'Renamed',
            'password' => null,
            'password_confirmation' => null,
        ]))->assertRedirect();

        expect($superAdmin->fresh()->first_name)->toBe('Renamed');
    });

    test('the last super admin can never be demoted, deactivated or deleted', function () {
        $last = User::factory()->superAdmin()->create();
        $admin = User::factory()->admin()->create();

        // Even another super admin working with a single account on record: add one, then remove them.
        $second = User::factory()->superAdmin()->create();
        $this->actingAs($last)->delete(route('admin.users.destroy', $second))->assertRedirect();

        $this->actingAs($admin)->delete(route('admin.users.destroy', $last))->assertForbidden();
        $this->actingAs($last)->delete(route('admin.users.destroy', $last))->assertForbidden();

        expect($last->fresh()->isSuperAdmin())->toBeTrue();
    });

    test('one of two super admins can demote the other, but not once only one remains', function () {
        $first = User::factory()->superAdmin()->create();
        $second = User::factory()->superAdmin()->create();

        $this->actingAs($first)->put(route('admin.users.update', $second), userPayload('admin', ['email' => $second->email]))->assertRedirect();
        expect($second->fresh()->isAdmin())->toBeTrue();

        // $second is now an admin, so $first is the last super admin: no other account may remove them.
        $this->actingAs($second)->put(route('admin.users.update', $first), userPayload('staff', ['email' => $first->email]))->assertForbidden();
        expect($first->fresh()->isSuperAdmin())->toBeTrue();
    });

    test('role changes and deletions are written to the activity log', function () {
        $superAdmin = User::factory()->superAdmin()->create();
        $staff = User::factory()->staff()->create();

        $this->actingAs($superAdmin)->put(route('admin.users.update', $staff), userPayload('admin', ['email' => $staff->email]))->assertRedirect();
        $this->actingAs($superAdmin)->delete(route('admin.users.destroy', $staff))->assertRedirect();

        $log = ActivityLog::query()->where('action', 'role_changed')->firstOrFail();

        expect($log->causer_id)->toBe($superAdmin->id)
            ->and($log->description)->toContain('Super Admin')->toContain('from Staff to Admin')
            ->and($log->properties)->toMatchArray(['from' => 'staff', 'to' => 'admin'])
            ->and(ActivityLog::query()->where('action', 'deleted')->exists())->toBeTrue();
    });

    test('staff modules are granted per person and the change is logged', function () {
        $superAdmin = User::factory()->superAdmin()->create();
        $staff = User::factory()->staff()->create();

        $this->actingAs($superAdmin)->put(route('admin.users.update', $staff), userPayload('staff', [
            'email' => $staff->email,
            'permissions' => ['orders.view', 'products.view'],
        ]))->assertRedirect();

        $staff = $staff->fresh();

        expect($staff->can('orders.view'))->toBeTrue()
            ->and($staff->can('products.view'))->toBeTrue()
            ->and($staff->can('users.view'))->toBeFalse()
            ->and(ActivityLog::query()->where('action', 'permissions_updated')->exists())->toBeTrue();

        $this->actingAs($staff)->get('/admin/orders')->assertOk();

        // Turning a permission off takes the access away again.
        $this->actingAs($superAdmin)->put(route('admin.users.update', $staff), userPayload('staff', [
            'email' => $staff->email,
            'permissions' => ['products.view'],
        ]))->assertRedirect();

        $this->actingAs($staff->fresh())->get('/admin/orders')->assertForbidden();
    });

    test('permissions cannot be used to escalate privilege', function () {
        $admin = User::factory()->admin()->create();
        $staff = User::factory()->staff()->create();

        // Super Admin-only permissions are refused outright...
        $this->actingAs($admin)->put(route('admin.users.update', $staff), userPayload('staff', [
            'email' => $staff->email,
            'permissions' => ['activity_logs.view'],
        ]))->assertSessionHasErrors('permissions.0');

        // ...and an admin cannot hand out a permission they do not hold themselves.
        $admin->revokePermissionTo('reports.view');

        $this->actingAs($admin->fresh())->put(route('admin.users.update', $staff), userPayload('staff', [
            'email' => $staff->email,
            'permissions' => ['orders.view', 'reports.view'],
        ]))->assertRedirect();

        expect($staff->fresh()->can('orders.view'))->toBeTrue()
            ->and($staff->fresh()->can('reports.view'))->toBeFalse();
    });

    test('a super admin chooses what each new admin may do', function () {
        $superAdmin = User::factory()->superAdmin()->create();
        $payload = userPayload('admin', ['permissions' => ['orders.view', 'orders.update_status']]);

        $this->actingAs($superAdmin)->post(route('admin.users.store'), $payload)->assertRedirect();

        $admin = User::query()->where('email', $payload['email'])->firstOrFail();

        expect($admin->isAdmin())->toBeTrue()
            ->and($admin->getDirectPermissions()->pluck('name')->sort()->values()->all())->toBe(['orders.update_status', 'orders.view']);

        $this->actingAs($admin)->get('/admin/dashboard')->assertOk();
        $this->actingAs($admin)->get('/admin/orders')->assertOk();
        $this->actingAs($admin)->get('/admin/products')->assertForbidden();
        $this->actingAs($admin)->get('/admin/users')->assertForbidden();
        $this->actingAs($admin)->get('/admin/reports')->assertForbidden();
        $this->actingAs($admin)->get('/admin/settings/store')->assertForbidden();
    });

    test('an admin given every permission runs the business but never reaches super admin areas', function () {
        $superAdmin = User::factory()->superAdmin()->create();
        $payload = userPayload('admin', ['permissions' => PermissionCatalog::assignable()]);

        $this->actingAs($superAdmin)->post(route('admin.users.store'), $payload)->assertRedirect();

        $admin = User::query()->where('email', $payload['email'])->firstOrFail();

        foreach (['/admin/dashboard', '/admin/orders', '/admin/products', '/admin/users', '/admin/customers', '/admin/reports', '/admin/settings/store', '/admin/faqs', '/admin/coupons'] as $url) {
            $this->actingAs($admin)->get($url)->assertOk();
        }

        $this->actingAs($admin)->get('/admin/activity-logs')->assertForbidden();
    });

    test('an admin created with no ticks can only open the dashboard', function () {
        $superAdmin = User::factory()->superAdmin()->create();
        $payload = userPayload('admin');

        $this->actingAs($superAdmin)->post(route('admin.users.store'), $payload)->assertRedirect();

        $admin = User::query()->where('email', $payload['email'])->firstOrFail();

        $this->actingAs($admin)->get('/admin/dashboard')->assertOk();
        $this->actingAs($admin)->get('/admin/orders')->assertForbidden();
    });

    test('an admin\'s permissions can be changed later, and the change is logged', function () {
        $superAdmin = User::factory()->superAdmin()->create();
        $admin = User::factory()->admin()->create();

        expect($admin->can('products.delete'))->toBeTrue();

        $this->actingAs($superAdmin)->put(route('admin.users.update', $admin), userPayload('admin', [
            'email' => $admin->email,
            'permissions' => ['orders.view', 'products.view'],
        ]))->assertRedirect();

        $admin = $admin->fresh();

        expect($admin->can('orders.view'))->toBeTrue()
            ->and($admin->can('products.delete'))->toBeFalse()
            ->and($admin->can('users.view'))->toBeFalse();

        $this->actingAs($admin)->get('/admin/products')->assertOk();
        $this->actingAs($admin)->get('/admin/products/create')->assertForbidden();
        $this->actingAs($admin)->get('/admin/users')->assertForbidden();

        $log = ActivityLog::query()->where('action', 'permissions_updated')->latest('id')->firstOrFail();

        expect($log->causer_id)->toBe($superAdmin->id)
            ->and($log->properties['removed'])->toContain('products.delete');
    });

    test('an admin without user permissions cannot manage staff even though they outrank them', function () {
        $superAdmin = User::factory()->superAdmin()->create();
        $admin = User::factory()->admin()->create();
        $admin->syncPermissions(['orders.view']);
        $staff = User::factory()->staff()->create();

        $this->actingAs($admin)->get('/admin/users')->assertForbidden();
        $this->actingAs($admin)->put(route('admin.users.update', $staff), userPayload('staff', ['email' => $staff->email]))->assertForbidden();
    });

    test('only a super admin can change another admin\'s permissions', function () {
        $admin = User::factory()->admin()->create();
        $other = User::factory()->admin()->create();

        $this->actingAs($admin)->put(route('admin.users.update', $other), userPayload('admin', [
            'email' => $other->email,
            'permissions' => ['dashboard.view'],
        ]))->assertForbidden();

        expect($other->fresh()->can('products.delete'))->toBeTrue();
    });

    test('the form receives an admin\'s current permissions to show', function () {
        $superAdmin = User::factory()->superAdmin()->create();
        $admin = User::factory()->admin()->create();
        $admin->syncPermissions(['orders.view', 'reports.view']);

        $this->actingAs($superAdmin)->get(route('admin.users.edit', $admin))->assertInertia(fn (AssertableInertia $page) => $page
            ->where('user.role', 'admin')
            ->where('user.permissions', fn ($permissions) => collect($permissions)->sort()->values()->all() === ['orders.view', 'reports.view']));
    });

    test('moving a person out of admin or staff drops their individual permissions', function (string $from) {
        $superAdmin = User::factory()->superAdmin()->create();
        $person = User::factory()->{$from}()->create();
        $person->syncPermissions(['orders.view']);

        $this->actingAs($superAdmin)->put(route('admin.users.update', $person), userPayload('customer', ['email' => $person->email]))->assertRedirect();

        expect($person->fresh()->getDirectPermissions())->toHaveCount(0)
            ->and($person->fresh()->isCustomer())->toBeTrue();
    })->with(['admin', 'staff']);

});

test('there is no separate roles and permissions screen: access is set per person on the user form', function () {
    $superAdmin = User::factory()->superAdmin()->create();

    $this->actingAs($superAdmin)->get('/admin/roles')->assertNotFound();
    $this->actingAs($superAdmin)->put('/admin/roles/1', ['permissions' => []])->assertNotFound();
});

describe('activity log screen', function () {
    test('super admins can browse and filter the log', function () {
        $superAdmin = User::factory()->superAdmin()->create();
        ActivityLog::record('created', null, 'Created a thing');
        ActivityLog::record('deleted', null, 'Deleted another thing');

        $this->actingAs($superAdmin)->get(route('admin.activity-logs.index', ['action' => 'deleted']))->assertInertia(fn (AssertableInertia $page) => $page
            ->has('logs.data', 1)
            ->where('logs.data.0.description', 'Deleted another thing'));
    });
});

describe('the superadmin:create command', function () {
    test('creates a super admin', function () {
        $this->artisan('superadmin:create', ['--name' => 'Top Owner', '--email' => 'owner@example.com', '--password' => 'password123'])->assertSuccessful();

        $user = User::query()->where('email', 'owner@example.com')->firstOrFail();

        expect($user->isSuperAdmin())->toBeTrue()
            ->and($user->email_verified_at)->not->toBeNull();

        $this->actingAs($user)->get('/admin/activity-logs')->assertOk();
    });

    test('promotes an existing account without creating a duplicate', function () {
        $existing = User::factory()->admin()->create(['email' => 'boss@example.com']);

        $this->artisan('superadmin:create', ['--email' => 'boss@example.com'])->assertSuccessful();

        expect($existing->fresh()->isSuperAdmin())->toBeTrue()
            ->and(User::query()->where('email', 'boss@example.com')->count())->toBe(1);
    });

    test('the old admin:create name still works as a deprecated alias', function () {
        $this->artisan('admin:create', ['--name' => 'Legacy', '--email' => 'legacy@example.com', '--password' => 'password123'])
            ->expectsOutputToContain('now "superadmin:create"')
            ->assertSuccessful();

        expect(User::query()->where('email', 'legacy@example.com')->firstOrFail()->isSuperAdmin())->toBeTrue();
    });
});

test('the highest role wins when a user holds several', function () {
    $user = User::factory()->staff()->create();
    $user->assignRole('admin');

    expect(UserRole::highestFor($user)->value)->toBe('admin')
        ->and(UserRole::SuperAdmin->rank())->toBeGreaterThan(UserRole::Admin->rank())
        ->and(UserRole::Admin->rank())->toBeGreaterThan(UserRole::Staff->rank())
        ->and(UserRole::Staff->rank())->toBeGreaterThan(UserRole::Customer->rank());
});
