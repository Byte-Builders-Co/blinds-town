<?php

use App\Enums\AdminAlertType;
use App\Services\AdminAlertService;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

test('expected exceptions are not treated as system errors', function () {
    $service = app(AdminAlertService::class);

    expect($service->isNoteworthySystemError(new NotFoundHttpException))->toBeFalse();
    expect($service->isNoteworthySystemError(ValidationException::withMessages([])))->toBeFalse();
    expect($service->isNoteworthySystemError(new ModelNotFoundException))->toBeFalse();
    expect($service->isNoteworthySystemError(new AuthenticationException))->toBeFalse();
});

test('unexpected exceptions are treated as system errors', function () {
    $service = app(AdminAlertService::class);

    expect($service->isNoteworthySystemError(new RuntimeException('Something broke')))->toBeTrue();
});

test('reportIfSystemError records an admin alert for unexpected exceptions', function () {
    app(AdminAlertService::class)->reportIfSystemError(new RuntimeException('Database connection lost'));

    $this->assertDatabaseHas('admin_alerts', [
        'type' => AdminAlertType::SystemError->value,
    ]);
});

test('reportIfSystemError ignores expected exceptions', function () {
    app(AdminAlertService::class)->reportIfSystemError(new NotFoundHttpException);

    $this->assertDatabaseMissing('admin_alerts', ['type' => AdminAlertType::SystemError->value]);
});
