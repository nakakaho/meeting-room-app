<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Sanctum API認証ミドルウェア
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            \App\Http\Middleware\SetLocale::class,
            \App\Http\Middleware\SetLocaleFromRequest::class, // ✅ 追加
        ]);

        // CORS はデフォルトで有効
        $middleware->validateCsrfTokens(except: [
            'api/*', // API routesはCSRF除外
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();