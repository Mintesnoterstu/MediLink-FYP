import React, { useState } from 'react';
import { Box, Typography, Link, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import { useTranslation } from 'react-i18next';
import { PrimaryButton, TextField, LoadingSpinner } from '@/components/ui';

export const LoginForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const { addNotification } = useUI();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      addNotification({
        type: 'success',
        title: t('auth.loginSuccess'),
        message: t('auth.loginSuccess'),
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || t('auth.loginError'));
    }
  };

  if (isLoading) {
    return <LoadingSpinner message={t('common.loading')} />;
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight={700} textAlign="center">
        {t('auth.login')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label={t('auth.email')}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        margin="normal"
        autoComplete="email"
      />

      <TextField
        fullWidth
        label={t('auth.password')}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        margin="normal"
        autoComplete="current-password"
      />

      <Box textAlign="right" mb={2}>
        <Link href="/reset-password" variant="body2">
          {t('auth.forgotPassword')}
        </Link>
      </Box>

      <PrimaryButton type="submit" fullWidth size="large">
        {t('auth.login')}
      </PrimaryButton>

      <Box textAlign="center" mt={2}>
        <Typography variant="body2">
          Don't have an account?{' '}
          <Link href="/register" underline="hover">
            {t('auth.register')}
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

