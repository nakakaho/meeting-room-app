import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Box,
  OutlinedInput,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import moment from 'moment';

const EventFormModal = ({ open, slot, event, defaultRoomId, onClose, onSubmit }) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const isEdit = !!event;

  const [formData, setFormData] = useState({
    room_id: '',
    start_time: '',
    end_time: '',
    attendees: [],
    memo: '',
  });

  // slot または event を元に初期値を設定
  useEffect(() => {
    if (event) {
      // event は Calendar の event オブジェクト。 resource.raw にオリジナルがある想定
      const raw = event.resource?.raw || {};
      setFormData({
        room_id: raw.room_id || '',
        start_time: raw.start_time ? moment(raw.start_time).format('YYYY-MM-DD HH:mm:ss') : moment(event.start).format('YYYY-MM-DD HH:mm:ss'),
        end_time: raw.end_time ? moment(raw.end_time).format('YYYY-MM-DD HH:mm:ss') : moment(event.end).format('YYYY-MM-DD HH:mm:ss'),
        attendees: raw.attendees ? raw.attendees.map(a => a.user_id) : (raw.attendees || []),
        memo: raw.memo || '',
      });
    } else if (slot) {
      setFormData({
        room_id: defaultRoomId || '',
        start_time: moment(slot.start).format('YYYY-MM-DD HH:mm:ss'),
        end_time: moment(slot.end).format('YYYY-MM-DD HH:mm:ss'),
        attendees: [],
        memo: '',
      });
    } else {
      // 新規ダイアログをボタンから開いた場合
      setFormData({
        room_id: defaultRoomId || '',
        start_time: moment().format('YYYY-MM-DD HH:mm:00'),
        end_time: moment().add(30, 'minutes').format('YYYY-MM-DD HH:mm:00'),
        attendees: [],
        memo: '',
      });
    }
  }, [slot, event, defaultRoomId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 会議室一覧取得
        const roomsRes = await api.get('/rooms', {
          params: { branch_id: user?.branch_id }
        });
        if (roomsRes.data.success) {
          setRooms(roomsRes.data.rooms);
        }

        // ユーザー一覧取得（参加者選択用）
        const usersRes = await api.get('/admin/users');
        if (usersRes.data.success) {
          setUsers(usersRes.data.users);
        }
      } catch (error) {
        console.error('データ取得エラー:', error);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEdit && event) {
        // 編集: PUT /events/:id
        const response = await api.put(`/events/${event.id}`, {
          branch_id: user?.branch_id,
          ...formData,
        });

        if (response.data.success) {
          alert('予約を更新しました');
          onSubmit && onSubmit();
          onClose && onClose();
        }
      } else {
        // 新規作成: POST /events
        const response = await api.post('/events', {
          branch_id: user?.branch_id,
          ...formData,
        });

        if (response.data.success) {
          alert('予約を作成しました');
          onSubmit && onSubmit();
          onClose && onClose();
        }
      }
    } catch (error) {
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else if (error.response?.data?.errors) {
        alert(Object.values(error.response.data.errors).flat().join('\n'));
      } else {
        alert('保存に失敗しました');
      }
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? '予約編集' : '新規予約'}</DialogTitle>

        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>会議室</InputLabel>
            <Select
              value={formData.room_id}
              onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
              required
            >
              {rooms.map(room => (
                <MenuItem key={room.room_id} value={room.room_id}>
                  {room.room_name} (定員: {room.capacity}名)
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="開始日時"
            type="datetime-local"
            value={moment(formData.start_time).format('YYYY-MM-DDTHH:mm')}
            onChange={(e) => setFormData({
              ...formData,
              start_time: moment(e.target.value).format('YYYY-MM-DD HH:mm:ss')
            })}
            InputLabelProps={{ shrink: true }}
            sx={{ mt: 2 }}
            required
          />

          <TextField
            fullWidth
            label="終了日時"
            type="datetime-local"
            value={moment(formData.end_time).format('YYYY-MM-DDTHH:mm')}
            onChange={(e) => setFormData({
              ...formData,
              end_time: moment(e.target.value).format('YYYY-MM-DD HH:mm:ss')
            })}
            InputLabelProps={{ shrink: true }}
            sx={{ mt: 2 }}
            required
          />

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>参加者</InputLabel>
            <Select
              multiple
              value={formData.attendees}
              onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
              input={<OutlinedInput label="参加者" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((userId) => {
                    const userObj = users.find(u => u.id === userId);
                    return <Chip key={userId} label={userObj?.name || userId} size="small" />;
                  })}
                </Box>
              )}
            >
              {users.map(userObj => (
                <MenuItem key={userObj.id} value={userObj.id}>
                  {userObj.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="メモ"
            multiline
            rows={3}
            value={formData.memo}
            onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
            sx={{ mt: 2 }}
            inputProps={{ maxLength: 150 }}
            helperText={`${formData.memo.length}/150`}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>
            キャンセル
          </Button>
          <Button type="submit" variant="contained">
            {isEdit ? '更新' : '予約作成'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EventFormModal;
