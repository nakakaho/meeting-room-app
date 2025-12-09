<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public $resetUrl;
    public $locale;

    public function __construct($resetUrl, $locale = 'ja')
    {
        $this->resetUrl = $resetUrl;
        $this->locale = $locale;
    }

    public function build()
    {
        return $this->subject(__('mail.password_reset.subject'))
                    ->text('emails.password_reset')
                    ->with([
                        'greeting' => __('mail.password_reset.greeting'),
                        'body' => __('mail.password_reset.body'),
                        'instruction' => __('mail.password_reset.instruction'),
                        'resetUrl' => $this->resetUrl,
                        'button' => __('mail.password_reset.button'),
                        'expiry' => __('mail.password_reset.expiry'),
                        'noAction' => __('mail.password_reset.no_action'),
                        'footer' => __('mail.password_reset.footer'),
                    ]);
    }
}