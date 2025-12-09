import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem } from '@mui/material';
import { 
  Logout as LogoutIcon, 
  Login as LoginIcon,
  Settings as SettingsIcon, 
  CalendarToday, 
  EventNote,
  ListAlt, 
  AdminPanelSettings,
  Language
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import api from '../../api/axios';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [langAnchor, setLangAnchor] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // ● 言語メニュー
  const handleLangClick = (e) => setLangAnchor(e.currentTarget);
  const handleLangClose = () => setLangAnchor(null);

  const handleLangChange = async (lang) => {
    i18n.changeLanguage(lang);

    if (user) {
      try {
        await api.put(`/users/${user.id}/settings`, {
          lang: lang === 'en' ? 'jp' : 'en'
        });
      } catch (err) {
        console.error("言語保存エラー:", err);
      }
    }

    handleLangClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>

        {/* ロゴ */}
        <Typography 
          variant="h5" 
          sx={{ color: '#fff', flexGrow: 1, fontStyle: 'italic', cursor: 'pointer' }}
          onClick={() => navigate('/calendar')}
        >
          NEX-ROOM
        </Typography>

        {/* ナビゲーション */}
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 1,
            alignItems: 'center',
            '& .nav-btn': {
              minWidth: 'auto',
              px: 1.5,
              fontSize: '1rem',
              fontWeight: 500,
              fontFamily: "'Noto Sans JP', 'Inter', sans-serif",
              textTransform: 'none',
              color: 'white',
              fontStyle: 'italic',
            },
            '& .nav-btn .MuiSvgIcon-root': {
              fontSize: '1.7rem', 
            }
          }}
        >

          {/* カレンダー */}
          <Button 
            className="nav-btn"
            color="inherit" 
            startIcon={<CalendarToday />} 
            onClick={() => navigate('/calendar')}
          >
            {t('nav.calendar') || 'カレンダー'}
          </Button>

          {isAuthenticated && (
            <>
              {/* My予約 */}
              <Button 
                className="nav-btn"
                color="inherit" 
                startIcon={<EventNote />} 
                onClick={() => navigate('/my-bookings')}
              >
                {t('nav.my_bookings') || 'My予約'}
              </Button>

              {/* 管理（Admin only） */}
              {user?.role === 'admin' && (
                <Button 
                  className="nav-btn"
                  color="inherit" 
                  startIcon={<AdminPanelSettings />} 
                  onClick={() => navigate('/admin')}
                >
                  {t('nav.admin') || '管理'}
                </Button>
              )}

              {/* 設定 */}
              <Button 
                className="nav-btn"
                color="inherit" 
                startIcon={<SettingsIcon />} 
                onClick={() => navigate('/settings')}
                sx={{minWidth: 'auto', px: 0 }}
              >
              </Button>
            </>
          )}
                  

          {/* ▼ 言語メニュー（ログイン状態に関係なく常に表示） */}
          <Button
            className="nav-btn"
            color="inherit"
            startIcon={<Language />}
            onClick={handleLangClick}
            sx={{ minWidth: 'auto' }}
          >
          </Button>

          <Menu 
            anchorEl={langAnchor}
            open={Boolean(langAnchor)}
            onClose={handleLangClose}
          >
            <MenuItem onClick={() => handleLangChange('ja')}>
              日本語
            </MenuItem>
            <MenuItem onClick={() => handleLangChange('en')}>
              English
            </MenuItem>
          </Menu>


          {/* ログアウト（ログイン時） */}
          {isAuthenticated && (
            <>
              {/* ログアウト */}
              <Button 
                className="nav-btn"
                color="inherit" 
                startIcon={<LogoutIcon />} 
                onClick={handleLogout}
              >
                {t('auth.logout') || 'ログアウト'}
              </Button>
            </>
          )}
                  

          {/* ログイン（未ログイン時） */}
          {!isAuthenticated && (
            <Button
              className="nav-btn"
              color="inherit"
              startIcon={<LoginIcon />}
              onClick={() => navigate('/login')}
            >
              {t('auth.login') || 'ログイン'}
            </Button>
          )}
        
        
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
