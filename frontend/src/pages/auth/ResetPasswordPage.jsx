import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Paper, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios'; // ✅ 修正

const ResetPasswordPage = () => {
  const { t, i18n } = useTranslation(); // ✅ i18n 追加
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');
    
    if (!tokenParam || !emailParam) {
      setMessage({ type: 'error', text: t('auth.invalid_link') || '無効なリンクです' });
      return;
    }
    
    setToken(tokenParam);
    setEmail(emailParam);
  }, [searchParams, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: t('user.password_mismatch') || 'パスワードが一致しません' });
      setLoading(false);
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 12) {
      setMessage({ type: 'error', text: t('user.password_length_error') || 'パスワードは8〜12文字で入力してください' });
      setLoading(false);
      return;
    }

    try {
      // ✅ 修正: api.post + 言語ヘッダー追加
      const response = await api.post('/password-update', {
        email,
        token,
        new_password: newPassword,
      }, {
        headers: {
          'Accept-Language': i18n.language === 'ja' ? 'ja' : 'en' // ✅ 追加
        }
      });
      
      setMessage({ 
        type: 'success', 
        text: response.data.message || t('auth.password_reset_success') || 'パスワードをリセットしました。ログイン画面に移動します...'
      });
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      // ✅ エラーメッセージの取得改善
      let errorMessage = t('auth.password_reset_failed') || 'パスワードリセットに失敗しました';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        errorMessage = errors.join('\n');
      }
      
      setMessage({ 
        type: 'error', 
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            {t('auth.set_new_password')}
          </Typography>
          
          {message.text && (
            <Alert severity={message.type} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label={t('auth.email')}
              type="email"
              value={email}
              margin="normal"
              disabled
            />
            
            <TextField
              fullWidth
              label={t('user.new_password_hint')}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
              required
              helperText={t('user.password_hint') || 'パスワードは8〜12文字で入力してください'} // ✅ 追加
            />
            
            <TextField
              fullWidth
              label={t('user.confirm_password')}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              required
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
              disabled={loading || !token}
            >
              {loading 
                ? (t('common.processing') || '処理中...') 
                : (t('auth.reset_password_button') || 'パスワードをリセット')
              }
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPasswordPage;