console.log("CalendarPage 表示された");
import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import EventFormModal from './EventFormModal';
import './CalendarPage.css';

// momentのロケール設定
moment.locale('ja', {
  week: {
    dow: 1, // 月曜日を週の最初の日に設定
  },
});

const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const { user } = useAuth();
  const urlParams = new URLSearchParams(window.location.search);
  const branchIdFromURL = urlParams.get('branch_id');
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [allEvents, setAllEvents] = useState([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formEvent, setFormEvent] = useState(null); // 編集時は event オブジェクトを入れる
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  //branch_id が URL にあれば優先してセット
  const branchId =
    (branchIdFromURL ? parseInt(branchIdFromURL) : null) ??
    user?.branch_id ??
    1;

  // 会議室取得
  const fetchRooms = useCallback(async () => {
    try {
      const res = await api.get('/rooms', { params: { branch_id: branchId } 
      });
      if (res.data.success) {
        setRooms(res.data.rooms);
        if (!selectedRoom && res.data.rooms.length > 0) {
          setSelectedRoom(res.data.rooms[0].room_id);
        }
      }
    } catch (error) {
      console.error('部屋取得エラー:', error);
    }
  }, [branchId]);

  // 予約データを取得
  const fetchEvents = useCallback(async (roomId = selectedRoom) => {
    console.log("🔥 fetchEvents 実行 branch:", branchId, " selectedRoom:", selectedRoom);
    try {
      const response = await api.get('/events', {
        params: { branch_id: branchId }
      });

      if (response.data.success) {
        const formattedEvents = response.data.events.map(event => {
          let organizerName = '不明';

          if (event.organizer && event.organizer.name) {
            organizerName = event.organizer.name;
          }

          return {
            id: event.event_id,
            title: event.room_name,
            start: new Date(event.start_time),
            end: new Date(event.end_time),
            resource: {
              organizer_id: event.organizer_id,
              room_id: event.room_id,
              room_name: event.room_name,
              memo: event.memo,
              attendees: event.attendees || [],
              organizer_name: organizerName,
              raw: event,
            }
          };
        });

        console.log("📦 全イベント件数:", formattedEvents.length);

        // 全件保持
        setAllEvents(formattedEvents);

        // フィルタ
        const filtered = selectedRoom
          ? formattedEvents.filter(e => Number(e.resource.room_id) === Number(selectedRoom))
          : formattedEvents;

          console.log("🎯 フィルタ後件数:", filtered.length);

        setEvents(filtered);
      }
    } catch (error) {
      console.error('予約取得エラー:', error);
    }
  }, [branchId]);


  // 選択した部屋が変わったらイベントを再取得（rooms が入った後など）
  useEffect(() => {
    fetchRooms();
    fetchEvents();
  }, [branchId]);

  useEffect(() => {
    if (allEvents.length > 0) {
      const filtered = selectedRoom
        ? allEvents.filter(e => Number(e.resource.room_id) === Number(selectedRoom))
        : allEvents;

      setEvents(filtered);
    }
  }, [selectedRoom, allEvents]);

  // イベントクリック時
  const handleSelectEvent = (event) => {
    if (!user) {
      alert("ログインが必要です");
      window.location.href = "/login";
      return;
    }

    setFormEvent(event);
    setIsFormModalOpen(true);
  };

  // 編集は詳細モーダルからコールされる（selectedEvent はそのまま）
  const handleEditEvent = (event) => {
    // イベントオブジェクト（Calendar用）を元に、編集用の event データを渡す
    setFormEvent(event);
    setIsFormModalOpen(true);
    setIsDetailModalOpen(false);
  };

  // タイムスロット選択時（ドラッグで範囲選択 / クリック）
  const handleSelectSlot = (slotInfo) => {
    if (!user) {
      alert("ログインが必要です");
      window.location.href = "/login";
      return;
    }

    setSelectedSlot(slotInfo);
    setFormEvent(null);
    setIsFormModalOpen(true);
  };

  // 新規作成ボタン
  const handleCreateClick = () => {
    if (!user) {
      alert("ログインが必要です");
      window.location.href = "/login";
      return;
    }

    setSelectedSlot(null);
    setFormEvent(null);
    setIsFormModalOpen(true);
  };

  // イベントのスタイル設定（自分/他人で色分け）
  const eventStyleGetter = (event) => {
    const organizerId = event.resource?.organizer_id;
    const attendees = event.resource?.attendees || [];

    // ⭐ 未ログインは全部青
    if (!user) {
      return {
        style: {
          backgroundColor: '#39e572ff',
          borderRadius: '4px',
          opacity: 0.9,
          color: 'white',
          border: '0px',
          display: 'block',
          padding: '2px 5px',
          fontSize: '12px',
        }
      };
    }

     // ⭐ ログインしてる時の色分け
    const isMyEvent = organizerId === user?.id;
    const isAttendee = attendees.some(a => a.user_id === user?.id);

    let backgroundColor = '#9e9e9e'; // 他人（デフォルト）

    if (isMyEvent) {
      backgroundColor = '#1976d2';   // 主催者（青）
    } else if (isAttendee) {
      backgroundColor = '#ff6830ff';   // 参加者（緑）
    }

    const style = {
      backgroundColor,
      borderRadius: '4px',
      opacity: 0.9,
      color: 'white',
      border: '0px',
      display: 'block',
      padding: '2px 5px',
      fontSize: '12px',
    };

    return { style };
  };

  // カレンダーのフォーマット設定
  const formats = {
    dayFormat: (date, culture, localizer) =>
      localizer.format(date, 'D (ddd)', culture),
    timeGutterFormat: (date, culture, localizer) =>
      localizer.format(date, 'HH:mm', culture),
    eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
      `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`,
  };

  // カスタムイベントコンポーネント（予約者名を表示）
  const EventComponent = ({ event }) => (
    <Box sx={{ p: 0.5 }}>
      <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
        {event.resource.organizer_name}
      </Typography>
      <Typography variant="caption" sx={{ fontSize: '10px' }}>
        {event.title}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* ヘッダー：タイトル + 新規ボタン + 部屋セレクト */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h4">会議室予約カレンダー</Typography>
        </Grid>

        <Grid item xs={8} md={4}>
          <FormControl fullWidth>
            <InputLabel>会議室を選択</InputLabel>
            <Select
              value={selectedRoom}
              label="会議室を選択"
              onChange={(e) => setSelectedRoom(Number(e.target.value))}
            >
              <MenuItem value="">会議室を選択</MenuItem>
              {rooms.map(r => (
                <MenuItem key={r.room_id} value={r.room_id}>
                  {r.room_name} {r.capacity ? `(定員: ${r.capacity})` : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={4} md={2} sx={{ textAlign: 'right' }}>
          <Button variant="contained" onClick={handleCreateClick}>
            新規予約
          </Button>
        </Grid>
      </Grid>

    {/* 現在の利用状況 */}
    <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
        📍 現在の利用状況
      </Typography>

      {rooms.map(room => {
        const now = new Date();

        const current = allEvents.filter(e =>
          e.resource.room_id === room.room_id &&
          e.start <= now &&
          e.end >= now
        );

        return (
          <Typography key={room.room_id} variant="body2" sx={{ mb: 0.5 }}>
            {room.room_name}：
            {current.length > 0 ? (
              <>
                {current[0].resource.organizer_name}
                （{moment(current[0].start).format('HH:mm')}〜
                  {moment(current[0].end).format('HH:mm')}）
              </>
            ) : (
              <>空き</>
            )}
          </Typography>
        );
      })}
    </Box>


      {/* カレンダー */}
      <Box sx={{ bgcolor: 'white', borderRadius: 1, p: 2 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="work_week"
          views={['work_week']}
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
          step={15}
          timeslots={4}
          min={new Date(1970, 1, 1, 9, 0, 0)}
          max={new Date(1970, 1, 1, 22, 0, 0)}
          selectable
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          eventPropGetter={eventStyleGetter}
          formats={formats}
          components={{
            event: EventComponent,
          }}
          messages={{
            work_week: '週',
            today: '今日',
            previous: '前',
            next: '次',
            showMore: (total) => `+${total} 件`,
          }}
          style={{ height: '100%' }}
        />
      </Box>

      {/* 予約作成/編集モーダル */}
      <EventFormModal
        open={isFormModalOpen}
        slot={selectedSlot}
        event={formEvent}           // 編集時のみ渡る
        defaultRoomId={selectedRoom} // 新規作成時に初期会議室をセット
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedSlot(null);
          setFormEvent(null);
        }}
        onSubmit={() => {
          setIsFormModalOpen(false);
          setSelectedSlot(null);
          setFormEvent(null);
          fetchEvents();
        }}
      />
    </Box>
  );
};

export default CalendarPage;
