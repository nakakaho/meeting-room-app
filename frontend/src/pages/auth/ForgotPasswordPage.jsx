import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Paper, Alert } from '@mui/material';
import axios from 'axios';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    setResetUrl('');

    try {
      const response = await axios.post(
        'http://localhost/meeting-room-app/backend/public/api/password-reset',
        { email }
      );
      
      setMessage({ 
        type: 'success', 
        text: 'パスワードリセットメールを送信しました。メールをご確認ください。' 
      });
      
      // 開発環境用: リセットURLを表示
      if (response.data.reset_url) {
        setResetUrl(response.data.reset_url);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'メール送信に失敗しました' 
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
            パスワードリセット
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            登録済みのメールアドレスを入力してください。パスワードリセット用のリンクを送信します。
          </Typography>
          
          {message.text && (
            <Alert severity={message.type} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}

          {resetUrl && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                開発環境用リンク（本番では表示されません）:
              </Typography>
              <Link to={resetUrl.replace('http://localhost:5173', '')} style={{ wordBreak: 'break-all' }}>
                {resetUrl}
              </Link>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="メールアドレス"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              リセットメールを送信
            </Button>
            
            <Box sx={{ textAlign: 'center' }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Typography color="primary">
                  ログイン画面に戻る
                </Typography>
              </Link>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;