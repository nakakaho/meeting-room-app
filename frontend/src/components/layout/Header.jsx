import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logout as LogoutIcon, Settings as SettingsIcon, CalendarMonth, ListAlt, AdminPanelSettings } from '@mui/icons-material';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          会議室予約システム
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button color="inherit" startIcon={<CalendarMonth />} onClick={() => navigate('/calendar')}>
            カレンダー
          </Button>
          <Button color="inherit" startIcon={<ListAlt />} onClick={() => navigate('/my-bookings')}>
            My予約
          </Button>
          {user?.role === 'admin' && (
            <Button color="inherit" startIcon={<AdminPanelSettings />} onClick={() => navigate('/admin')}>
              管理
            </Button>
          )}
          <Button color="inherit" startIcon={<SettingsIcon />} onClick={() => navigate('/settings')}>
            設定
          </Button>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
            ログアウト
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;