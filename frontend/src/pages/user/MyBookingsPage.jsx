import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';
import { eventAPI } from '../../api';
import EventDialog from '../../components/calendar/EventDialog';

const MyBookingsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchMyEvents();
  }, [user]);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getAll(user?.branch_id || 1, user?.id);
      // 開始時刻で昇順ソート
      const sortedEvents = response.data.events.sort(
        (a, b) => new Date(a.start_time) - new Date(b.start_time)
      );
      setEvents(sortedEvents);
    } catch (error) {
      console.error('予約の取得に失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('この予約をキャンセルしますか？')) return;

    try {
      await eventAPI.delete(eventId);
      fetchMyEvents();
    } catch (error) {
      console.error('削除に失敗:', error);
      alert('削除に失敗しました');
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedEvent(null);
  };

  const handleEventSaved = () => {
    fetchMyEvents();
    handleDialogClose();
  };

  const isPastEvent = (endTime) => {
    return new Date(endTime) < new Date();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My予約リスト
      </Typography>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>読み込み中...</Typography>
        </Box>
      ) : events.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">予約がありません</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>日時</TableCell>
                <TableCell>会議室</TableCell>
                <TableCell>時間</TableCell>
                <TableCell>メモ</TableCell>
                <TableCell>ステータス</TableCell>
                <TableCell align="center">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((event) => {
                const past = isPastEvent(event.end_time);
                return (
                  <TableRow
                    key={event.event_id}
                    sx={{ bgcolor: past ? 'grey.100' : 'inherit' }}
                  >
                    <TableCell>
                      {format(parseISO(event.start_time), 'yyyy年M月d日(E)', {
                        locale: ja,
                      })}
                    </TableCell>
                    <TableCell>{event.room_name}</TableCell>
                    <TableCell>
                      {format(parseISO(event.start_time), 'HH:mm')} 〜{' '}
                      {format(parseISO(event.end_time), 'HH:mm')}
                    </TableCell>
                    <TableCell>{event.memo || '-'}</TableCell>
                    <TableCell>
                      {past ? (
                        <Chip label="終了" size="small" />
                      ) : (
                        <Chip label="予約中" color="primary" size="small" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {!past && (
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Button
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleEdit(event)}
                          >
                            編集
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDelete(event.event_id)}
                          >
                            削除
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 予約編集ダイアログ */}
      <EventDialog
        open={dialogOpen}
        event={selectedEvent}
        roomId={selectedEvent?.room_id}
        onClose={handleDialogClose}
        onSaved={handleEventSaved}
      />
    </Container>
  );
};

export default MyBookingsPage;