import React, { useState, useEffect } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, Alert, List, ListItem, ListItemText, Chip, Card, CardContent } from '@mui/material';
import { LocalHospital, LocationOn, Warning, CheckCircle, Schedule } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { EmergencyButton } from '@/components/ui';
import { notificationService } from '@/services/notificationService';
import { EmergencyAlert as EmergencyAlertType, EmergencyContact } from '@/types';
import { format } from 'date-fns';

interface EmergencyAlertProps {
  patientLocation?: string;
  patientDetails?: any;
  emergencyContacts?: EmergencyContact[];
  onAlertSent?: (alert: EmergencyAlertType) => void;
  triggerType?: 'ai-detected' | 'manual' | 'vital-signs';
  detectedSeverity?: 'high' | 'critical';
  detectedDetails?: string;
  onFollowUp?: () => void;
}

export const EmergencyAlert: React.FC<EmergencyAlertProps> = ({
  patientLocation,
  patientDetails,
  emergencyContacts = [],
  onAlertSent,
  triggerType = 'manual',
  detectedSeverity,
  detectedDetails,
  onFollowUp,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isContacting, setIsContacting] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [alertHistory, setAlertHistory] = useState<EmergencyAlertType[]>([]);

  // Auto-trigger if AI detected emergency
  useEffect(() => {
    if (triggerType === 'ai-detected' && detectedSeverity === 'critical') {
      setOpen(true);
    }
  }, [triggerType, detectedSeverity]);

  const handleTrigger = () => {
    setOpen(true);
  };

  const handleConfirm = async () => {
    setIsContacting(true);
    
    try {
      const alert: EmergencyAlertType = {
        id: Date.now().toString(),
        type: triggerType,
        severity: detectedSeverity || 'high',
        location: patientLocation,
        details: detectedDetails || t('emergency.manualTrigger'),
        timestamp: new Date().toISOString(),
        resolved: false,
      };

      // Notify emergency services
      await notificationService.showNotification(
        t('emergency.alertSent'),
        {
          body: patientLocation || t('emergency.alertActivated'),
          requireInteraction: true,
        }
      );

      // Notify emergency contacts
      const primaryContact = emergencyContacts.find((c) => c.isPrimary);
      if (primaryContact) {
        console.log('Notifying emergency contact:', primaryContact);
        // In production, this would send SMS/email
      }

      // Call emergency services (mock)
      console.log('Calling emergency services...', {
        location: patientLocation,
        details: patientDetails,
        alert,
      });

      setAlertHistory((prev) => [alert, ...prev]);
      setAlertSent(true);
      
      setTimeout(() => {
        setIsContacting(false);
        setOpen(false);
        if (onAlertSent) {
          onAlertSent(alert);
        }
      }, 2000);
    } catch (error) {
      console.error('Failed to send emergency alert:', error);
      setIsContacting(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleFollowUp = () => {
    if (onFollowUp) {
      onFollowUp();
    }
  };

  return (
    <>
      {triggerType === 'ai-detected' && detectedSeverity && (
        <Alert severity={detectedSeverity === 'critical' ? 'error' : 'warning'} sx={{ mb: 2 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Warning />
            <Box>
              <Typography variant="subtitle2">
                {t('emergency.aiDetected')}
              </Typography>
              <Typography variant="body2">
                {detectedDetails || t('emergency.aiDetectedDetails')}
              </Typography>
            </Box>
          </Box>
        </Alert>
      )}

      <EmergencyButton onClick={handleTrigger} fullWidth>
        {t('emergency.trigger')}
      </EmergencyButton>

      {alertSent && (
        <Card sx={{ mt: 2, bgcolor: 'success.light' }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <CheckCircle color="success" />
              <Typography variant="subtitle2" fontWeight={600}>
                {t('emergency.alertSentSuccess')}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {t('emergency.helpOnTheWay')}
            </Typography>
            {onFollowUp && (
              <Button
                startIcon={<Schedule />}
                onClick={handleFollowUp}
                sx={{ mt: 1 }}
                size="small"
              >
                {t('emergency.followUp')}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <LocalHospital color="error" />
            <Typography variant="h6">{t('emergency.title')}</Typography>
            {triggerType === 'ai-detected' && (
              <Chip label={t('emergency.aiDetected')} size="small" color="error" />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {triggerType === 'ai-detected' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {t('emergency.aiDetectedWarning')}
            </Alert>
          )}
          
          <Typography variant="body1" gutterBottom>
            {isContacting ? t('emergency.contacting') : t('emergency.confirmTrigger')}
          </Typography>
          
          {patientLocation && (
            <Box display="flex" alignItems="center" gap={1} mt={2}>
              <LocationOn color="action" />
              <Typography variant="body2" color="text.secondary">
                {t('emergency.location')}: {patientLocation}
              </Typography>
            </Box>
          )}

          {detectedDetails && (
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                {t('emergency.details')}:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {detectedDetails}
              </Typography>
            </Box>
          )}

          {emergencyContacts.length > 0 && (
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                {t('emergency.notifyingContacts')}:
              </Typography>
              <List dense>
                {emergencyContacts.filter((c) => c.isPrimary).map((contact) => (
                  <ListItem key={contact.id}>
                    <ListItemText
                      primary={contact.name}
                      secondary={`${contact.relationship} - ${contact.phone}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} disabled={isContacting}>
            {t('common.cancel')}
          </Button>
          <EmergencyButton onClick={handleConfirm} disabled={isContacting}>
            {isContacting ? t('emergency.contacting') : t('emergency.trigger')}
          </EmergencyButton>
        </DialogActions>
      </Dialog>

      {alertHistory.length > 0 && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              {t('emergency.recentAlerts')}
            </Typography>
            <List>
              {alertHistory.slice(0, 3).map((alert) => (
                <ListItem key={alert.id}>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" fontWeight={600}>
                          {format(new Date(alert.timestamp), 'MMM dd, yyyy HH:mm')}
                        </Typography>
                        <Chip
                          label={alert.severity}
                          size="small"
                          color={alert.severity === 'critical' ? 'error' : 'warning'}
                        />
                      </Box>
                    }
                    secondary={alert.details}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </>
  );
};

