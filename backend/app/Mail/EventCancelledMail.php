<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EventCancelledMail extends Mailable
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

        return $this->subject(__('mail.event_cancelled.subject'))
                    ->text('emails.event_cancelled')
                    ->with([
                        'greeting' => __('mail.event_cancelled.greeting'),
                        'body' => __('mail.event_cancelled.body'),
                        'details' => __('mail.event_cancelled.details'),
                        'organizerLabel' => __('mail.event_cancelled.organizer'),
                        'organizerName' => $this->organizer->name,
                        'roomLabel' => __('mail.event_cancelled.room'),
                        'roomName' => $this->room->room_name,
                        'datetimeLabel' => __('mail.event_cancelled.datetime'),
                        'startTime' => $startTime,
                        'endTime' => $endTime,
                        'footer' => __('mail.event_cancelled.footer'),
                    ]);
    }
}