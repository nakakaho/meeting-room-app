import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import moment from 'moment';

const EventDetailModal = ({ open, event, onClose, onUpdate, onEdit }) => {
  const { user } = useAuth();

  if (!event) return null;

  const isMyEvent = event.resource.organizer_id === user?.id;
  const isAdmin = user?.role === 'admin';
  const canEdit = isMyEvent || isAdmin;

  const handleDelete = async () => {
    if (!window.confirm('この予約を削除しますか？')) return;

    try {
      const response = await api.delete(`/events/${event.id}`);
      
      if (response.data.success) {
        alert('予約を削除しました');
        onUpdate();
        onClose();
      }
    } catch (error) {
      alert('削除に失敗しました');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        予約詳細
        {isMyEvent && (
          <Chip label="自分の予約" color="primary" size="small" sx={{ ml: 2 }} />
        )}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            会議室
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {event.title}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            予約者
          </Typography>
          <Typography variant="body1">
            {event.resource.organizer_name}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            日時
          </Typography>
          <Typography variant="body1">
            {moment(event.start).format('YYYY/MM/DD (ddd) HH:mm')} 〜 {moment(event.end).format('HH:mm')}
          </Typography>
        </Box>

        {event.resource.attendees && event.resource.attendees.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              参加者
            </Typography>
            {event.resource.attendees.map(attendee => (
              <Chip
                key={attendee.user_id}
                label={attendee.name}
                size="small"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
          </Box>
        )}

        {event.resource.memo && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              メモ
            </Typography>
            <Typography variant="body1">
              {event.resource.memo}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>閉じる</Button>
        {canEdit && (
          <>
            <Button onClick={() => {
              // 編集は親コンポーネントに処理させる（親側でフォームを開く）
              onEdit && onEdit();
            }} color="primary" variant="contained">
              編集
            </Button>
            <Button onClick={handleDelete} color="error">
              削除
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EventDetailModal;
