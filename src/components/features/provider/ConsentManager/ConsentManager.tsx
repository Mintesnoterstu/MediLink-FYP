import React, { useState, useMemo } from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel, TextField, Alert } from '@mui/material';
import { Security, Add, CheckCircle, Cancel, Schedule } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { HealthCard, PrimaryButton } from '@/components/ui';
import { ConsentRecord, ConsentPermission } from '@/types';
import { format, addDays } from 'date-fns';

interface ConsentManagerProps {
  patientId: string;
  patientName?: string;
  existingConsents?: ConsentRecord[];
  onGrantConsent?: (consent: Omit<ConsentRecord, 'id' | 'grantedAt'>) => Promise<void>;
  onRevokeConsent?: (consentId: string) => Promise<void>;
  providerId: string;
  providerName: string;
}

export const ConsentManager: React.FC<ConsentManagerProps> = ({
  patientId: _patientId,
  patientName,
  existingConsents = [],
  onGrantConsent,
  onRevokeConsent,
  providerId,
  providerName,
}) => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<ConsentPermission[]>([]);
  const [expirationDays, setExpirationDays] = useState<number>(30);
  const [isProcessing, setIsProcessing] = useState(false);

  const activeConsents = useMemo(() => {
    const now = new Date();
    return existingConsents.filter((consent) => {
      if (consent.revokedAt) return false;
      if (consent.expiresAt && new Date(consent.expiresAt) < now) return false;
      return consent.providerId === providerId;
    });
  }, [existingConsents, providerId]);

  const expiredConsents = useMemo(() => {
    const now = new Date();
    return existingConsents.filter((consent) => {
      if (consent.revokedAt) return false;
      if (consent.expiresAt && new Date(consent.expiresAt) >= now) return false;
      return consent.providerId === providerId;
    });
  }, [existingConsents, providerId]);

  const revokedConsents = useMemo(() => {
    return existingConsents.filter(
      (consent) => consent.revokedAt && consent.providerId === providerId
    );
  }, [existingConsents, providerId]);

  const handlePermissionToggle = (type: ConsentPermission['type'], access: ConsentPermission['access']) => {
    setSelectedPermissions((prev) => {
      const existing = prev.find((p) => p.type === type && p.access === access);
      if (existing) {
        return prev.filter((p) => !(p.type === type && p.access === access));
      }
      return [...prev, { type, access }];
    });
  };

  const handleGrantConsent = async () => {
    if (selectedPermissions.length === 0) return;

    setIsProcessing(true);
    try {
      const expiresAt = expirationDays > 0 
        ? addDays(new Date(), expirationDays).toISOString()
        : undefined;

      const newConsent: Omit<ConsentRecord, 'id' | 'grantedAt'> = {
        providerId,
        providerName,
        permissions: selectedPermissions,
        expiresAt,
      };

      await onGrantConsent?.(newConsent);
      setDialogOpen(false);
      setSelectedPermissions([]);
      setExpirationDays(30);
    } catch (error) {
      console.error('Failed to grant consent:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRevokeConsent = async (consentId: string) => {
    if (window.confirm(t('provider.confirmRevokeConsent'))) {
      try {
        await onRevokeConsent?.(consentId);
      } catch (error) {
        console.error('Failed to revoke consent:', error);
      }
    }
  };

  const permissionTypes: Array<{ type: ConsentPermission['type']; label: string }> = [
    { type: 'records', label: t('provider.medicalRecords') },
    { type: 'medications', label: t('provider.medications') },
    { type: 'vitals', label: t('provider.vitalSigns') },
    { type: 'symptoms', label: t('provider.symptoms') },
  ];

  return (
    <Box>
      <HealthCard
        title={t('provider.consentManagement')}
        icon={<Security color="primary" />}
        action={
          <Button
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
            variant="outlined"
            size="small"
          >
            {t('provider.grantConsent')}
          </Button>
        }
      >
        {patientName && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t('provider.patient')}: {patientName}
          </Typography>
        )}

        {/* Active Consents */}
        {activeConsents.length > 0 && (
          <Box mb={3}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {t('provider.activeConsents')}
            </Typography>
            <List>
              {activeConsents.map((consent) => (
                <ListItem
                  key={consent.id}
                  sx={{ mb: 1, bgcolor: 'success.light', borderRadius: 1 }}
                  secondaryAction={
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleRevokeConsent(consent.id)}
                      startIcon={<Cancel />}
                    >
                      {t('provider.revoke')}
                    </Button>
                  }
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <CheckCircle color="success" fontSize="small" />
                        <Typography variant="subtitle2" fontWeight={600}>
                          {t('provider.granted')}: {format(new Date(consent.grantedAt), 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                          {consent.permissions.map((perm, idx) => (
                            <Chip
                              key={idx}
                              label={`${perm.type} (${perm.access})`}
                              size="small"
                            />
                          ))}
                        </Box>
                        {consent.expiresAt && (
                          <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                            {t('provider.expires')}: {format(new Date(consent.expiresAt), 'MMM dd, yyyy')}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Expired Consents */}
        {expiredConsents.length > 0 && (
          <Box mb={3}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {t('provider.expiredConsents')}
            </Typography>
            <List>
              {expiredConsents.map((consent) => (
                <ListItem key={consent.id} sx={{ mb: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Schedule color="warning" fontSize="small" />
                        <Typography variant="subtitle2">
                          {t('provider.expired')}: {format(new Date(consent.expiresAt || ''), 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                        {consent.permissions.map((perm, idx) => (
                          <Chip key={idx} label={`${perm.type} (${perm.access})`} size="small" />
                        ))}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Revoked Consents */}
        {revokedConsents.length > 0 && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {t('provider.revokedConsents')}
            </Typography>
            <List>
              {revokedConsents.map((consent) => (
                <ListItem key={consent.id} sx={{ mb: 1, bgcolor: 'error.light', borderRadius: 1 }}>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Cancel color="error" fontSize="small" />
                        <Typography variant="subtitle2">
                          {t('provider.revoked')}: {format(new Date(consent.revokedAt || ''), 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {activeConsents.length === 0 && expiredConsents.length === 0 && revokedConsents.length === 0 && (
          <Alert severity="info">
            {t('provider.noConsents')}
          </Alert>
        )}
      </HealthCard>

      {/* Grant Consent Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('provider.grantConsent')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t('provider.selectPermissions')}
          </Typography>

          <Box mt={2}>
            {permissionTypes.map(({ type, label }) => (
              <Box key={type} mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  {label}
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedPermissions.some((p) => p.type === type && p.access === 'read')}
                      onChange={() => handlePermissionToggle(type, 'read')}
                    />
                  }
                  label={t('provider.read')}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedPermissions.some((p) => p.type === type && p.access === 'write')}
                      onChange={() => handlePermissionToggle(type, 'write')}
                    />
                  }
                  label={t('provider.write')}
                />
              </Box>
            ))}
          </Box>

          <TextField
            fullWidth
            type="number"
            label={t('provider.expirationDays')}
            value={expirationDays}
            onChange={(e) => setExpirationDays(parseInt(e.target.value) || 0)}
            margin="normal"
            helperText={expirationDays === 0 ? t('provider.noExpiration') : t('provider.expirationHelper')}
            InputProps={{ inputProps: { min: 0, max: 365 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={isProcessing}>
            {t('common.cancel')}
          </Button>
          <PrimaryButton
            onClick={handleGrantConsent}
            disabled={selectedPermissions.length === 0 || isProcessing}
          >
            {t('provider.grant')}
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
