<?php

namespace App\Http\Controllers;

use App\Http\Requests\Room\RoomStoreRequest;
use App\Http\Requests\Room\RoomUpdateRequest;
use App\Models\Room;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    /**
     * 部屋一覧取得
     */
    public function index(Request $request)
    {
        $request->validate([
            'branch_id' => 'required|exists:branches,branch_id',
        ]);

        $rooms = Room::where('branch_id', $request->branch_id)->get();

        return response()->json([
            'success' => true,
            'rooms' => $rooms
        ]);
    }

    /**
     * 部屋追加（admin専用）
     */
    public function store(RoomStoreRequest $request)
    {
        $room = Room::create($request->all());

        return response()->json([
            'success' => true,
            'message' => __('messages.room.created'),
            'room_id' => $room->room_id
        ], 201);
    }

    /**
     * 部屋編集（admin専用）
     */
    public function update(RoomUpdateRequest $request, $id)
    {
        $room = Room::find($id);

        if (!$room) {
            return response()->json([
                'success' => false,
                'message' => __('messages.room.not_found')
            ], 404);
        }

        $room->update($request->all());

        return response()->json([
            'success' => true,
            'message' => __('messages.room.updated')
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
                'message' => __('messages.room.not_found')
            ], 404);
        }

        // 予約がある部屋は削除不可
        if ($room->events()->exists()) {
            return response()->json([
                'success' => false,
                'message' => __('messages.room.has_reservations')
            ], 400);
        }

        $room->delete();

        return response()->json([
            'success' => true,
            'message' => __('messages.room.deleted')
        ]);
    }
}