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
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useAdmin } from '../../contexts/AdminContext';
import { useAuth } from '../../contexts/AuthContext';

const UserManagement = () => {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const { users, getUsers, changeUserRole, deleteUser, loading } = useAdmin();

  useEffect(() => {
    getUsers();
  }, []);

  const handleChangeRole = async (userId, newRole) => {
    try {
      const result = await changeUserRole(userId, newRole);
      if (!result.success) {
        alert(result.message || t('admin.role_change_failed') || '権限変更に失敗しました');
        getUsers();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || t('admin.role_change_failed') || '権限変更に失敗しました';
      alert(errorMessage);
      getUsers();
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(t('admin.delete_user_confirm', { name: userName }) || `${userName} を削除しますか？`)) return;

    try {
      const result = await deleteUser(userId);
      if (!result.success) {
        alert(result.message || t('admin.delete_user_failed') || 'ユーザー削除に失敗しました');
      }
    } catch (error) {
      alert(error.response?.data?.message || t('admin.delete_user_failed') || 'ユーザー削除に失敗しました');
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
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>{t('admin.username')}</TableCell>
            <TableCell>{t('user.email')}</TableCell>
            <TableCell>{t('admin.role')}</TableCell>
            <TableCell>{t('admin.registration_date')}</TableCell>
            <TableCell align="center">{t('common.actions')}</TableCell>
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
                  disabled={user.id === currentUser?.id}
                >
                  <MenuItem value="user">{t('admin.user_role')}</MenuItem>
                  <MenuItem value="admin">{t('admin.admin_role')}</MenuItem>
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
                    {t('common.delete')}
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