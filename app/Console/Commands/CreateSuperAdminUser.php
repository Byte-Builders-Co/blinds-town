<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\User;
use App\Support\Rbac\RbacBootstrap;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;

use function Laravel\Prompts\password;
use function Laravel\Prompts\text;

/**
 * Creates the highest-level account, or promotes an existing user to it.
 *
 * This is the command formerly called `admin:create`. That name still works as
 * an alias so existing scripts and runbooks keep running, but it now creates a
 * Super Admin, because the account it always made is the top-level one.
 */
class CreateSuperAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'superadmin:create
        {--name= : The Super Admin\'s name}
        {--email= : The Super Admin\'s email address}
        {--password= : The Super Admin\'s password}';

    /**
     * Previous names of this command, kept for backward compatibility.
     *
     * @var list<string>
     */
    protected $aliases = ['admin:create'];

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a Super Admin user, or promote an existing user to Super Admin';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        if ($this->input->getFirstArgument() === 'admin:create') {
            $this->components->warn('"admin:create" is now "superadmin:create" and creates a Super Admin. The old name still works but is deprecated.');
        }

        // Make sure the roles exist even on a database that was never seeded.
        RbacBootstrap::ensureRolesAndPermissions();

        $email = $this->option('email') ?: text(
            label: 'Super Admin email address',
            required: true,
            validate: fn (string $value) => Validator::make(
                ['email' => $value],
                ['email' => ['required', 'email']]
            )->errors()->first('email'),
        );

        $existing = User::where('email', $email)->first();

        if ($existing) {
            $existing->forceFill([
                'email_verified_at' => $existing->email_verified_at ?? now(),
            ])->save();

            $existing->syncRoles([UserRole::SuperAdmin->value]);

            $this->components->info("Existing user [{$email}] promoted to Super Admin.");

            return self::SUCCESS;
        }

        $name = $this->option('name') ?: text(
            label: 'Super Admin name',
            required: true,
        );

        $password = $this->option('password') ?: password(
            label: 'Super Admin password',
            required: true,
            validate: fn (string $value) => Validator::make(
                ['password' => $value],
                ['password' => ['required', 'string', 'min:8']]
            )->errors()->first('password'),
        );

        $validator = Validator::make(
            ['name' => $name, 'email' => $email, 'password' => $password],
            [
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', 'unique:users,email'],
                'password' => ['required', 'string', 'min:8'],
            ]
        );

        if ($validator->fails()) {
            $this->components->error($validator->errors()->first());

            return self::FAILURE;
        }

        [$firstName, $lastName] = array_pad(explode(' ', $name, 2), 2, '');

        $superAdmin = (new User)->forceFill([
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $email,
            'password' => $password,
            'email_verified_at' => now(),
        ]);
        $superAdmin->save();

        $superAdmin->assignRole(UserRole::SuperAdmin->value);

        $this->components->info("Super Admin user [{$email}] created.");

        return self::SUCCESS;
    }
}
