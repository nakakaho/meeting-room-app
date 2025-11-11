会議室予約が変更されました

予約者: {{ $organizerName }}
会議室: {{ $roomName }}
日時: {{ $startTime }} 〜 {{ $endTime }}
@if($memo)
メモ: {{ $memo }}
@endif

予約の確認・キャンセルは、会議室予約システムから行ってください。
{{ env('FRONTEND_URL') }}/my-bookings