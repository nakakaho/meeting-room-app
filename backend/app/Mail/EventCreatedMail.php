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

    public function __construct($event, $room, $organizer)
    {
        $this->event = $event;
        $this->room = $room;
        $this->organizer = $organizer;
    }

    public function build()
    {
        $startTime = $this->event->start_time->format('Y年m月d日 H:i');
        $endTime = $this->event->end_time->format('H:i');

        return $this->subject('【会議室予約】予約が完了しました')
                    ->text('emails.event_created')
                    ->with([
                        'organizerName' => $this->organizer->name,
                        'roomName' => $this->room->room_name,
                        'startTime' => $startTime,
                        'endTime' => $endTime,
                        'memo' => $this->event->memo,
                    ]);
    }
}