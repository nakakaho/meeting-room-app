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
        try {
            $user = auth()->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => '認証エラー'
                ], 401);
            }

            if (!$user->notify_my_schedule) {
                return response()->json([
                    'success' => true,
                    'events' => []
                ]);
            }

            $now = Carbon::now();
            $fiveMinutesLater = $now->copy()->addMinutes(5);
            $sixMinutesLater = $now->copy()->addMinutes(6);

            \Log::info('マイ予約通知チェック', [
                'now' => $now->toDateTimeString(),
                'range_start' => $fiveMinutesLater->toDateTimeString(),
                'range_end' => $sixMinutesLater->toDateTimeString(),
            ]);

            // 5〜6分後に開始する自分の予約を取得
            $events = Event::with(['room.branch', 'organizer'])
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
                $tz = $event->room?->branch?->timezone ?? 'UTC';

                $start = Carbon::parse($event->start_time)->setTimezone($tz)->format('H:i');
                $end = Carbon::parse($event->end_time)->setTimezone($tz)->format('H:i');

                return [
                    'type' => 'my_schedule',
                    'event_id' => $event->event_id,
                    'room_name' => $event->room->room_name ?? '不明',
                    'start_time' => $event->start_time,
                    'end_time' => $event->end_time,
                    'timezone' => $tz,
                    'organizer_name' => $event->organizer->name ?? '不明',
                ];
            });

            return response()->json([
                'success' => true,
                'events' => $notifications
            ]);

        } catch (\Exception $e) {
            \Log::error('マイ予約通知エラー', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 全室利用状況通知
     */
    // public function getAllRoomsNotifications(Request $request)
    // {
    //     try {
    //         $user = auth()->user();

    //         if (!$user) {
    //             return response()->json([
    //                 'success' => false,
    //                 'message' => '認証エラー'
    //             ], 401);
    //         }

    //         if (!$user->notify_all_schedule) {
    //             return response()->json([
    //                 'success' => true,
    //                 'events' => []
    //             ]);
    //         }

    //         $now = Carbon::now();

    //         // 現在利用中の予約を取得
    //         $events = Event::with(['room.branch', 'organizer'])
    //             ->where('branch_id', $user->branch_id)
    //             ->where('start_time', '<=', $now)
    //             ->where('end_time', '>=', $now)
    //             ->get();

    //         $activeEventsList = $events->map(function ($event) {
    //             $tz = $event->room?->branch?->timezone ?? 'UTC';

    //             return [
    //                 'event_id' => $event->event_id,
    //                 'room_id' => $event->room_id,
    //                 'room_name' => $event->room->room_name ?? '不明',
    //                 'organizer_name' => $event->organizer->name ?? '不明',
    //                 'start_time' => $event->start_time,
    //                 'end_time' => $event->end_time,
    //                 'timezone' => $tz,
    //             ];
    //         });

    //         return response()->json([
    //             'success' => true,
    //             'events' => $activeEventsList
    //         ]);

    //     } catch (\Exception $e) {
    //         \Log::error('全室通知エラー', [
    //             'error' => $e->getMessage(),
    //             'trace' => $e->getTraceAsString()
    //         ]);

    //         return response()->json([
    //             'success' => false,
    //             'message' => $e->getMessage()
    //         ], 500);
    //     }
    // }
}