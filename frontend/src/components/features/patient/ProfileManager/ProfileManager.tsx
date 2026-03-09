import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Card, CardContent, Grid, Divider, Switch, FormControlLabel, Tabs, Tab, Chip } from '@mui/material';
import { Person, Email, Phone, Notifications, Security, Edit } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useHealthData } from '@/contexts/HealthDataContext';
import { PrimaryButton } from '@/components/ui';
import { PatientData, NotificationPreferences, EmergencyContact } from '@/types';

interface ProfileManagerProps {
  patientData?: PatientData;
  onProfileUpdate?: (data: Partial<PatientData>) => Promise<void>;
  onNotificationPreferencesUpdate?: (prefs: NotificationPreferences) => Promise<void>;
  onEmergencyContactUpdate?: (contacts: EmergencyContact[]) => Promise<void>;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({
  patientData: propPatientData,
  onProfileUpdate,
  onNotificationPreferencesUpdate,
  onEmergencyContactUpdate: _onEmergencyContactUpdate,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { patientData: contextPatientData, updatePatientData } = useHealthData();
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  const patientData = propPatientData || contextPatientData;

  const [formData, setFormData] = useState({
    age: patientData?.age || 0,
    gender: patientData?.gender || 'other' as const,
    location: patientData?.location || '',
    phone: user?.phone || '',
  });

  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(
    patientData?.notificationPreferences || {
      appointmentReminders: true,
      medicationReminders: true,
      healthAlerts: true,
      aiRecommendations: true,
      emailNotifications: true,
      smsNotifications: false,
    }
  );

  const [emergencyContacts] = useState<EmergencyContact[]>(
    patientData?.emergencyContacts || []
  );

  const handleSave = async () => {
    try {
      const updateData = {
        age: formData.age,
        gender: formData.gender,
        location: formData.location,
        notificationPreferences: notificationPrefs,
        emergencyContacts,
      };
      
      if (onProfileUpdate) {
        await onProfileUpdate(updateData);
      } else {
        await updatePatientData(updateData);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight={700} mb={3}>
        {t('profile.title')}
      </Typography>

      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label={t('profile.personalInfo')} icon={<Person />} iconPosition="start" />
        <Tab label={t('profile.notifications')} icon={<Notifications />} iconPosition="start" />
        <Tab label={t('profile.emergencyContacts')} icon={<Security />} iconPosition="start" />
      </Tabs>

      {/* Personal Information Tab */}
      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">{t('profile.personalInformation')}</Typography>
              <Button
                startIcon={<Edit />}
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? 'outlined' : 'contained'}
              >
                {isEditing ? t('common.cancel') : t('common.edit')}
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('auth.name')}
                  value={user?.name || ''}
                  disabled
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('auth.email')}
                  value={user?.email || ''}
                  disabled
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('profile.age')}
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('profile.gender')}
                  select
                  SelectProps={{ native: true }}
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  disabled={!isEditing}
                >
                  <option value="male">{t('profile.male')}</option>
                  <option value="female">{t('profile.female')}</option>
                  <option value="other">{t('profile.other')}</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('profile.phone')}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('profile.location')}
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  disabled={!isEditing}
                />
              </Grid>
            </Grid>

            {isEditing && (
              <Box mt={3}>
                <PrimaryButton onClick={handleSave}>
                  {t('common.save')}
                </PrimaryButton>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('profile.notificationPreferences')}
            </Typography>
            <Box mt={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationPrefs.appointmentReminders}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        appointmentReminders: e.target.checked,
                      })
                    }
                  />
                }
                label={t('profile.appointmentReminders')}
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationPrefs.medicationReminders}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        medicationReminders: e.target.checked,
                      })
                    }
                  />
                }
                label={t('profile.medicationReminders')}
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationPrefs.healthAlerts}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        healthAlerts: e.target.checked,
                      })
                    }
                  />
                }
                label={t('profile.healthAlerts')}
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationPrefs.aiRecommendations}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        aiRecommendations: e.target.checked,
                      })
                    }
                  />
                }
                label={t('profile.aiRecommendations')}
              />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              {t('profile.deliveryMethods')}
            </Typography>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationPrefs.emailNotifications}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        emailNotifications: e.target.checked,
                      })
                    }
                  />
                }
                label={t('profile.emailNotifications')}
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationPrefs.smsNotifications}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        smsNotifications: e.target.checked,
                      })
                    }
                  />
                }
                label={t('profile.smsNotifications')}
              />
            </Box>
            <Box mt={3}>
              <PrimaryButton
                onClick={async () => {
                  await onNotificationPreferencesUpdate?.(notificationPrefs);
                }}
              >
                {t('common.save')}
              </PrimaryButton>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Emergency Contacts Tab */}
      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('profile.emergencyContacts')}
            </Typography>
            {emergencyContacts.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t('profile.noEmergencyContacts')}
              </Typography>
            ) : (
              <Box>
                {emergencyContacts.map((contact) => (
                  <Box key={contact.id} mb={2} p={2} bgcolor="background.default" borderRadius={1}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {contact.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('profile.relationship')}: {contact.relationship}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('profile.phone')}: {contact.phone}
                    </Typography>
                    {contact.isPrimary && (
                      <Chip label={t('profile.primary')} size="small" color="primary" sx={{ mt: 1 }} />
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

