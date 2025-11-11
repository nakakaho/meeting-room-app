import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Grid,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { roomAPI, eventAPI } from '../../api';
import WeekCalendar from '../../components/calendar/WeekCalendar';
import EventDialog from '../../components/calendar/EventDialog';

const CalendarPage = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // 部屋一覧取得
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await roomAPI.getAll(user?.branch_id || 1);
        setRooms(response.data.rooms);
        if (response.data.rooms.length > 0) {
          setSelectedRoom(response.data.rooms[0].room_id);
        }
      } catch (error) {
        console.error('部屋の取得に失敗:', error);
      }
    };
    fetchRooms();
  }, [user]);

  // 予約一覧取得
  useEffect(() => {
    if (!selectedRoom) return;
    fetchEvents();
  }, [selectedRoom, currentWeek, user]); // user を依存配列に追加

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getAll(user?.branch_id || 1);
      // 選択中の部屋の予約のみフィルタ
      const filteredEvents = response.data.events.filter(
        (event) => event.room_id === selectedRoom
      );
      setEvents(filteredEvents);
    } catch (error) {
      console.error('予約の取得に失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomChange = (event) => {
    setSelectedRoom(event.target.value);
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setDialogOpen(true);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedEvent(null);
  };

  const handleEventSaved = () => {
    fetchEvents();
    handleDialogClose();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* ヘッダー */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          会議室予約カレンダー
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateEvent}
        >
          新規予約
        </Button>
      </Box>

      {/* 部屋選択 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>会議室を選択</InputLabel>
          <Select
            value={selectedRoom}
            onChange={handleRoomChange}
            label="会議室を選択"
          >
            {rooms.map((room) => (
              <MenuItem key={room.room_id} value={room.room_id}>
                {room.room_name} (定員: {room.capacity}名)
                {room.facility && ` - ${room.facility}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* カレンダー */}
      <Paper sx={{ p: 2 }}>
        {selectedRoom && (
          <WeekCalendar
            events={events}
            loading={loading}
            currentWeek={currentWeek}
            onWeekChange={setCurrentWeek}
            onEventClick={handleEventClick}
          />
        )}
      </Paper>

      {/* 予約作成・編集ダイアログ */}
      <EventDialog
        open={dialogOpen}
        event={selectedEvent}
        roomId={selectedRoom}
        onClose={handleDialogClose}
        onSaved={handleEventSaved}
      />
    </Container>
  );
};

export default CalendarPage;