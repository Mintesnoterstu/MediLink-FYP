import React, { useState } from 'react';
import { Box, Typography, Link, Alert, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import { useTranslation } from 'react-i18next';
import { PrimaryButton, TextField, LoadingSpinner } from '@/components/ui';
import { UserRole } from '@/types';

export const Registration: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const { addNotification } = useUI();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient' as UserRole,
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register(formData.email, formData.password, formData.name, formData.role);
      addNotification({
        type: 'success',
        title: t('auth.registerSuccess'),
        message: t('auth.registerSuccess'),
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || t('auth.registerError'));
    }
  };

  if (isLoading) {
    return <LoadingSpinner message={t('common.loading')} />;
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight={700} textAlign="center">
        {t('auth.register')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label={t('auth.name')}
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
        margin="normal"
      />

      <TextField
        fullWidth
        label={t('auth.email')}
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
        margin="normal"
        autoComplete="email"
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>{t('common.role')}</InputLabel>
        <Select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
          label={t('common.role')}
        >
          <MenuItem value="patient">Patient</MenuItem>
          <MenuItem value="provider">Provider</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label={t('auth.password')}
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
        margin="normal"
        autoComplete="new-password"
      />

      <TextField
        fullWidth
        label={t('auth.confirmPassword')}
        type="password"
        value={formData.confirmPassword}
        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
        required
        margin="normal"
        autoComplete="new-password"
      />

      <PrimaryButton type="submit" fullWidth size="large" sx={{ mt: 2 }}>
        {t('auth.register')}
      </PrimaryButton>

      <Box textAlign="center" mt={2}>
        <Typography variant="body2">
          Already have an account?{' '}
          <Link href="/login" underline="hover">
            {t('auth.login')}
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

