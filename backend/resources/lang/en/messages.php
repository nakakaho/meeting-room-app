<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Business Logic Messages (English)
    |--------------------------------------------------------------------------
    */

    // Authentication
    'auth' => [
        'failed' => 'These credentials do not match our records',
        'password_mismatch' => 'Incorrect password',
        'throttle' => 'Too many login attempts. Please try again in :seconds seconds.',
        'unauthorized' => 'Authentication required',
        'forbidden' => 'Access denied',
        'admin_required' => 'Administrator permission required',
        'logged_out' => 'Logged out successfully',
    ],

    // Password Reset
    'password_reset' => [
        'sent' => 'Password reset email has been sent',
        'token_invalid' => 'Invalid token',
        'token_expired' => 'Token has expired',
        'success' => 'Password has been reset',
        'email_subject' => '[Meeting Room Booking System] Password Reset',
        'email_body' => 'We have received your password reset request.\n\nPlease click the link below to set a new password.\n\n:url\n\nThis link is valid for 30 minutes.',
        'email_not_found' => 'This email address is not registered',  // ✅ 追加
        'email_send_failed' => 'Failed to send email',  // ✅ 追加
        'email_required' => 'Email is required',  // ✅ 追加
        'email_invalid_format' => 'Invalid email format',  // ✅ 追加
    ],

    // User Management
    'user' => [
        'created' => 'User registration completed',
        'updated' => 'Information has been updated',
        'deleted' => 'Account has been deleted',
        'not_found' => 'User not found',
        'cannot_delete_admin' => 'Administrator account cannot be deleted',
        'cannot_delete_self' => 'Cannot delete yourself',
        'cannot_change_own_role' => 'Cannot change your own role',
        'last_admin' => 'This is the last administrator. At least one administrator is required.',
    ],

    // Events
    'event' => [
        'created' => 'Booking has been created',
        'updated' => 'Booking has been updated',
        'deleted' => 'Booking has been cancelled',
        'not_found' => 'Booking not found',
        'time_conflict' => 'This time slot is already booked',
        'invalid_time_unit' => 'Booking time must be in 15-minute increments',
        'past_time' => 'Cannot book past time',
        'creation_failed' => 'Failed to create booking',
        'update_failed' => 'Failed to update booking',
    ],

    // Room Management
    'room' => [
        'created' => 'Room has been added',
        'updated' => 'Room has been updated',
        'deleted' => 'Room has been deleted',
        'not_found' => 'Room not found',
        'has_reservations' => 'Cannot delete room with existing bookings',
    ],

    // Notifications
    'notification' => [
        'email_sent' => 'Email notification has been sent',
        'email_failed' => 'Failed to send email',
    ],

    // Settings
    'settings' => [
        'updated' => 'Settings have been updated',
        'language_changed' => 'Language has been changed',
    ],

    // Role Change
    'role' => [
        'changed' => 'Role has been changed',
    ],

    // General
    'success' => 'Success',
    'error' => 'An error occurred',
    'validation_error' => 'Validation error',
    'server_error' => 'Server error occurred',
    'branch_not_found' => 'Branch not found',
    'time_conversion_error' => 'Failed to convert time',
    'password_changed' => 'Password has been changed',

];