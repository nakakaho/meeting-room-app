import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Paper, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    setResetUrl('');

    const result = await forgotPassword(email);

    if (result.success) {
      setMessage({ type: 'success', text: result.message });

      // 開発環境の reset_url も受け取れるようにする（AuthContext 側で返す必要アリ）
      if (result.reset_url) {
        setResetUrl(result.reset_url);
      }
    } else {
      setMessage({
        type: 'error',
        text: result.message || t('auth.reset_email_failed'),
      });
    }

    setLoading(false);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            {t('auth.reset_password')}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t('auth.reset_password_instruction')}
          </Typography>

          {message.text && (
            <Alert severity={message.type} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}

          {resetUrl && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                {t('auth.dev_reset_link')}
              </Typography>
              <a href={resetUrl} style={{ wordBreak: 'break-all' }}>
                {resetUrl}
              </a>
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label={t('auth.email')}
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
              {t('auth.send_reset_link')}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Typography color="primary">
                  {t('auth.back_to_login')}
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
