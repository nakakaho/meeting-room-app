<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RoomController extends Controller
{
    /**
     * 部屋一覧取得
     */
    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'branch_id' => 'required|exists:branches,branch_id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $rooms = Room::where('branch_id', $request->branch_id)->get();

        return response()->json([
            'success' => true,
            'rooms' => $rooms
        ]);
    }

    /**
     * 部屋追加（admin専用）
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'branch_id' => 'required|exists:branches,branch_id',
            'room_name' => 'required|string|max:20',
            'capacity' => 'required|integer|min:0',
            'facility' => 'nullable|string|max:150',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $room = Room::create($request->all());

        return response()->json([
            'success' => true,
            'message' => '部屋を追加しました',
            'room_id' => $room->room_id
        ], 201);
    }

    /**
     * 部屋編集（admin専用）
     */
    public function update(Request $request, $id)
    {
        $room = Room::find($id);

        if (!$room) {
            return response()->json([
                'success' => false,
                'message' => '部屋が見つかりません'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'room_name' => 'required|string|max:20',
            'capacity' => 'required|integer|min:0',
            'facility' => 'nullable|string|max:150',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $room->update($request->all());

        return response()->json([
            'success' => true,
            'message' => '部屋を更新しました'
        ]);
    }

    /**
     * 部屋削除（admin専用）
     */
    public function destroy($id)
    {
        $room = Room::find($id);

        if (!$room) {
            return response()->json([
                'success' => false,
                'message' => '部屋が見つかりません'
            ], 404);
        }

        // 予約がある部屋は削除不可
        if ($room->events()->exists()) {
            return response()->json([
                'success' => false,
                'message' => '予約がある部屋は削除できません'
            ], 400);
        }

        $room->delete();

        return response()->json([
            'success' => true,
            'message' => '部屋を削除しました'
        ]);
    }
}