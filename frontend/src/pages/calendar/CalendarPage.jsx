console.log("CalendarPage 表示された");
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/ja';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  Box,
  Container,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,  // ✅ 追加
  Alert,     // ✅ 追加
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import EventFormModal from './EventFormModal';
import './CalendarPage.css';

const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const urlParams = new URLSearchParams(window.location.search);
  const branchIdFromURL = urlParams.get('branch_id');
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [allEvents, setAllEvents] = useState([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formEvent, setFormEvent] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  
  // ✅ Snackbar state 追加
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' // 'success' | 'error' | 'info' | 'warning'
  });
  
  const pollingIntervalRef = useRef(null);
  const isFetchingRef = useRef(false);

  const branchId = (branchIdFromURL ? parseInt(branchIdFromURL) : null) ?? user?.branch_id ?? 1;

  // ✅ Snackbar表示関数
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // ✅ Snackbar閉じる
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // 言語に応じてmomentのロケールを変更
  useEffect(() => {
    moment.locale(i18n.language === 'ja' ? 'ja' : 'en');
  }, [i18n.language]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/users/branch');
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (error) {
      console.error('ユーザー取得エラー:', error);
    }
  }, []);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await api.get('/rooms', { params: { branch_id: branchId } });
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

  const fetchEvents = useCallback(async (silent = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (!silent) {
      setLoading(true);
    }
    
    try {
      const response = await api.get('/events', { params: { branch_id: branchId } });

      if (response.data.success) {
        const formattedEvents = response.data.events.map(event => ({
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
            organizer_name: event.organizer?.name || t('common.unknown') || '不明',
            raw: event,
          }
        }));

        setAllEvents(formattedEvents);
        const filtered = selectedRoom
          ? formattedEvents.filter(e => Number(e.resource.room_id) === Number(selectedRoom))
          : formattedEvents;
        setEvents(filtered);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('予約取得エラー:', error);
      showSnackbar(t('common.fetch_failed') || 'データ取得に失敗しました', 'error'); // ✅ 追加
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [branchId, t]);

  useEffect(() => {
    fetchRooms();
    fetchUsers();
    fetchEvents();
  }, [branchId]);

  useEffect(() => {
    pollingIntervalRef.current = setInterval(() => {
      fetchEvents(true);
    }, 10000);
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchEvents]);

  useEffect(() => {
    if (allEvents.length > 0) {
      const filtered = selectedRoom
        ? allEvents.filter(e => Number(e.resource.room_id) === Number(selectedRoom))
        : allEvents;
      setEvents(filtered);
    }
  }, [selectedRoom, allEvents]);

  const handleSelectEvent = (event) => {
    if (!user) {
      alert(t('auth.login_required') || "ログインが必要です");
      window.location.href = "/login";
      return;
    }
    setFormEvent(event);
    setIsFormModalOpen(true);
  };

  const handleSelectSlot = (slotInfo) => {
    if (!user) {
      alert(t('auth.login_required') || "ログインが必要です");
      window.location.href = "/login";
      return;
    }
    setSelectedSlot(slotInfo);
    setFormEvent(null);
    setIsFormModalOpen(true);
  };

  const handleCreateClick = () => {
    if (!user) {
      alert(t('auth.login_required') || "ログインが必要です");
      window.location.href = "/login";
      return;
    }
    setSelectedSlot(null);
    setFormEvent(null);
    setIsFormModalOpen(true);
  };

  const handleOptimisticCreate = (formData) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticEvent = {
      id: tempId,
      title: rooms.find(r => r.room_id === formData.room_id)?.room_name || t('booking.room') || '会議室',
      start: new Date(formData.start_time),
      end: new Date(formData.end_time),
      resource: {
        organizer_id: user.id,
        room_id: formData.room_id,
        room_name: rooms.find(r => r.room_id === formData.room_id)?.room_name || t('booking.room') || '会議室',
        memo: formData.memo,
        attendees: formData.attendees.map(userId => {
          const u = users.find(usr => usr.id === userId);
          return { user_id: userId, name: u?.name || t('common.unknown') || '不明' };
        }),
        organizer_name: user.name,
        raw: { 
          event_id: tempId, 
          organizer_id: user.id, 
          room_id: formData.room_id, 
          start_time: formData.start_time, 
          end_time: formData.end_time, 
          memo: formData.memo, 
          attendees: formData.attendees.map(userId => {
            const u = users.find(usr => usr.id === userId);
            return { user_id: userId, name: u?.name || t('common.unknown') || '不明' };
          }) 
        }
      },
      isOptimistic: true,
    };
    setAllEvents(prev => [...prev, optimisticEvent]);
    return tempId;
  };

  const handleOptimisticUpdate = (eventId, formData) => {
    setAllEvents(prev => prev.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          title: rooms.find(r => r.room_id === formData.room_id)?.room_name || event.title,
          start: new Date(formData.start_time),
          end: new Date(formData.end_time),
          resource: { 
            ...event.resource, 
            room_id: formData.room_id, 
            room_name: rooms.find(r => r.room_id === formData.room_id)?.room_name || event.resource.room_name, 
            memo: formData.memo, 
            attendees: formData.attendees.map(userId => {
              const u = users.find(usr => usr.id === userId);
              return { user_id: userId, name: u?.name || t('common.unknown') || '不明' };
            }), 
            raw: { 
              ...event.resource.raw, 
              room_id: formData.room_id, 
              start_time: formData.start_time, 
              end_time: formData.end_time, 
              memo: formData.memo, 
              attendees: formData.attendees.map(userId => {
                const u = users.find(usr => usr.id === userId);
                return { user_id: userId, name: u?.name || t('common.unknown') || '不明' };
              }) 
            } 
          },
          isOptimistic: true,
        };
      }
      return event;
    }));
  };

  const handleOptimisticDelete = (eventId) => {
    setAllEvents(prev => prev.filter(event => event.id !== eventId));
  };

  const rollbackOptimisticUpdate = (tempId) => {
    setAllEvents(prev => prev.filter(event => event.id !== tempId));
    showSnackbar(t('booking.save_failed') || '保存に失敗しました', 'error'); // ✅ 追加
  };

  // ✅ 修正: handleModalSubmit
  const handleModalSubmit = async (action, eventId, formData) => {
    // ✅ モーダルを即座に閉じる
    setIsFormModalOpen(false);
    setSelectedSlot(null);
    setFormEvent(null);

    // ✅ 楽観的UI更新
    if (action === 'create') {
      handleOptimisticCreate(formData);
    } else if (action === 'update') {
      handleOptimisticUpdate(eventId, formData);
    } else if (action === 'delete') {
      handleOptimisticDelete(eventId);
    }

    // ✅ データ再取得
    await new Promise(resolve => setTimeout(resolve, 1000));
    await fetchEvents(true);

    // ✅ Snackbar表示
    if (action === 'create') {
      showSnackbar(t('booking.create_success') || '予約を作成しました', 'success');
    } else if (action === 'update') {
      showSnackbar(t('booking.update_success') || '予約を更新しました', 'success');
    } else if (action === 'delete') {
      showSnackbar(t('booking.cancel_success') || '予約をキャンセルしました', 'success');
    }
  };

  const eventStyleGetter = (event) => {
    const organizerId = event.resource?.organizer_id;
    const attendees = event.resource?.attendees || [];

    if (!user) {
      return { style: { backgroundColor: '#39e572ff', borderRadius: '4px', opacity: 0.9, color: 'white', border: '0px', display: 'block', padding: '2px 5px', fontSize: '12px' } };
    }

    const isMyEvent = organizerId === user?.id;
    const isAttendee = attendees.some(a => a.user_id === user?.id);

    let backgroundColor = '#969696ff';
    if (isMyEvent) {
      backgroundColor = '#ff8b1eff';
    } else if (isAttendee) {
      backgroundColor = 'rgba(255, 181, 45, 1)';
    }

    const opacity = event.isOptimistic ? 0.6 : 0.9;
    return { style: { backgroundColor, borderRadius: '4px', opacity, color: 'white', border: '0px', display: 'block', padding: '2px 5px', fontSize: '12px' } };
  };

  const formats = {
    dayFormat: (date, culture, localizer) => localizer.format(date, 'D (ddd)', culture),
    timeGutterFormat: (date, culture, localizer) => localizer.format(date, 'HH:mm', culture),
    eventTimeRangeFormat: ({ start, end }, culture, localizer) => `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`,
  };

  const EventComponent = ({ event }) => (
    <Box sx={{ p: 0.5 }}>
      <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>{event.resource.organizer_name}</Typography>
      <Typography variant="caption" sx={{ fontSize: '10px' }}>{event.title}</Typography>
    </Box>
  );

  const messages = {
    work_week: t('calendar.week_view') || '週',
    today: t('calendar.today') || '今日',
    previous: t('calendar.previous') || '前',
    next: t('calendar.next') || '次',
    showMore: (total) => `+${total} ${t('calendar.more') || '件'}`,
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', gap: 3 }}>
          <CircularProgress size={30} thickness={3} sx={{ color: 'primary.main' }} />
          <Typography variant="h6" color="text.secondary" sx={{ animation: 'pulse 1.5s ease-in-out infinite', '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.5 } } }}>
            {t('common.loading')}
          </Typography>
        </Box>
      ) : (
        <>
          {/* 利用状況 */}
          <Box sx={{ mb: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
              <EventIcon sx={{ color: 'primary.main', fontSize: 28, mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {t('calendar.current_usage') || '現在の利用状況'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', maxWidth: '100%' }}>
              {rooms.map(room => {
                const now = new Date();
                const current = allEvents.filter(e => e.resource.room_id === room.room_id && e.start <= now && e.end >= now);
                const isInUse = current.length > 0;
                return (
                  <Card key={room.room_id} sx={{ width: 150, maxHeight: 110, borderRadius: 3, bgcolor: isInUse ? 'rgba(88, 89, 90, 0.1)' : 'rgba(255, 112, 67, 0.1)', border: `2px solid ${isInUse ? '#58595a' : '#ff7043'}`, display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1, p: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: isInUse ? '#58595a' : '#ff7043', mr: 0.8, flexShrink: 0 }} />
                        <Typography
                          variant="subtitle1"
                          component="div"
                          noWrap
                          sx={{ 
                            m: 0,          // margin 0
                            p: 0,          // padding 0
                            lineHeight: 1, // 行間を詰める
                          }}
                        >
                          {room.room_name}
                        </Typography>
                      </Box>
                      {isInUse ? (
                        <>
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.3 }}>
                            {moment(current[0].start).format('HH:mm')}〜{moment(current[0].end).format('HH:mm')}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                            {current[0].resource.organizer_name}
                          </Typography>
                        </>
                      ) : (
                        <>
                          <Typography variant="caption" color="text.primary" sx={{ mb: 0.3, visibility: 'hidden' }}>
                            --:-- 〜 --:--
                          </Typography>
                          <Typography variant="body2" color="text.primary" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                            {t('calendar.available') || '空き'}
                          </Typography>
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </Box>


        
          {/* 部屋選択 + 新規予約 */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
              {t('calendar.title')}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 2 }}>
              <FormControl sx={{ minWidth: 300 }}>
                <InputLabel>{t('calendar.select_room')}</InputLabel>
                <Select value={selectedRoom} label={t('calendar.select_room')} onChange={(e) => setSelectedRoom(Number(e.target.value))}>
                  <MenuItem value="">{t('calendar.select_room')}</MenuItem>
                  {rooms.map(r => (
                    <MenuItem key={r.room_id} value={r.room_id}>
                      {r.room_name} {r.capacity ? `(${t('room.capacity')}: ${r.capacity})` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="contained" size="large" onClick={handleCreateClick}>
                {t('calendar.new_booking')}
              </Button>
            </Box>
          </Box>


          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {t('calendar.last_update') || '最終更新'}: {moment(lastUpdate).format('HH:mm:ss')}
            </Typography>
            <Button size="small" onClick={() => fetchEvents()} variant="outlined">
              {t('calendar.manual_refresh') || '手動更新'}
            </Button>
          </Box>

          <Box sx={{ bgcolor: 'white', borderRadius: 2, p: 2, boxShadow: 2 }}>
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
              components={{ event: EventComponent }} 
              messages={messages}
              culture={i18n.language === 'ja' ? 'ja' : 'en'}
              style={{ minHeight: '800px', height: 'auto' }} 
            />
          </Box>

          <EventFormModal 
            open={isFormModalOpen} 
            slot={selectedSlot} 
            event={formEvent} 
            defaultRoomId={selectedRoom} 
            rooms={rooms} 
            users={users} 
            onClose={() => { 
              setIsFormModalOpen(false); 
              setSelectedSlot(null); 
              setFormEvent(null); 
            }} 
            onSubmit={handleModalSubmit} 
            onRollback={rollbackOptimisticUpdate} 
          />

          {/* ✅ Snackbar追加 */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{
              width: '100%',
              ...(snackbar.severity === 'success' && {
                backgroundColor: '#e6f4fc',
                color: '#0066cc',
                border: '1px solid #009dff',
              }),
              ...(snackbar.severity === 'error' && {
                backgroundColor: '#ffeded',
                color: '#d80000',
                border: '1px solid #ff0000',
              }),
              ...(snackbar.severity === 'warning' && {
                backgroundColor: '#fff4dd',
                color: '#cc6f00',
                border: '1px solid #ff9800',
              }),
              ...(snackbar.severity === 'info' && {
                backgroundColor: '#eef0ff',
                color: '#1a1a99',
                border: '1px solid #6666ff',
              }),
              fontWeight: 600,
            }}
          >
            {snackbar.message}
          </Alert>
          </Snackbar>
        </>
      )}
    </Container>
  );
};

export default CalendarPage;