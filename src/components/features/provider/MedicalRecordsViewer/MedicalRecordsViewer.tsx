import React, { useState, useMemo } from 'react';
import { Box, Typography, Tabs, Tab, List, ListItem, ListItemText, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, Divider } from '@mui/material';
import { Description, Medication, Favorite, History } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { HealthCard, PrimaryButton } from '@/components/ui';
import { PatientData, MedicalRecord, ConsentRecord } from '@/types';
import { format } from 'date-fns';

interface MedicalRecordsViewerProps {
  patientData: PatientData;
  consentRecords?: ConsentRecord[];
  onRequestConsent?: () => void;
  canViewRecords?: boolean;
  canViewMedications?: boolean;
  canViewVitals?: boolean;
}

export const MedicalRecordsViewer: React.FC<MedicalRecordsViewerProps> = ({
  patientData,
  consentRecords = [],
  onRequestConsent,
  canViewRecords = true,
  canViewMedications = true,
  canViewVitals = true,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);

  // Check if provider has consent for specific data types
  const hasConsentFor = (type: 'records' | 'medications' | 'vitals'): boolean => {
    if (consentRecords.length === 0) return false;
    const now = new Date();
    return consentRecords.some((consent) => {
      if (consent.revokedAt) return false;
      if (consent.expiresAt && new Date(consent.expiresAt) < now) return false;
      return consent.permissions.some((perm) => perm.type === type && perm.access === 'read');
    });
  };

  const canView = {
    records: canViewRecords && hasConsentFor('records'),
    medications: canViewMedications && hasConsentFor('medications'),
    vitals: canViewVitals && hasConsentFor('vitals'),
  };

  const handleRecordClick = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setRecordDialogOpen(true);
  };

  const sortedRecords = useMemo(() => {
    return [...patientData.medicalHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [patientData.medicalHistory]);

  const sortedVitals = useMemo(() => {
    return [...(patientData.vitalSigns || [])].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [patientData.vitalSigns]);

  if (!canView.records && !canView.medications && !canView.vitals) {
    return (
      <HealthCard title={t('provider.medicalRecords')} icon={<Description color="primary" />}>
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {t('provider.noConsentToView')}
          </Typography>
          {onRequestConsent && (
            <PrimaryButton onClick={onRequestConsent} sx={{ mt: 2 }}>
              {t('provider.requestConsent')}
            </PrimaryButton>
          )}
        </Box>
      </HealthCard>
    );
  }

  return (
    <Box>
      <HealthCard title={t('provider.medicalRecords')} icon={<Description color="primary" />}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
          {canView.records && (
            <Tab label={t('provider.records')} icon={<History />} iconPosition="start" />
          )}
          {canView.medications && (
            <Tab label={t('provider.medications')} icon={<Medication />} iconPosition="start" />
          )}
          {canView.vitals && (
            <Tab label={t('provider.vitalSigns')} icon={<Favorite />} iconPosition="start" />
          )}
        </Tabs>

        {/* Medical Records Tab */}
        {activeTab === 0 && canView.records && (
          <Box>
            {sortedRecords.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t('provider.noMedicalRecords')}
              </Typography>
            ) : (
              <List>
                {sortedRecords.map((record) => (
                  <ListItem
                    key={record.id}
                    button
                    onClick={() => handleRecordClick(record)}
                    sx={{ mb: 1, bgcolor: 'background.default', borderRadius: 1 }}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {record.diagnosis}
                          </Typography>
                          <Chip label={format(new Date(record.date), 'MMM dd, yyyy')} size="small" />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {t('provider.provider')}: {record.providerName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {record.notes.substring(0, 100)}...
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}

        {/* Medications Tab */}
        {((activeTab === 0 && !canView.records) || (activeTab === 1 && canView.records) || (activeTab === 0 && !canView.records && canView.medications)) && canView.medications && (
          <Box>
            {patientData.currentMedications.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t('provider.noMedications')}
              </Typography>
            ) : (
              <List>
                {patientData.currentMedications.map((med) => (
                  <ListItem key={med.id} sx={{ mb: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {med.name}
                          </Typography>
                          {med.reminderEnabled && (
                            <Chip label={t('provider.active')} size="small" color="success" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {med.dosage} - {med.frequency}
                          {med.pharmacy && ` | ${t('provider.pharmacy')}: ${med.pharmacy}`}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}

        {/* Vital Signs Tab */}
        {((activeTab === 2 && canView.records && canView.medications) || 
          (activeTab === 1 && canView.records && !canView.medications) ||
          (activeTab === 0 && !canView.records && !canView.medications)) && canView.vitals && (
          <Box>
            {sortedVitals.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t('provider.noVitalSigns')}
              </Typography>
            ) : (
              <List>
                {sortedVitals.slice(0, 10).map((vital, idx) => (
                  <ListItem key={idx} sx={{ mb: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {format(new Date(vital.date), 'MMM dd, yyyy')}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box display="flex" flexWrap="wrap" gap={1} mt={0.5}>
                          {vital.bloodPressure && (
                            <Chip label={`BP: ${vital.bloodPressure}`} size="small" />
                          )}
                          {vital.heartRate && (
                            <Chip label={`HR: ${vital.heartRate} bpm`} size="small" />
                          )}
                          {vital.temperature && (
                            <Chip label={`Temp: ${vital.temperature}°C`} size="small" />
                          )}
                          {vital.weight && (
                            <Chip label={`Weight: ${vital.weight} kg`} size="small" />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}
      </HealthCard>

      {/* Record Detail Dialog */}
      <Dialog open={recordDialogOpen} onClose={() => setRecordDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{selectedRecord?.diagnosis}</Typography>
            <Chip label={format(new Date(selectedRecord?.date || ''), 'MMM dd, yyyy')} />
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('provider.provider')}
            </Typography>
            <Typography variant="body1">{selectedRecord?.providerName}</Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box mb={2}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('provider.notes')}
            </Typography>
            <Typography variant="body1">{selectedRecord?.notes}</Typography>
          </Box>
          {selectedRecord?.attachments && selectedRecord.attachments.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {t('provider.attachments')}
                </Typography>
                {selectedRecord.attachments.map((attachment, idx) => (
                  <Chip key={idx} label={attachment} sx={{ mr: 1, mb: 1 }} />
                ))}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRecordDialogOpen(false)}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
