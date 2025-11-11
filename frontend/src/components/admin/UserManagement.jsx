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
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { adminAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers();
      setUsers(response.data.users);
    } catch (error) {
      console.error('ユーザー一覧の取得に失敗:', error);
      alert('ユーザー一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await adminAPI.changeRole(userId, newRole);
      fetchUsers();
    } catch (error) {
      const errorMessage = error.response?.data?.message || '権限変更に失敗しました';
      alert(errorMessage);
      fetchUsers(); // 元に戻す
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`${userName} を削除しますか？`)) return;

    try {
      await adminAPI.deleteUser(userId);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'ユーザー削除に失敗しました');
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
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>名前</TableCell>
            <TableCell>メールアドレス</TableCell>
            <TableCell>権限</TableCell>
            <TableCell>登録日</TableCell>
            <TableCell align="center">操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  onChange={(e) => handleChangeRole(user.id, e.target.value)}
                  size="small"
                  disabled={user.id === currentUser?.id} // 自分自身のみ変更不可
                >
                  <MenuItem value="user">一般ユーザー</MenuItem>
                  <MenuItem value="admin">管理者</MenuItem>
                </Select>
              </TableCell>
              <TableCell>
                {format(parseISO(user.created_at), 'yyyy/MM/dd')}
              </TableCell>
              <TableCell align="center">
                {user.id !== currentUser?.id && user.role !== 'admin' && (
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteUser(user.id, user.name)}
                  >
                    削除
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserManagement;