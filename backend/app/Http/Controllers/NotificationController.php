<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Carbon\Carbon;

class NotificationController extends Controller
{
    /**
     * マイスケジュール通知（5分前）
     */
    public function getMyScheduleNotifications(Request $request)
    {
        $user = auth()->user();

        // 通知設定がOFFの場合は空配列を返す
        if (!$user->notify_my_schedule) {
            return response()->json([
                'success' => true,
                'notifications' => []
            ]);
        }

        $now = Carbon::now();
        $fiveMinutesLater = $now->copy()->addMinutes(5);
        $sixMinutesLater = $now->copy()->addMinutes(6);

        \Log::info('通知チェック', [
            'now' => $now->toDateTimeString(),
            'range_start' => $fiveMinutesLater->toDateTimeString(),
            'range_end' => $sixMinutesLater->toDateTimeString(),
        ]);

        // 5〜6分後に開始する自分の予約を取得
        $events = Event::with(['room', 'organizer'])
            ->where('branch_id', $user->branch_id)
            ->where(function ($query) use ($user) {
                $query->where('organizer_id', $user->id)
                      ->orWhereHas('attendees', function ($q) use ($user) {
                          $q->where('user_id', $user->id);
                      });
            })
            ->whereBetween('start_time', [$fiveMinutesLater, $sixMinutesLater])
            ->get();

        \Log::info('見つかった予約', ['count' => $events->count()]);

        $notifications = $events->map(function ($event) {
            return [
                'type' => 'my_schedule',
                'event_id' => $event->event_id,
                'title' => '予約開始5分前',
                'body' => "{$event->room->room_name} - {$event->start_time->format('H:i')}〜{$event->end_time->format('H:i')}",
                'room_name' => $event->room->room_name,
                'start_time' => $event->start_time->format('Y-m-d H:i:s'),
                'organizer_name' => $event->organizer->name,
            ];
        });

        return response()->json([
            'success' => true,
            'notifications' => $notifications
        ]);
    }

    /**
     * 全室利用状況通知
     */
    public function getAllRoomsNotifications(Request $request)
    {
        $user = auth()->user();

        // 通知設定がOFFの場合は空配列を返す
        if (!$user->notify_all_schedule) {
            return response()->json([
                'success' => true,
                'notifications' => []
            ]);
        }

        $now = Carbon::now();

        // 現在進行中の予約を取得
        $events = Event::with(['room', 'organizer'])
            ->where('branch_id', $user->branch_id)
            ->where('start_time', '<=', $now)
            ->where('end_time', '>=', $now)
            ->get();

        if ($events->isEmpty()) {
            return response()->json([
                'success' => true,
                'notifications' => []
            ]);
        }

        // 全室の利用状況をまとめて通知
        $roomsList = $events->map(function ($event) {
            return "{$event->room->room_name}（{$event->organizer->name}）";
        })->join('、');

        $notifications = [[
            'type' => 'all_rooms',
            'title' => '現在の会議室利用状況',
            'body' => "利用中: {$roomsList}",
            'rooms_count' => $events->count(),
        ]];

        return response()->json([
            'success' => true,
            'notifications' => $notifications
        ]);
    }
}