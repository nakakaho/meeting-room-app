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
import { useTranslation } from 'react-i18next';
import notificationService from '../../api/notificationService';
import api from '../../api/axios';

function NotificationSettings({ user, onUpdate }) {
  const { t } = useTranslation();
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
      setMessage({ type: 'success', text: t('notification.permission_granted') });
    } else {
      setMessage({ 
        type: 'error', 
        text: t('notification.permission_denied')
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
        setMessage({ type: 'success', text: t('notification.settings_saved') });
        if (onUpdate) {
          onUpdate(settings);
        }
      }
    } catch (error) {
      console.error('設定保存エラー:', error);
      setMessage({ type: 'error', text: t('notification.settings_failed') });
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
            {t('notification.settings_title')}
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
            {t('notification.enable_desktop')}
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {t('notification.enable_desktop_hint')}
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
              label={t('notification.email_notification')}
            />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
              {t('notification.email_notification_hint')}
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
              label={t('notification.my_schedule_notification')}
            />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
              {t('notification.my_schedule_notification_hint')}
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
            {loading ? t('notification.saving') : t('notification.save_settings')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default NotificationSettings;