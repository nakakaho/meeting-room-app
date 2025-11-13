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
  Alert,
  CircularProgress,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI } from '../../api';
import NotificationSettings from '../../components/user/NotificationSettings';

const UserSettingsPage = () => {
  const { user, logout } = useAuth();
  
  // 基本情報
  const [originalName, setOriginalName] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // 通知設定
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyMySchedule, setNotifyMySchedule] = useState(true);
  const [notifyAllSchedule, setNotifyAllSchedule] = useState(false);
  
  // 言語設定
  const [lang, setLang] = useState('jp');
  
  // パスワード変更
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI状態
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchUserInfo();
  }, [user]);

  const fetchUserInfo = async () => {
    try {
      const response = await userAPI.getMe(user?.id);
      const userData = response.data.user;
      
      setName(userData.name);
      setEmail(userData.email);
      setOriginalName(userData.name);
      setOriginalEmail(userData.email);
      setNotifyEmail(userData.notify_email);
      setNotifyMySchedule(userData.notify_my_schedule);
      setNotifyAllSchedule(userData.notify_all_schedule);
      setLang(userData.lang);
    } catch (error) {
      console.error('ユーザー情報の取得に失敗:', error);
    }
  };

  const handleUpdateProfile = async () => {
    setLoadingProfile(true);
    setProfileMessage({ type: '', text: '' });

    // 変更された項目のみ送信
    const updates = {};
    if (name !== originalName) updates.name = name;
    if (email !== originalEmail) updates.email = email;

    if (Object.keys(updates).length === 0) {
      setProfileMessage({ type: 'info', text: '変更がありません' });
      setLoadingProfile(false);
      return;
    }

    try {
      await userAPI.update(user?.id, updates);
      setOriginalName(name);
      setOriginalEmail(email);
      setProfileMessage({ type: 'success', text: '基本情報を更新しました' });
    } catch (error) {
      setProfileMessage({ 
        type: 'error', 
        text: error.response?.data?.message || '更新に失敗しました' 
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  // 通知設定を即座に保存
  const handleToggleNotify = async (key, value) => {
    try {
      await userAPI.updateSettings(user?.id, { [key]: value });
    } catch (error) {
      console.error('設定の更新に失敗:', error);
    }
  };

  // 言語設定を即座に保存
  const handleChangeLang = async (newLang) => {
    setLang(newLang);
    try {
      await userAPI.updateSettings(user?.id, { lang: newLang });
    } catch (error) {
      console.error('言語設定の更新に失敗:', error);
    }
  };

  const handleChangePassword = async () => {
    setLoadingPassword(true);
    setPasswordMessage({ type: '', text: '' });

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'すべての項目を入力してください' });
      setLoadingPassword(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: '新しいパスワードが一致しません' });
      setLoadingPassword(false);
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 12) {
      setPasswordMessage({ type: 'error', text: 'パスワードは8〜12文字で入力してください' });
      setLoadingPassword(false);
      return;
    }

    try {
      await userAPI.changePassword(
        user?.id,
        currentPassword,
        newPassword,
        confirmPassword
      );
      setPasswordMessage({ type: 'success', text: 'パスワードを変更しました' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'パスワード変更に失敗しました' 
      });
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('本当にアカウントを削除しますか？この操作は取り消せません。')) {
      return;
    }

    if (!window.confirm('もう一度確認します。アカウントを削除しますか？')) {
      return;
    }

    try {
      await userAPI.delete(user?.id);
      alert('アカウントを削除しました');
      logout();
    } catch (error) {
      alert(error.response?.data?.message || 'アカウント削除に失敗しました');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        ユーザー設定
      </Typography>

      {/* 基本情報 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          基本情報
        </Typography>
        
        {profileMessage.text && (
          <Alert severity={profileMessage.type} sx={{ mb: 2 }} onClose={() => setProfileMessage({ type: '', text: '' })}>
            {profileMessage.text}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <TextField
            label="メールアドレス"
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
            基本情報を更新
          </Button>
        </Box>
      </Paper>

      {/* 通知設定 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          通知設定
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
            label="予約完了メール通知"
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
            label="マイスケジュール通知（開始5分前）"
          />
          <FormControlLabel
            control={
              <Switch
                checked={notifyAllSchedule}
                onChange={(e) => {
                  setNotifyAllSchedule(e.target.checked);
                  handleToggleNotify('notify_all_schedule', e.target.checked);
                }}
              />
            }
            label="全室利用状況通知"
          />
          {/* <NotificationSettings user={user} onUpdate={handleSettingsUpdate} /> */}
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            言語設定
          </Typography>
          <FormControl fullWidth>
            <InputLabel>言語</InputLabel>
            <Select
              value={lang}
              onChange={(e) => handleChangeLang(e.target.value)}
              label="言語"
            >
              <MenuItem value="jp">日本語</MenuItem>
              <MenuItem value="en">English</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* パスワード変更 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          パスワード変更
        </Typography>
        
        {passwordMessage.text && (
          <Alert severity={passwordMessage.type} sx={{ mb: 2 }} onClose={() => setPasswordMessage({ type: '', text: '' })}>
            {passwordMessage.text}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="現在のパスワード"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            fullWidth
          />
          <TextField
            label="新しいパスワード（8〜12文字）"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
          />
          <TextField
            label="新しいパスワード（確認）"
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
            パスワードを変更
          </Button>
        </Box>
      </Paper>

      {/* アカウント削除 */}
      <Paper sx={{ p: 3, border: '1px solid', borderColor: 'error.main' }}>
        <Typography variant="h6" gutterBottom>
          アカウント削除
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          アカウントを削除すると、すべてのデータが削除され、元に戻せません。
        </Typography>
        <Button
          variant="outlined"
          color="error"
          onClick={handleDeleteAccount}
        >
          アカウントを削除
        </Button>
      </Paper>
    </Container>
  );
};

export default UserSettingsPage;