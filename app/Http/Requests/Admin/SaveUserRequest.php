<?php

namespace App\Http\Requests\Admin;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use App\Support\Rbac\PermissionCatalog;
use App\Support\Rbac\UserAccess;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

/**
 * Validates the shape of a user form. Whether the signed-in user is allowed to
 * touch this person, or hand out this role or these permissions, is enforced
 * by the controller with {@see UserAccess}.
 */
class SaveUserRequest extends FormRequest
{
    use PasswordValidationRules, ProfileValidationRules;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var User|null $user */
        $user = $this->route('user');

        return [
            ...$this->profileRules($user?->id),
            'mobile_number' => ['nullable', 'string', 'max:20'],
            'password' => $user === null ? $this->passwordRules() : ['nullable', ...array_filter($this->passwordRules(), fn ($rule) => $rule !== 'required')],
            'role' => ['required', Rule::enum(UserRole::class)],
            'status' => ['required', new Enum(UserStatus::class)],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', Rule::in(PermissionCatalog::assignable())],
        ];
    }
}
