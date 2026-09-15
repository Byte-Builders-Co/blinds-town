<?php

namespace App\Services;

use App\Enums\AdminAlertType;
use App\Models\AdminAlert;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

class AdminAlertService
{
    public function create(AdminAlertType $type, string $title, string $message, ?string $link = null): ?AdminAlert
    {
        try {
            return AdminAlert::query()->create([
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'link' => $link,
            ]);
        } catch (Throwable $exception) {
            Log::error('Failed to record admin alert.', [
                'type' => $type->value,
                'error' => $exception->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Record a "System Error" admin alert for an unexpected, reportable exception.
     * Expected user-facing failures (404s, validation, auth) are intentionally excluded.
     */
    public function reportIfSystemError(Throwable $exception): void
    {
        if (! $this->isNoteworthySystemError($exception)) {
            return;
        }

        $this->create(
            AdminAlertType::SystemError,
            'Unexpected system error',
            $exception::class.': '.$exception->getMessage(),
        );
    }

    public function isNoteworthySystemError(Throwable $exception): bool
    {
        return ! $exception instanceof HttpExceptionInterface
            && ! $exception instanceof ValidationException
            && ! $exception instanceof ModelNotFoundException
            && ! $exception instanceof AuthenticationException
            && ! $exception instanceof AuthorizationException;
    }
}
