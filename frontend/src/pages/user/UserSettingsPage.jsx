import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import ErrorDisplay from '../../components/common/ErrorDisplay';

const UserSettingsPage = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { updateUser, updateSettings, changePassword, deleteAccount } = useUser();
  
  // 基本情報
  const [originalName, setOriginalName] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // 通知設定
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyMySchedule, setNotifyMySchedule] = useState(true);
  
  // 言語設定
  const [lang, setLang] = useState('jp');
  
  // パスワード変更
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI状態
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  
  // エラー・成功メッセージ
  const [profileErrors, setProfileErrors] = useState({});
  const [profileGeneralError, setProfileGeneralError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordGeneralError, setPasswordGeneralError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Snackbar
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  useEffect(() => {
    fetchUserInfo();
  }, [user]);

  const fetchUserInfo = async () => {
    try {
      setName(user?.name || '');
      setEmail(user?.email || '');
      setOriginalName(user?.name || '');
      setOriginalEmail(user?.email || '');
      setNotifyEmail(user?.notify_email ?? true);
      setNotifyMySchedule(user?.notify_my_schedule ?? true);
      
      const userLang = user?.lang || 'en';
      setLang(userLang);
      i18n.changeLanguage(userLang === 'jp' ? 'ja' : 'en');
    } catch (error) {
      console.error('ユーザー情報の取得に失敗:', error);
    }
  };

  const handleUpdateProfile = async () => {
    setLoadingProfile(true);
    setProfileErrors({});
    setProfileGeneralError('');
    setProfileSuccess('');

    const updates = {};
    if (name !== originalName) updates.name = name;
    if (email !== originalEmail) updates.email = email;

    if (Object.keys(updates).length === 0) {
      setProfileSuccess(t('common.no_changes'));
      setLoadingProfile(false);
      return;
    }

    try {
      const result = await updateUser(user?.id, updates);
      
      if (result.success) {
        setOriginalName(name);
        setOriginalEmail(email);
        setProfileSuccess(result.message);
      } else {
        if (result.errors) {
          setProfileErrors(result.errors);
        } else {
          setProfileGeneralError(result.message);
        }
      }
    } catch (error) {
      setProfileGeneralError('更新に失敗しました');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleToggleNotify = async (key, value) => {
    try {
      const result = await updateSettings(user?.id, { [key]: value });
      
      if (!result.success) {
        if (key === 'notify_email') setNotifyEmail(!value);
        if (key === 'notify_my_schedule') setNotifyMySchedule(!value);
        
        setSnackbar({ 
          open: true, 
          message: result.message, 
          severity: 'error' 
        });
      } else {
        setSnackbar({ 
          open: true, 
          message: result.message, 
          severity: 'success' 
        });
      }
    } catch (error) {
      if (key === 'notify_email') setNotifyEmail(!value);
      if (key === 'notify_my_schedule') setNotifyMySchedule(!value);
      
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message, 
        severity: 'error' 
      });
    }
  };

  const handleChangeLang = async (newLang) => {
    const prevLang = lang;
    setLang(newLang);
    i18n.changeLanguage(newLang === 'jp' ? 'ja' : 'en');
    
    try {
      const result = await updateSettings(user?.id, { lang: newLang });
      
      if (!result.success) {
        setLang(prevLang);
        i18n.changeLanguage(prevLang === 'jp' ? 'ja' : 'en');
        
        setSnackbar({ 
          open: true, 
          message: result.message, 
          severity: 'error' 
        });
      } else {
        setSnackbar({ 
          open: true, 
          message: result.message, 
          severity: 'success' 
        });
      }
    } catch (error) {
      setLang(prevLang);
      i18n.changeLanguage(prevLang === 'jp' ? 'ja' : 'en');
      
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message, 
        severity: 'error' 
      });
    }
  };

  const handleChangePassword = async () => {
    setLoadingPassword(true);
    setPasswordErrors({});
    setPasswordGeneralError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordGeneralError(t('user.all_fields_required'));
      setLoadingPassword(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordGeneralError(t('user.password_mismatch'));
      setLoadingPassword(false);
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 12) {
      setPasswordGeneralError(t('user.password_length_error'));
      setLoadingPassword(false);
      return;
    }

    try {
      const result = await changePassword(
        user?.id,
        currentPassword,
        newPassword,
        confirmPassword
      );
      
      if (result.success) {
        setPasswordSuccess(result.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        if (result.errors) {
          setPasswordErrors(result.errors);
        } else {
          setPasswordGeneralError(result.message);
        }
      }
    } catch (error) {
      setPasswordGeneralError('パスワード変更に失敗しました');
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(t('user.delete_confirm'))) {
      return;
    }

    if (!window.confirm(t('user.delete_confirm2'))) {
      return;
    }

    try {
      const result = await deleteAccount(user?.id);
      
      if (result.success) {
        alert(result.message);
        logout();
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert(error.response?.data?.message);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('user.settings')}
      </Typography>

      {/* 基本情報 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('user.basic_info')}
        </Typography>
        
        <ErrorDisplay 
          errors={profileErrors}
          generalError={profileGeneralError}
          successMessage={profileSuccess}
        />
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label={t('user.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <TextField
            label={t('user.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            startIcon={loadingProfile ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleUpdateProfile}
            disabled={loadingProfile}
          >
            {t('user.update_basic_info')}
          </Button>
        </Box>
      </Paper>

      {/* 通知設定 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('user.notification_settings')}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={notifyEmail}
                onChange={(e) => {
                  setNotifyEmail(e.target.checked);
                  handleToggleNotify('notify_email', e.target.checked);
                }}
              />
            }
            label={t('user.notify_email')}
          />
          <FormControlLabel
            control={
              <Switch
                checked={notifyMySchedule}
                onChange={(e) => {
                  setNotifyMySchedule(e.target.checked);
                  handleToggleNotify('notify_my_schedule', e.target.checked);
                }}
              />
            }
            label={t('user.notify_my_schedule')}
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('user.language_settings')}
          </Typography>
          <FormControl fullWidth>
            <InputLabel>{t('user.language')}</InputLabel>
            <Select
              value={lang}
              onChange={(e) => handleChangeLang(e.target.value)}
              label={t('user.language')}
            >
              <MenuItem value="jp">{t('user.japanese')}</MenuItem>
              <MenuItem value="en">{t('user.english')}</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* パスワード変更 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('user.password_change')}
        </Typography>
        
        <ErrorDisplay 
          errors={passwordErrors}
          generalError={passwordGeneralError}
          successMessage={passwordSuccess}
        />
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label={t('user.current_password')}
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            fullWidth
          />
          <TextField
            label={t('user.new_password_hint')}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
          />
          <TextField
            label={t('user.confirm_password')}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            startIcon={loadingPassword ? <CircularProgress size={20} color="inherit" /> : null}
            onClick={handleChangePassword}
            disabled={loadingPassword}
          >
            {t('user.change_password_button')}
          </Button>
        </Box>
      </Paper>

      {/* アカウント削除 */}
      <Paper sx={{ p: 3, border: '1px solid', borderColor: 'error.main' }}>
        <Typography variant="h6" gutterBottom>
          {t('user.account_delete')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('user.delete_warning')}
        </Typography>
        <Button
          variant="outlined"
          color="error"
          onClick={handleDeleteAccount}
        >
          {t('user.delete_account_button')}
        </Button>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserSettingsPage;