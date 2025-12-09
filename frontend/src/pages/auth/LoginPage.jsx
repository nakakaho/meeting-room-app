import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import ErrorDisplay from '../../components/common/ErrorDisplay';

const LoginPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/calendar');
    } else {
      if (result.errors) {
        setErrors(result.errors);
      } else {
        setGeneralError(result.message);
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            {t('auth.login')}
          </Typography>
          <ErrorDisplay errors={errors} generalError={generalError} />
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
            
            <TextField
              fullWidth
              label={t('auth.password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {t('auth.login')}
            </Button>
            
            <Box sx={{ textAlign: 'center', mb: 1 }}>
              <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                <Typography color="primary" variant="body2">
                  {t('auth.forgot_password')}
                </Typography>
              </Link>
            </Box>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                fullWidth
                variant="contained"
                sx={{
                  bgcolor: 'secondary.main',
                  color: 'white',
                  ':hover': {
                    bgcolor: 'secondary.dark',
                  }
                }}
                component={Link}
                to="/register"
              >
                {t('auth.create_account')}
              </Button>
            </Box>

          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;