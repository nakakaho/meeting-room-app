会議室予約が完了しました

予約者: {{ $organizerName }}
会議室: {{ $roomName }}
日時: {{ $startTime }} 〜 {{ $endTime }}
@if($memo)
メモ: {{ $memo }}
@endif

この予約の変更・キャンセルは、会議室予約システムから行ってください。
{{ env('FRONTEND_URL') }}/my-bookings