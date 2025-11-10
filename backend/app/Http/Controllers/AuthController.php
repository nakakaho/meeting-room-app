<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    /**
     * ログイン
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $credentials = $request->only('email', 'password');

        if (!$token = auth()->attempt($credentials)) {
            return response()->json([
                'success' => false,
                'message' => 'メールアドレスまたはパスワードが正しくありません'
            ], 401);
        }

        $user = auth()->user();

        return response()->json([
            'success' => true,
            'token' => $token,
            'user_id' => $user->id,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'branch_id' => $user->branch_id,
            ]
        ]);
    }

    /**
     * 新規登録
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:50',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|max:12',
            'branch_id' => 'nullable|exists:branches,branch_id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // デフォルトでbranch_id=1（東京拠点）を設定
        $branchId = $request->branch_id ?? 1;

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'branch_id' => $branchId,
            'role' => 'user',
            'lang' => 'en',
            'notify_email' => true,
            'notify_my_schedule' => true,
            'notify_all_schedule' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'ユーザー登録が完了しました',
            'user_id' => $user->id
        ], 201);
    }

    /**
     * ログアウト
     */
    public function logout()
    {
        auth()->logout();

        return response()->json([
            'success' => true,
            'message' => 'ログアウトしました'
        ]);
    }

    /**
     * 認証ユーザー情報取得
     */
    public function me()
    {
        $user = auth()->user();

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'branch_id' => $user->branch_id,
                'lang' => $user->lang,
                'notify_email' => $user->notify_email,
                'notify_my_schedule' => $user->notify_my_schedule,
                'notify_all_schedule' => $user->notify_all_schedule,
            ]
        ]);
    }

    /**
     * トークンリフレッシュ
     */
    public function refresh()
    {
        try {
            $token = auth()->refresh();

            return response()->json([
                'success' => true,
                'token' => $token
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'トークンのリフレッシュに失敗しました'
            ], 401);
        }
    }
}