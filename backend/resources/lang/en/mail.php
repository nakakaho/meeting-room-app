<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Email Messages (English)
    |--------------------------------------------------------------------------
    */

    // Event Created Email
    'event_created' => [
        'subject' => '[NEX-ROOM] Booking Completed',
        'greeting' => 'Hello,',
        'body' => 'Your room booking has been completed.',
        'details' => 'Booking Details',
        'organizer' => 'Organizer',
        'room' => 'Room',
        'datetime' => 'Date & Time',
        'memo' => 'Memo',
        'footer' => 'This is an automated email.',
    ],

    // Event Updated Email
    'event_updated' => [
        'subject' => '[NEX-ROOM] Booking Updated',
        'greeting' => 'Hello,',
        'body' => 'Your room booking has been updated.',
        'details' => 'Updated Booking Details',
        'organizer' => 'Organizer',
        'room' => 'Room',
        'datetime' => 'Date & Time',
        'memo' => 'Memo',
        'footer' => 'This is an automated email.',
    ],

    // Event Cancelled Email
    'event_cancelled' => [
        'subject' => '[NEX-ROOM] Booking Cancelled',
        'greeting' => 'Hello,',
        'body' => 'Your room booking has been cancelled.',
        'details' => 'Cancelled Booking',
        'organizer' => 'Organizer',
        'room' => 'Room',
        'datetime' => 'Date & Time',
        'footer' => 'This is an automated email.',
    ],

    // Password Reset Email
    'password_reset' => [
        'subject' => '【NEX-ROOM】 Password Reset',
        'greeting' => 'Hello,',
        'body' => 'We have received your password reset request.',
        'instruction' => 'Please click the link below to set a new password.',
        'button' => 'Reset Password',
        'expiry' => 'This link is valid for 30 minutes.',
        'no_action' => 'If you did not request a password reset, please ignore this email.',
        'footer' => 'This is an automated email.',
    ],
];