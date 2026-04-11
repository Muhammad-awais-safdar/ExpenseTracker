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
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->alias([
            'verified' => \App\Http\Middleware\EnsureEmailIsVerified::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
            if ($request->is('api/*')) {
                // 1. Validation Errors
                if ($e instanceof \Illuminate\Validation\ValidationException) {
                    return response()->json([
                        'message' => 'The given data was invalid.',
                        'errors' => $e->errors(),
                    ], 422);
                }

                // 2. Authentication Errors
                if ($e instanceof \Illuminate\Auth\AuthenticationException) {
                    return response()->json([
                        'message' => 'Unauthenticated session or token expired.',
                    ], 401);
                }

                // 3. Resource Not Found
                if ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException || 
                    $e instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException) {
                    return response()->json([
                        'message' => 'The requested resource was not found.',
                    ], 404);
                }

                // 4. Authorization Errors
                if ($e instanceof \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException || 
                    $e instanceof \Illuminate\Auth\AccessDeniedException) {
                    return response()->json([
                        'message' => 'This action is unauthorized.',
                    ], 403);
                }

                // 5. Global Logging for Critical Errors (500)
                \Illuminate\Support\Facades\Log::error("API Error: [{$e->getCode()}] {$e->getMessage()}", [
                    'url' => $request->fullUrl(),
                    'method' => $request->method(),
                    'user_id' => auth()->id(),
                    'params' => $request->all(),
                    'trace' => $e->getTraceAsString()
                ]);

                return response()->json([
                    'message' => 'An internal server error occurred.',
                    'error' => config('app.debug') ? $e->getMessage() : 'Internal Server Error',
                    'request_id' => bin2hex(random_bytes(8))
                ], 500);
            }
        });
    })->create();
