<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\EventCreatedMail;
use App\Mail\EventUpdatedMail;
use App\Mail\EventCancelledMail;

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

        // レスポンス整形（拠点のタイムゾーンに変換）
        $formattedEvents = $events->map(function ($event) {
            $branch = $event->branch;
            $timezone = $branch->timezone;
            
            return [
                'event_id' => $event->event_id,
                'branch_id' => $event->branch_id,
                'organizer_id' => $event->organizer_id,
                'room_id' => $event->room_id,
                'room_name' => $event->room->room_name,
                'start_time' => $event->start_time->setTimezone($timezone)->toDateTimeString(),
                'end_time' => $event->end_time->setTimezone($timezone)->toDateTimeString(),
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

        // ✅ DB::beginTransaction()の前にUTC変換を実行
        try {
            $branch = \App\Models\Branch::find($request->branch_id);
            
            if (!$branch) {
                return response()->json([
                    'success' => false,
                    'message' => '拠点情報が見つかりません'
                ], 404);
            }

            $startTime = \Carbon\Carbon::parse($request->start_time, $branch->timezone)
                                        ->setTimezone('UTC')
                                        ->startOfMinute();
            $endTime = \Carbon\Carbon::parse($request->end_time, $branch->timezone)
                                    ->setTimezone('UTC')
                                    ->startOfMinute();

        } catch (\Exception $e) {
            \Log::error('Time conversion error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => '時刻の変換に失敗しました: ' . $e->getMessage()
            ], 400);
        }

        DB::beginTransaction();
        try {
            // ✅ 修正：重複チェック（UTC基準）
            $overlap = Event::where('room_id', $request->room_id)
                ->where('start_time', '<', $endTime)
                ->where('end_time', '>', $startTime)
                ->exists();

            if ($overlap) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'この時間帯は既に予約されています'
                ], 400);
            }
            
            // 予約作成
            $event = Event::create([
                'branch_id' => $request->branch_id,
                'organizer_id' => auth()->id(),
                'room_id' => $request->room_id,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'memo' => $request->memo,
            ]);

            // 参加者を追加
            if ($request->has('attendees') && is_array($request->attendees)) {
                $event->attendees()->attach($request->attendees);
            }

            DB::commit();

            // メール通知送信
            $this->sendEventNotifications($event, 'created');

            return response()->json([
                'success' => true,
                'message' => '予約を作成しました',
                'event_id' => $event->event_id
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Event creation error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => '予約の作成に失敗しました: ' . $e->getMessage()
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

        // 15分単位チェック
        $startMinute = date('i', strtotime($request->start_time));
        $endMinute = date('i', strtotime($request->end_time));
        
        if (!in_array($startMinute, [0, 15, 30, 45]) || !in_array($endMinute, [0, 15, 30, 45])) {
            return response()->json([
                'success' => false,
                'message' => '予約時間は15分単位で指定してください'
            ], 422);
        }

        // ✅ DB::beginTransaction()の前にUTC変換を実行
        try {
            // フロントから送られてきた時刻をUTCに変換（秒を切り捨て）
            $branch = \App\Models\Branch::find($event->branch_id);
            
            if (!$branch) {
                return response()->json([
                    'success' => false,
                    'message' => '拠点情報が見つかりません'
                ], 404);
            }

            $startTime = \Carbon\Carbon::parse($request->start_time, $branch->timezone)
                                        ->setTimezone('UTC')
                                        ->startOfMinute();
            $endTime = \Carbon\Carbon::parse($request->end_time, $branch->timezone)
                                    ->setTimezone('UTC')
                                    ->startOfMinute();

        } catch (\Exception $e) {
            \Log::error('Time conversion error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => '時刻の変換に失敗しました: ' . $e->getMessage()
            ], 400);
        }

        DB::beginTransaction();
        try {
            // ✅ 修正：重複チェック（自分以外、UTC基準）
            $overlap = Event::where('room_id', $request->room_id)
                ->where('event_id', '!=', $id)
                ->where('start_time', '<', $endTime)
                ->where('end_time', '>', $startTime)
                ->exists();

            if ($overlap) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'この時間帯は既に予約されています'
                ], 400);
            }
            
            $event->update([
                'room_id' => $request->room_id,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'memo' => $request->memo,
            ]);

            // 参加者を更新
            if ($request->has('attendees')) {
                $event->attendees()->sync($request->attendees);
            }

            DB::commit();

            // メール通知送信
            $this->sendEventNotifications($event, 'updated');

            return response()->json([
                'success' => true,
                'message' => '予約を更新しました'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Event update error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => '予約の更新に失敗しました: ' . $e->getMessage()
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

        // メール通知用にデータを保存
        $eventData = [
            'start_time' => $event->start_time,
            'end_time' => $event->end_time,
            'room' => $event->room,
            'organizer' => $event->organizer,
        ];

        $event->delete();

        // メール通知送信
        $this->sendCancellationNotifications($eventData);

        return response()->json([
            'success' => true,
            'message' => '予約をキャンセルしました'
        ]);
    }

    /**
     * メール通知を送信
     */
    private function sendEventNotifications($event, $type)
    {
        $event->load(['organizer', 'room', 'attendees']);

        // 送信先リスト
        $recipients = collect();

        // 予約者
        if ($event->organizer->notify_email) {
            $recipients->push($event->organizer->email);
        }

        // 参加者
        foreach ($event->attendees as $attendee) {
            if ($attendee->notify_email) {
                $recipients->push($attendee->email);
            }
        }

        $recipients = $recipients->unique();

        // メール送信
        foreach ($recipients as $email) {
            try {
                if ($type === 'created') {
                    Mail::to($email)->send(new EventCreatedMail($event, $event->room, $event->organizer));
                } elseif ($type === 'updated') {
                    Mail::to($email)->send(new EventUpdatedMail($event, $event->room, $event->organizer));
                }
            } catch (\Exception $e) {
                \Log::error('Mail send error: ' . $e->getMessage());
            }
        }
    }

    /**
     * キャンセル通知を送信
     */
    private function sendCancellationNotifications($eventData)
    {
        try {
            // 仮のEventオブジェクトを作成
            $tempEvent = new Event();
            $tempEvent->start_time = $eventData['start_time'];
            $tempEvent->end_time = $eventData['end_time'];

            Mail::to($eventData['organizer']->email)
                ->send(new EventCancelledMail($tempEvent, $eventData['room'], $eventData['organizer']));
        } catch (\Exception $e) {
            \Log::error('Mail send error: ' . $e->getMessage());
        }
    }
}