// src/components/user/NotificationSettings.jsx

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControlLabel,
  Switch,
  Button,
  Alert,
  Divider
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import notificationService from '../../api/notificationService';
import api from '../../api/axios';

function NotificationSettings({ user, onUpdate }) {
  const [settings, setSettings] = useState({
    notify_email: user?.notify_email || false,
    notify_my_schedule: user?.notify_my_schedule || false,
    notify_all_schedule: user?.notify_all_schedule || false
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handlePermissionRequest = async () => {
    const granted = await notificationService.requestPermission();
    if (granted) {
      setMessage({ type: 'success', text: 'デスクトップ通知が許可されました' });
    } else {
      setMessage({ 
        type: 'error', 
        text: 'デスクトップ通知が拒否されました。ブラウザの設定から許可してください。' 
      });
    }
  };

  const handleChange = (field) => (event) => {
    setSettings({
      ...settings,
      [field]: event.target.checked
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.put(`/users/${user.id}/settings`, settings);
      
      if (response.data.success) {
        setMessage({ type: 'success', text: '設定を保存しました' });
        if (onUpdate) {
          onUpdate(settings);
        }
      }
    } catch (error) {
      console.error('設定保存エラー:', error);
      setMessage({ type: 'error', text: '設定の保存に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <NotificationsActiveIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            通知設定
          </Typography>
        </Box>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Button 
            variant="outlined" 
            onClick={handlePermissionRequest}
            fullWidth
            startIcon={<NotificationsActiveIcon />}
          >
            デスクトップ通知を許可
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            ブラウザのデスクトップ通知を有効にします
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notify_email}
                  onChange={handleChange('notify_email')}
                />
              }
              label="予約完了メール通知"
            />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
              予約作成時にメールで通知します
            </Typography>
          </Box>

          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notify_my_schedule}
                  onChange={handleChange('notify_my_schedule')}
                />
              }
              label="マイ予約デスクトップ通知（開始5分前）"
            />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
              自分の予約開始5分前に通知します（クリックでMy予約一覧へ）
            </Typography>
          </Box>

          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notify_all_schedule}
                  onChange={handleChange('notify_all_schedule')}
                />
              }
              label="全体利用状況デスクトップ通知"
            />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
              現在利用中の会議室を通知します（クリックでカレンダーへ）
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Button 
            variant="contained" 
            onClick={handleSave}
            fullWidth
            disabled={loading}
          >
            {loading ? '保存中...' : '設定を保存'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default NotificationSettings;