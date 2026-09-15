<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;

use function Laravel\Prompts\password;
use function Laravel\Prompts\text;

class CreateAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:create
        {--name= : The admin\'s name}
        {--email= : The admin\'s email address}
        {--password= : The admin\'s password}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create an admin user, or promote an existing user to admin';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = $this->option('email') ?: text(
            label: 'Admin email address',
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

            $existing->syncRoles(['admin']);

            $this->components->info("Existing user [{$email}] promoted to admin.");

            return self::SUCCESS;
        }

        $name = $this->option('name') ?: text(
            label: 'Admin name',
            required: true,
        );

        $password = $this->option('password') ?: password(
            label: 'Admin password',
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

        $admin = (new User)->forceFill([
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $email,
            'password' => $password,
            'email_verified_at' => now(),
        ]);
        $admin->save();

        $admin->assignRole('admin');

        $this->components->info("Admin user [{$email}] created.");

        return self::SUCCESS;
    }
}
