import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ja } from 'date-fns/locale';
import { format } from 'date-fns';
import { eventAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

const EventDialog = ({ open, event, roomId, onClose, onSaved }) => {
  const { user } = useAuth();
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [memo, setMemo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (event) {
      setStartTime(new Date(event.start_time));
      setEndTime(new Date(event.end_time));
      setMemo(event.memo || '');
    } else {
      // 新規作成時は現在時刻から1時間後をデフォルト
      const now = new Date();
      now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15);
      setStartTime(now);
      const end = new Date(now);
      end.setHours(end.getHours() + 1);
      setEndTime(end);
      setMemo('');
    }
    setError('');
  }, [event, open]);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      const data = {
        branch_id: user?.branch_id || 1,
        room_id: roomId,
        start_time: format(startTime, 'yyyy-MM-dd HH:mm:ss'),
        end_time: format(endTime, 'yyyy-MM-dd HH:mm:ss'),
        memo,
      };

      if (event) {
        await eventAPI.update(event.event_id, data);
      } else {
        await eventAPI.create(data);
      }

      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || '予約に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('この予約をキャンセルしますか？')) return;

    setLoading(true);
    try {
      await eventAPI.delete(event.event_id);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || '削除に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {event ? '予約を編集' : '新規予約'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <DateTimePicker
              label="開始時間"
              value={startTime}
              onChange={setStartTime}
              minutesStep={15}
              ampm={false}
              slotProps={{ textField: { fullWidth: true } }}
            />

            <DateTimePicker
              label="終了時間"
              value={endTime}
              onChange={setEndTime}
              minutesStep={15}
              ampm={false}
              slotProps={{ textField: { fullWidth: true } }}
            />

            <TextField
              label="メモ（任意）"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              multiline
              rows={3}
              fullWidth
              inputProps={{ maxLength: 150 }}
              helperText={`${memo.length}/150文字`}
            />

            {error && (
              <Box sx={{ color: 'error.main', mt: 1 }}>
                {error}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          {event && (
            <Button onClick={handleDelete} color="error" disabled={loading}>
              削除
            </Button>
          )}
          <Button onClick={onClose} disabled={loading}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {event ? '更新' : '作成'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default EventDialog;