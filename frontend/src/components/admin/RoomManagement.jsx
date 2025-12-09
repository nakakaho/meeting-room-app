import { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Typography,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useRoom } from '../../contexts/RoomContext';
import { useAuth } from '../../contexts/AuthContext';

const RoomManagement = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { rooms, getRooms, createRoom, updateRoom, deleteRoom, loading } = useRoom();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  
  const [roomName, setRoomName] = useState('');
  const [capacity, setCapacity] = useState(0);
  const [facility, setFacility] = useState('');

  useEffect(() => {
    if (user?.branch_id) {
      getRooms(user.branch_id);
    }
  }, [user]);

  const handleOpenDialog = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setRoomName(room.room_name);
      setCapacity(room.capacity);
      setFacility(room.facility || '');
    } else {
      setEditingRoom(null);
      setRoomName('');
      setCapacity(0);
      setFacility('');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingRoom(null);
  };

  const handleSave = async () => {
    try {
      const data = {
        branch_id: user?.branch_id || 1,
        room_name: roomName,
        capacity: parseInt(capacity),
        facility: facility || null,
      };

      if (editingRoom) {
        const result = await updateRoom(editingRoom.room_id, data);
        if (!result.success) {
          alert(result.message || t('room.update_failed') || '更新に失敗しました');
          return;
        }
      } else {
        const result = await createRoom(data);
        if (!result.success) {
          alert(result.message || t('room.create_failed') || '作成に失敗しました');
          return;
        }
      }

      getRooms(user?.branch_id);
      handleCloseDialog();
    } catch (error) {
      alert(error.response?.data?.message || t('room.save_failed') || '保存に失敗しました');
    }
  };

  const handleDelete = async (roomId, roomName) => {
    if (!window.confirm(t('room.delete_confirm_message', { name: roomName }) || `${roomName} を削除しますか？`)) return;

    try {
      const result = await deleteRoom(roomId);
      if (!result.success) {
        alert(result.message || t('room.delete_failed') || '削除に失敗しました');
        return;
      }
      getRooms(user?.branch_id);
    } catch (error) {
      alert(error.response?.data?.message || t('room.delete_failed') || '削除に失敗しました');
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '50vh',
          gap: 3
        }}
      >
        <CircularProgress 
          size={30} 
          thickness={3}
          sx={{ color: 'primary.main' }}
        />
        <Typography variant="h6" color="text.secondary" sx={{ 
          animation: 'pulse 1.5s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.5 },
          }
        }}>
          {t('common.loading')}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          {t('room.add_room')}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>{t('room.room_name')}</TableCell>
              <TableCell>{t('room.capacity')}</TableCell>
              <TableCell>{t('room.facilities')}</TableCell>
              <TableCell align="center">{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.room_id}>
                <TableCell>{room.room_id}</TableCell>
                <TableCell>{room.room_name}</TableCell>
                <TableCell>{room.capacity}{t('room.people') || '名'}</TableCell>
                <TableCell>{room.facility || '-'}</TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      sx={{ color: 'secondary.light' }}
                      onClick={() => handleOpenDialog(room)}
                    >
                      {t('common.edit')}
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(room.room_id, room.room_name)}
                    >
                      {t('common.delete')}
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingRoom ? t('room.edit_room') : t('room.add_room')}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label={t('room.room_name')}
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label={t('room.capacity')}
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label={t('room.facilities_optional')}
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
          <Button onClick={handleSave} variant="contained">
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RoomManagement;