<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventController;

// ==================== 接続テスト ====================
Route::get('/test', function () {
    // ★ ハードコードせず、拠点テーブルから取得する想定
    $timezone = 'Asia/Tokyo'; // 将来は DB::table('branches')->find(1)->timezone;
    
    return response()->json([
        'message' => 'Laravel API is working!',
        'timestamp' => now()->timezone($timezone)->toDateTimeString(),
        'timezone' => $timezone,
    ]);
});

// ==================== 認証API（認証不要） ====================
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// ==================== 認証API（認証必須） ====================
Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

    // ==================== イベントAPI ====================
    Route::resource('events', EventController::class, [
        'only' => ['index', 'store', 'show', 'update', 'destroy']
    ]);
});