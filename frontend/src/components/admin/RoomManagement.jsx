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
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { roomAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

const RoomManagement = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  
  // フォーム
  const [roomName, setRoomName] = useState('');
  const [capacity, setCapacity] = useState(0);
  const [facility, setFacility] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await roomAPI.getAll(user?.branch_id || 1);
      setRooms(response.data.rooms);
    } catch (error) {
      console.error('部屋一覧の取得に失敗:', error);
    } finally {
      setLoading(false);
    }
  };

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
        await roomAPI.update(editingRoom.room_id, data);
      } else {
        await roomAPI.create(data);
      }

      fetchRooms();
      handleCloseDialog();
    } catch (error) {
      alert(error.response?.data?.message || '保存に失敗しました');
    }
  };

  const handleDelete = async (roomId, roomName) => {
    if (!window.confirm(`${roomName} を削除しますか？`)) return;

    try {
      await roomAPI.delete(roomId);
      fetchRooms();
    } catch (error) {
      alert(error.response?.data?.message || '削除に失敗しました');
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>読み込み中...</Typography>
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
          会議室を追加
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>会議室名</TableCell>
              <TableCell>定員</TableCell>
              <TableCell>設備</TableCell>
              <TableCell align="center">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.room_id}>
                <TableCell>{room.room_id}</TableCell>
                <TableCell>{room.room_name}</TableCell>
                <TableCell>{room.capacity}名</TableCell>
                <TableCell>{room.facility || '-'}</TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(room)}
                    >
                      編集
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(room.room_id, room.room_name)}
                    >
                      削除
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 追加・編集ダイアログ */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingRoom ? '会議室を編集' : '会議室を追加'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="会議室名"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="定員"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="設備（任意）"
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>キャンセル</Button>
          <Button onClick={handleSave} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RoomManagement;