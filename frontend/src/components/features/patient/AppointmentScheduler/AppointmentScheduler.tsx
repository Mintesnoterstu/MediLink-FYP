import React, { useState } from 'react';
import { Typography, Button, List, ListItem, ListItemText, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add, CalendarToday } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useHealthData } from '@/contexts/HealthDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { HealthCard, PrimaryButton, TextField } from '@/components/ui';
import { Appointment } from '@/types';
import { format } from 'date-fns';

export const AppointmentScheduler: React.FC = () => {
  const { t } = useTranslation();
  const { appointments, createAppointment } = useHealthData();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Appointment>>({
    providerId: '',
    providerName: '',
    date: '',
    time: '',
    type: 'consultation',
  });

  const upcoming = appointments.filter((apt) => new Date(apt.date) >= new Date());
  const past = appointments.filter((apt) => new Date(apt.date) < new Date());

  const handleOpen = () => {
    setFormData({
      providerId: '',
      providerName: '',
      date: '',
      time: '',
      type: 'consultation',
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!user?.id) return;

    try {
      await createAppointment({
        patientId: user.id,
        ...formData,
      } as Omit<Appointment, 'id'>);
      setOpen(false);
    } catch (error) {
      console.error('Failed to create appointment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <>
      <HealthCard
        title={t('appointments.title')}
        icon={<CalendarToday color="primary" />}
        action={
          <Button startIcon={<Add />} onClick={handleOpen} variant="outlined" size="small">
            {t('appointments.scheduleAppointment')}
          </Button>
        }
      >
        <Typography variant="subtitle2" gutterBottom>
          {t('appointments.upcoming')}:
        </Typography>
        {upcoming.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No upcoming appointments
          </Typography>
        ) : (
          <List>
            {upcoming.map((apt) => (
              <ListItem key={apt.id}>
                <ListItemText
                  primary={apt.providerName}
                  secondary={`${format(new Date(apt.date), 'MMM dd, yyyy')} at ${apt.time}`}
                />
                <Chip label={apt.status} color={getStatusColor(apt.status)} size="small" />
              </ListItem>
            ))}
          </List>
        )}

        <Typography variant="subtitle2" gutterBottom mt={2}>
          {t('appointments.past')}:
        </Typography>
        {past.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No past appointments
          </Typography>
        ) : (
          <List>
            {past.slice(0, 5).map((apt) => (
              <ListItem key={apt.id}>
                <ListItemText
                  primary={apt.providerName}
                  secondary={`${format(new Date(apt.date), 'MMM dd, yyyy')} at ${apt.time}`}
                />
                <Chip label={apt.status} color={getStatusColor(apt.status)} size="small" />
              </ListItem>
            ))}
          </List>
        )}
      </HealthCard>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('appointments.scheduleAppointment')}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t('appointments.provider')}
            value={formData.providerName}
            onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label={t('appointments.date')}
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            fullWidth
            label={t('appointments.time')}
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
          <PrimaryButton onClick={handleSubmit}>{t('common.save')}</PrimaryButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

