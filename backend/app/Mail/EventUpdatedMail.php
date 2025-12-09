<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EventUpdatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $event;
    public $room;
    public $organizer;
    public $locale;

    public function __construct($event, $room, $organizer, $locale = 'ja')
    {
        $this->event = $event;
        $this->room = $room;
        $this->organizer = $organizer;
        $this->locale = $locale;
    }

    public function build()
    {
        $timezone = $this->room->branch->timezone ?? 'UTC';
        $startTime = $this->event->start_time
            ->setTimezone($timezone)
            ->format($this->locale === 'ja' ? 'Y年m月d日 H:i' : 'Y-m-d H:i');
        $endTime = $this->event->end_time
            ->setTimezone($timezone)
            ->format('H:i');

        return $this->subject(__('mail.event_updated.subject'))
                    ->text('emails.event_updated')
                    ->with([
                        'greeting' => __('mail.event_updated.greeting'),
                        'body' => __('mail.event_updated.body'),
                        'details' => __('mail.event_updated.details'),
                        'organizerLabel' => __('mail.event_updated.organizer'),
                        'organizerName' => $this->organizer->name,
                        'roomLabel' => __('mail.event_updated.room'),
                        'roomName' => $this->room->room_name,
                        'datetimeLabel' => __('mail.event_updated.datetime'),
                        'startTime' => $startTime,
                        'endTime' => $endTime,
                        'memoLabel' => __('mail.event_updated.memo'),
                        'memo' => $this->event->memo ?? '-',
                        'footer' => __('mail.event_updated.footer'),
                    ]);
    }
}