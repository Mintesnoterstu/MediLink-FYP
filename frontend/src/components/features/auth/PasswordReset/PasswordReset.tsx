import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Card, CardContent, Alert, Stepper, Step, StepLabel } from '@mui/material';
import { Email, Lock, CheckCircle } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { PrimaryButton, LoadingSpinner } from '@/components/ui';

interface PasswordResetProps {
  onResetRequest?: (email: string) => Promise<void>;
  onResetConfirm?: (token: string, newPassword: string) => Promise<void>;
  resetToken?: string;
}

const steps = ['request', 'verify', 'reset'];

export const PasswordReset: React.FC<PasswordResetProps> = ({
  onResetRequest,
  onResetConfirm,
  resetToken,
}) => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(resetToken ? 2 : 0);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(resetToken || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRequestReset = async () => {
    if (!email) {
      setError(t('auth.emailRequired'));
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await onResetRequest?.(email);
      setActiveStep(1);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || t('auth.resetRequestError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async () => {
    if (!token) {
      setError(t('auth.tokenRequired'));
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setError(t('auth.passwordTooShort'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await onResetConfirm?.(token, newPassword);
      setActiveStep(2);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || t('auth.resetConfirmError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={700} textAlign="center">
            {t('auth.resetPassword')}
          </Typography>

          <Stepper activeStep={activeStep} sx={{ my: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{t(`auth.${label}`)}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && activeStep === 2 && (
            <Alert severity="success" sx={{ mb: 2 }} icon={<CheckCircle />}>
              {t('auth.passwordResetSuccess')}
            </Alert>
          )}

          {activeStep === 0 && (
            <Box>
              <Typography variant="body1" gutterBottom>
                {t('auth.enterEmailForReset')}
              </Typography>
              <TextField
                fullWidth
                label={t('auth.email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                disabled={isLoading}
              />
              <PrimaryButton
                fullWidth
                onClick={handleRequestReset}
                disabled={isLoading || !email}
                sx={{ mt: 2 }}
              >
                {isLoading ? <LoadingSpinner size={20} /> : t('auth.sendResetLink')}
              </PrimaryButton>
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                {t('auth.checkEmailForReset')}
              </Alert>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t('auth.enterResetToken')}
              </Typography>
              <TextField
                fullWidth
                label={t('auth.resetToken')}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                margin="normal"
                disabled={isLoading}
              />
              <Button
                fullWidth
                onClick={() => setActiveStep(2)}
                disabled={!token}
                sx={{ mt: 2 }}
              >
                {t('common.next')}
              </Button>
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Typography variant="body1" gutterBottom>
                {t('auth.enterNewPassword')}
              </Typography>
              <TextField
                fullWidth
                label={t('auth.newPassword')}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                margin="normal"
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                helperText={t('auth.passwordRequirements')}
                disabled={isLoading}
              />
              <TextField
                fullWidth
                label={t('auth.confirmPassword')}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                margin="normal"
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                disabled={isLoading}
              />
              <PrimaryButton
                fullWidth
                onClick={handleConfirmReset}
                disabled={isLoading || !newPassword || !confirmPassword}
                sx={{ mt: 2 }}
              >
                {isLoading ? <LoadingSpinner size={20} /> : t('auth.resetPassword')}
              </PrimaryButton>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};


