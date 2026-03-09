import React, { useState } from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Switch, FormControlLabel, Chip, Divider, Tabs, Tab } from '@mui/material';
import { Add, Delete, Edit, LocalPharmacy, Notifications, History } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useHealthData } from '@/contexts/HealthDataContext';
import { HealthCard, PrimaryButton, TextField } from '@/components/ui';
import { Medication, Allergy } from '@/types';

interface MedicationManagerProps {
  currentMedications?: Medication[];
  medicationHistory?: Medication[];
  allergies?: Allergy[];
  onMedicationUpdate?: (medication: Medication) => void;
  reminderSettings?: {
    enabled: boolean;
    times: string[];
    notificationMethod: 'push' | 'email' | 'sms';
  };
  pharmacyInfo?: {
    name: string;
    address: string;
    phone: string;
  };
}

export const MedicationManager: React.FC<MedicationManagerProps> = ({
  currentMedications: propCurrentMedications,
  medicationHistory: propMedicationHistory,
  allergies: propAllergies,
  onMedicationUpdate,
  reminderSettings: propReminderSettings,
  pharmacyInfo: propPharmacyInfo,
}) => {
  const { t } = useTranslation();
  const { patientData, addMedication, updateMedication, removeMedication } = useHealthData();
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [formData, setFormData] = useState<Partial<Medication>>({
    name: '',
    dosage: '',
    frequency: '',
    startDate: new Date().toISOString().split('T')[0],
    reminderEnabled: false,
    pharmacy: '',
  });
  const [reminderSettings, setReminderSettings] = useState(
    propReminderSettings || {
      enabled: true,
      times: ['09:00', '21:00'],
      notificationMethod: 'push' as const,
    }
  );

  const currentMedications = propCurrentMedications || patientData?.currentMedications || [];
  const medicationHistory = propMedicationHistory || [];
  const allergies = propAllergies || patientData?.allergies || [];
  const pharmacyInfo = propPharmacyInfo;

  const handleOpen = (med?: Medication) => {
    if (med) {
      setEditingMed(med);
      setFormData(med);
    } else {
      setEditingMed(null);
      setFormData({
        name: '',
        dosage: '',
        frequency: '',
        startDate: new Date().toISOString().split('T')[0],
        reminderEnabled: false,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingMed(null);
  };

  const handleSubmit = async () => {
    try {
      const medicationData = { ...editingMed, ...formData } as Medication;
      if (editingMed) {
        await updateMedication(medicationData);
      } else {
        await addMedication(formData as Omit<Medication, 'id'>);
      }
      if (onMedicationUpdate) {
        onMedicationUpdate(medicationData);
      }
      handleClose();
    } catch (error) {
      console.error('Failed to save medication:', error);
    }
  };

  // Check for drug interactions with allergies
  const checkAllergyInteractions = (medicationName: string): Allergy[] => {
    return allergies.filter((allergy) =>
      medicationName.toLowerCase().includes(allergy.allergen.toLowerCase()) ||
      allergy.allergen.toLowerCase().includes(medicationName.toLowerCase())
    );
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      try {
        await removeMedication(id);
      } catch (error) {
        console.error('Failed to delete medication:', error);
      }
    }
  };

  return (
    <>
      <HealthCard
        title={t('medications.title')}
        action={
          <Button startIcon={<Add />} onClick={() => handleOpen()} variant="outlined" size="small">
            {t('medications.addMedication')}
          </Button>
        }
      >
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
          <Tab label={t('medications.current')} icon={<Notifications />} iconPosition="start" />
          <Tab label={t('medications.history')} icon={<History />} iconPosition="start" />
          <Tab label={t('medications.allergies')} icon={<Delete />} iconPosition="start" />
          {pharmacyInfo && <Tab label={t('medications.pharmacy')} icon={<LocalPharmacy />} iconPosition="start" />}
        </Tabs>

        {tabValue === 0 && (
          <>
            {currentMedications.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t('medications.noCurrentMedications')}
              </Typography>
            ) : (
              <List>
                {currentMedications.map((med) => {
                  const interactions = checkAllergyInteractions(med.name);
                  return (
                    <ListItem
                      key={med.id}
                      secondaryAction={
                        <Box>
                          <IconButton edge="end" onClick={() => handleOpen(med)} size="small">
                            <Edit />
                          </IconButton>
                          <IconButton edge="end" onClick={() => handleDelete(med.id)} size="small" color="error">
                            <Delete />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body1" fontWeight={600}>
                              {med.name}
                            </Typography>
                            {interactions.length > 0 && (
                              <Chip label={t('medications.allergyWarning')} color="error" size="small" />
                            )}
                            {med.reminderEnabled && (
                              <Chip label={t('medications.reminder')} color="primary" size="small" />
                            )}
                          </Box>
                        }
                        secondary={`${med.dosage} - ${med.frequency}${med.pharmacy ? ` | ${t('medications.pharmacy')}: ${med.pharmacy}` : ''}`}
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </>
        )}

        {tabValue === 1 && (
          <>
            {medicationHistory.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t('medications.noHistory')}
              </Typography>
            ) : (
              <List>
                {medicationHistory.map((med) => (
                  <ListItem key={med.id}>
                    <ListItemText
                      primary={med.name}
                      secondary={`${med.dosage} - ${med.frequency} | ${t('medications.startDate')}: ${med.startDate}${med.endDate ? ` - ${t('medications.endDate')}: ${med.endDate}` : ''}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}

        {tabValue === 2 && (
          <>
            {allergies.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t('medications.noAllergies')}
              </Typography>
            ) : (
              <List>
                {allergies.map((allergy) => (
                  <ListItem key={allergy.id}>
                    <ListItemText
                      primary={allergy.allergen}
                      secondary={`${t('medications.severity')}: ${allergy.severity} - ${allergy.reaction}`}
                    />
                    <Chip
                      label={allergy.severity}
                      color={allergy.severity === 'severe' ? 'error' : allergy.severity === 'moderate' ? 'warning' : 'default'}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}

        {tabValue === 3 && pharmacyInfo && (
          <Box>
            <Typography variant="h6" gutterBottom>
              {pharmacyInfo.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {pharmacyInfo.address}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('medications.phone')}: {pharmacyInfo.phone}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={reminderSettings.enabled}
                onChange={(e) => setReminderSettings({ ...reminderSettings, enabled: e.target.checked })}
              />
            }
            label={t('medications.enableReminders')}
          />
          {reminderSettings.enabled && (
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              {t('medications.reminderTimes')}: {reminderSettings.times.join(', ')}
            </Typography>
          )}
        </Box>
      </HealthCard>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMed ? t('common.edit') : t('medications.addMedication')}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t('medications.medicationName')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label={t('medications.dosage')}
            value={formData.dosage}
            onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label={t('medications.frequency')}
            value={formData.frequency}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label={t('medications.startDate')}
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label={t('medications.endDate')}
            type="date"
            value={formData.endDate || ''}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value || undefined })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            helperText={t('medications.endDateOptional')}
          />
          <TextField
            fullWidth
            label={t('medications.pharmacy')}
            value={formData.pharmacy || ''}
            onChange={(e) => setFormData({ ...formData, pharmacy: e.target.value })}
            margin="normal"
            placeholder={t('medications.pharmacyPlaceholder')}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.reminderEnabled || false}
                onChange={(e) => setFormData({ ...formData, reminderEnabled: e.target.checked })}
              />
            }
            label={t('medications.enableReminder')}
            sx={{ mt: 2 }}
          />
          {checkAllergyInteractions(formData.name || '').length > 0 && (
            <Box mt={2} p={2} bgcolor="error.light" borderRadius={1}>
              <Typography variant="body2" color="error.dark">
                {t('medications.allergyWarning')}: {checkAllergyInteractions(formData.name || '').map(a => a.allergen).join(', ')}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('common.cancel')}</Button>
          <PrimaryButton onClick={handleSubmit}>
            {t('common.save')}
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

