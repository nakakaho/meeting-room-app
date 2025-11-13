import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Paper, Alert } from '@mui/material';
import axios from 'axios';

const ResetPasswordPage = () => {
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
      setMessage({ type: 'error', text: '無効なリンクです' });
      return;
    }
    
    setToken(tokenParam);
    setEmail(emailParam);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'パスワードが一致しません' });
      setLoading(false);
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 12) {
      setMessage({ type: 'error', text: 'パスワードは8〜12文字で入力してください' });
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        'http://localhost/meeting-room-app/backend/public/api/password-update',
        {
          email,
          token,
          new_password: newPassword,
        }
      );
      
      setMessage({ 
        type: 'success', 
        text: 'パスワードをリセットしました。ログイン画面に移動します...' 
      });
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'パスワードリセットに失敗しました' 
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
            新しいパスワードを設定
          </Typography>
          
          {message.text && (
            <Alert severity={message.type} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="メールアドレス"
              type="email"
              value={email}
              margin="normal"
              disabled
            />
            
            <TextField
              fullWidth
              label="新しいパスワード（8〜12文字）"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="新しいパスワード（確認）"
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
              パスワードをリセット
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPasswordPage;