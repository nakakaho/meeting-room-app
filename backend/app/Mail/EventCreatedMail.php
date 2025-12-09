<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EventCreatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $event;
    public $room;
    public $organizer;
    public $locale; // ✅ 言語設定を保持

    public function __construct($event, $room, $organizer, $locale = 'ja')
    {
        $this->event = $event;
        $this->room = $room;
        $this->organizer = $organizer;
        $this->locale = $locale;
    }

    public function build()
    {
        // ✅ タイムゾーン対応の日時フォーマット
        $timezone = $this->room->branch->timezone ?? 'UTC';
        $startTime = $this->event->start_time
            ->setTimezone($timezone)
            ->format($this->locale === 'ja' ? 'Y年m月d日 H:i' : 'Y-m-d H:i');
        $endTime = $this->event->end_time
            ->setTimezone($timezone)
            ->format('H:i');

        return $this->subject(__('mail.event_created.subject'))
                    ->text('emails.event_created')
                    ->with([
                        'greeting' => __('mail.event_created.greeting'),
                        'body' => __('mail.event_created.body'),
                        'details' => __('mail.event_created.details'),
                        'organizerLabel' => __('mail.event_created.organizer'),
                        'organizerName' => $this->organizer->name,
                        'roomLabel' => __('mail.event_created.room'),
                        'roomName' => $this->room->room_name,
                        'datetimeLabel' => __('mail.event_created.datetime'),
                        'startTime' => $startTime,
                        'endTime' => $endTime,
                        'memoLabel' => __('mail.event_created.memo'),
                        'memo' => $this->event->memo ?? '-',
                        'footer' => __('mail.event_created.footer'),
                    ]);
    }
}