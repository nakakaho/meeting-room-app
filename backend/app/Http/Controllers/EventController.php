<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class EventController extends Controller
{
    /**
     * 予約一覧取得
     */
    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'branch_id' => 'required|exists:branches,branch_id',
            'user_id' => 'nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $query = Event::with(['organizer', 'room', 'attendees'])
                      ->where('branch_id', $request->branch_id);

        // user_id指定時は、そのユーザーの予約のみ
        if ($request->has('user_id')) {
            $query->where(function($q) use ($request) {
                $q->where('organizer_id', $request->user_id)
                  ->orWhereHas('attendees', function($q2) use ($request) {
                      $q2->where('user_id', $request->user_id);
                  });
            });
        }

        $events = $query->orderBy('start_time', 'asc')->get();

        // レスポンス整形
        $formattedEvents = $events->map(function ($event) {
            return [
                'event_id' => $event->event_id,
                'branch_id' => $event->branch_id,
                'organizer_id' => $event->organizer_id,
                'room_id' => $event->room_id,
                'room_name' => $event->room->room_name,
                'start_time' => $event->start_time->toDateTimeString(),
                'end_time' => $event->end_time->toDateTimeString(),
                'memo' => $event->memo,
                'attendees' => $event->attendees->map(function ($user) {
                    return [
                        'user_id' => $user->id,
                        'name' => $user->name,
                    ];
                }),
            ];
        });

        return response()->json([
            'success' => true,
            'events' => $formattedEvents
        ]);
    }

    /**
     * 予約作成
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'branch_id' => 'required|exists:branches,branch_id',
            'room_id' => 'required|exists:rooms,room_id',
            'start_time' => 'required|date_format:Y-m-d H:i:s',
            'end_time' => 'required|date_format:Y-m-d H:i:s|after:start_time',
            'attendees' => 'nullable|array',
            'attendees.*' => 'integer|exists:users,id|distinct',
            'memo' => 'nullable|string|max:150',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // 15分単位チェック
        $startMinute = date('i', strtotime($request->start_time));
        $endMinute = date('i', strtotime($request->end_time));

        if (!in_array($startMinute, [0, 15, 30, 45]) || !in_array($endMinute, [0, 15, 30, 45])) {
            return response()->json([
                'success' => false,
                'message' => '予約時間は15分単位で指定してください'
            ], 422);
        }

        // 重複チェック
        $overlap = Event::where('room_id', $request->room_id)
            ->where(function ($query) use ($request) {
                $query->whereBetween('start_time', [$request->start_time, $request->end_time])
                      ->orWhereBetween('end_time', [$request->start_time, $request->end_time])
                      ->orWhere(function ($q) use ($request) {
                          $q->where('start_time', '<=', $request->start_time)
                            ->where('end_time', '>=', $request->end_time);
                      });
            })
            ->exists();

        if ($overlap) {
            return response()->json([
                'success' => false,
                'message' => 'この時間帯は既に予約されています'
            ], 400);
        }

        DB::beginTransaction();
        try {
            // 予約作成
            $event = Event::create([
                'branch_id' => $request->branch_id,
                'organizer_id' => auth()->id(),
                'room_id' => $request->room_id,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'memo' => $request->memo,
            ]);

            // 参加者を追加
            if ($request->has('attendees') && is_array($request->attendees)) {
                $event->attendees()->attach($request->attendees);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => '予約を作成しました',
                'event_id' => $event->event_id
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => '予約の作成に失敗しました'
            ], 500);
        }
    }

    /**
     * 予約変更
     */
    public function update(Request $request, $id)
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => '予約が見つかりません'
            ], 404);
        }

        // 権限チェック（本人またはadmin）
        $user = auth()->user();
        if ($event->organizer_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => '権限がありません'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'room_id' => 'required|exists:rooms,room_id',
            'start_time' => 'required|date_format:Y-m-d H:i:s',
            'end_time' => 'required|date_format:Y-m-d H:i:s|after:start_time',
            'attendees' => 'nullable|array',
            'attendees.*' => 'integer|exists:users,id|distinct',
            'memo' => 'nullable|string|max:150',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // 重複チェック（自分以外）
        $overlap = Event::where('room_id', $request->room_id)
            ->where('event_id', '!=', $id)
            ->where(function ($query) use ($request) {
                $query->whereBetween('start_time', [$request->start_time, $request->end_time])
                      ->orWhereBetween('end_time', [$request->start_time, $request->end_time])
                      ->orWhere(function ($q) use ($request) {
                          $q->where('start_time', '<=', $request->start_time)
                            ->where('end_time', '>=', $request->end_time);
                      });
            })
            ->exists();

        if ($overlap) {
            return response()->json([
                'success' => false,
                'message' => 'この時間帯は既に予約されています'
            ], 400);
        }

        DB::beginTransaction();
        try {
            $event->update([
                'room_id' => $request->room_id,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'memo' => $request->memo,
            ]);

            // 参加者を更新
            if ($request->has('attendees')) {
                $event->attendees()->sync($request->attendees);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => '予約を更新しました'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => '予約の更新に失敗しました'
            ], 500);
        }
    }

    /**
     * 予約キャンセル
     */
    public function destroy($id)
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => '予約が見つかりません'
            ], 404);
        }

        // 権限チェック（本人またはadmin）
        $user = auth()->user();
        if ($event->organizer_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => '権限がありません'
            ], 403);
        }

        $event->delete();

        return response()->json([
            'success' => true,
            'message' => '予約をキャンセルしました'
        ]);
    }
}
