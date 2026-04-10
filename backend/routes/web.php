<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

Route::get('/test-page', function () {
    return response(
        '<!doctype html><html><head><meta charset="utf-8"><title>Backend Test</title></head><body style="font-family:Arial,sans-serif;padding:24px;"><h1>Backend is working</h1><p>Expense Tracker test page loaded successfully.</p></body></html>'
    );
});

require __DIR__.'/auth.php';
