<?php

namespace App\Http\Controllers;

use App\Http\Requests\Admin\ChangeRoleRequest;
use App\Models\User;

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
                'message' => __('messages.auth.admin_required')
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
    public function changeRole(ChangeRoleRequest $request, $id)
    {
        $user = auth()->user();

        $targetUser = User::find($id);

        if (!$targetUser) {
            return response()->json([
                'success' => false,
                'message' => __('messages.user.not_found')
            ], 404);
        }

        // 自分自身の権限は変更不可
        if ($targetUser->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => __('messages.user.cannot_change_own_role')
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
                    'message' => __('messages.user.last_admin')
                ], 400);
            }
        }

        $targetUser->update(['role' => $request->role]);

        return response()->json([
            'success' => true,
            'message' => __('messages.role.changed')
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
                'message' => __('messages.auth.admin_required')
            ], 403);
        }

        $targetUser = User::find($id);

        if (!$targetUser) {
            return response()->json([
                'success' => false,
                'message' => __('messages.user.not_found')
            ], 404);
        }

        // 自分自身は削除不可
        if ($targetUser->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => __('messages.user.cannot_delete_self')
            ], 400);
        }

        // adminは削除不可
        if ($targetUser->role === 'admin') {
            return response()->json([
                'success' => false,
                'message' => __('messages.user.cannot_delete_admin')
            ], 400);
        }

        $targetUser->delete();

        return response()->json([
            'success' => true,
            'message' => __('messages.user.deleted')
        ]);
    }
}