<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AdminController;

// ==================== 接続テスト ====================
Route::get('/test', function () {
    return response()->json([
        'message' => 'Laravel API is working!',
        'timestamp' => now()->toDateTimeString(),
        'timezone' => config('app.timezone'),
    ]);
});

// ==================== 認証API（認証不要） ====================
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// ==================== 部屋API（公開） ====================
Route::get('/rooms', [RoomController::class, 'index']);

// ==================== 予約API（一覧は公開） ====================
Route::get('/events', [EventController::class, 'index']);

// ==================== 認証API（認証必須） ====================
Route::middleware('auth:api')->group(function () {
    // 認証
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

    // ユーザー情報
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::put('/users/{id}/settings', [UserController::class, 'updateSettings']);
    Route::post('/users/{id}/password', [UserController::class, 'changePassword']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    
    // 予約（CRUD）
    Route::post('/events', [EventController::class, 'store']);
    Route::put('/events/{id}', [EventController::class, 'update']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);
    
    // 部屋管理（admin専用）
    Route::post('/rooms', [RoomController::class, 'store']);
    Route::put('/rooms/{id}', [RoomController::class, 'update']);
    Route::delete('/rooms/{id}', [RoomController::class, 'destroy']);

    // 管理者専用API
    Route::get('/admin/users', [AdminController::class, 'getAllUsers']);
    Route::patch('/admin/users/{id}/role', [AdminController::class, 'changeRole']);
    Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);
});