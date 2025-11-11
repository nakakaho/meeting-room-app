<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    /**
     * ユーザー一覧取得（admin専用）
     */
    public function getAllUsers()
    {
        $user = auth()->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => '管理者権限が必要です'
            ], 403);
        }

        $users = User::where('branch_id', $user->branch_id)
                    ->orderBy('created_at', 'desc')
                    ->get();

        return response()->json([
            'success' => true,
            'users' => $users->map(function ($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'role' => $u->role,
                    'created_at' => $u->created_at->toDateTimeString(),
                ];
            })
        ]);
    }

    /**
     * 権限変更（admin専用）
     */
    public function changeRole(Request $request, $id)
    {
        $user = auth()->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => '管理者権限が必要です'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'role' => 'required|in:user,admin',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $targetUser = User::find($id);

        if (!$targetUser) {
            return response()->json([
                'success' => false,
                'message' => 'ユーザーが見つかりません'
            ], 404);
        }

        // 自分自身の権限は変更不可
        if ($targetUser->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => '自分自身の権限は変更できません'
            ], 400);
        }

        // 管理者を一般ユーザーに変更する場合、最後の管理者でないかチェック
        if ($targetUser->role === 'admin' && $request->role === 'user') {
            $adminCount = User::where('branch_id', $user->branch_id)
                             ->where('role', 'admin')
                             ->count();
            
            if ($adminCount <= 1) {
                return response()->json([
                    'success' => false,
                    'message' => '最後の管理者です。管理者は最低1人必要です。'
                ], 400);
            }
        }

        $targetUser->update(['role' => $request->role]);

        return response()->json([
            'success' => true,
            'message' => '権限を変更しました'
        ]);
    }

    /**
     * ユーザー削除（admin専用）
     */
    public function deleteUser($id)
    {
        $user = auth()->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => '管理者権限が必要です'
            ], 403);
        }

        $targetUser = User::find($id);

        if (!$targetUser) {
            return response()->json([
                'success' => false,
                'message' => 'ユーザーが見つかりません'
            ], 404);
        }

        // 自分自身は削除不可
        if ($targetUser->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => '自分自身は削除できません'
            ], 400);
        }

        // adminは削除不可
        if ($targetUser->role === 'admin') {
            return response()->json([
                'success' => false,
                'message' => '管理者アカウントは削除できません'
            ], 400);
        }

        $targetUser->delete();

        return response()->json([
            'success' => true,
            'message' => 'ユーザーを削除しました'
        ]);
    }
}