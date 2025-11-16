import React, { useMemo } from 'react';
import { Grid, Box, Typography, Card, CardContent, List, ListItem, ListItemText, Chip, Avatar } from '@mui/material';
import { People, Assignment, Schedule, TrendingUp, LocalHospital } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { HealthCard } from '@/components/ui';
import { Appointment, PatientData } from '@/types';
import { format } from 'date-fns';

interface ProviderDashboardProps {
  patientCount?: number;
  upcomingAppointments?: Appointment[];
  recentPatients?: PatientData[];
  onPatientSelect?: (patientId: string) => void;
  onAppointmentSelect?: (appointmentId: string) => void;
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({
  patientCount,
  upcomingAppointments = [],
  recentPatients = [],
  onPatientSelect,
  onAppointmentSelect,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const todayAppointments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return upcomingAppointments.filter(
      (apt) => apt.date.startsWith(today) && apt.status === 'scheduled'
    );
  }, [upcomingAppointments]);

  const upcomingAppointmentsList = useMemo(() => {
    return upcomingAppointments
      .filter((apt) => apt.status === 'scheduled')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [upcomingAppointments]);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight={700} mb={3}>
        {t('provider.welcome')}, {user?.name}
      </Typography>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {patientCount || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('provider.totalPatients')}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <People />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {todayAppointments.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('provider.todayAppointments')}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <Schedule />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {upcomingAppointmentsList.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('provider.upcoming')}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <Assignment />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {recentPatients.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('provider.recentPatients')}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Appointments */}
        <Grid item xs={12} md={6}>
          <HealthCard title={t('provider.todayAppointments')} icon={<Schedule color="primary" />}>
            {todayAppointments.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t('provider.noAppointmentsToday')}
              </Typography>
            ) : (
              <List>
                {todayAppointments.map((apt) => (
                  <ListItem
                    key={apt.id}
                    button
                    onClick={() => onAppointmentSelect?.(apt.id)}
                    sx={{ mb: 1, bgcolor: 'background.default', borderRadius: 1 }}
                  >
                    <ListItemText
                      primary={apt.patientId}
                      secondary={`${apt.time} - ${apt.type}`}
                    />
                    <Chip label={apt.status} size="small" color="primary" />
                  </ListItem>
                ))}
              </List>
            )}
          </HealthCard>
        </Grid>

        {/* Upcoming Appointments */}
        <Grid item xs={12} md={6}>
          <HealthCard title={t('provider.upcomingAppointments')} icon={<LocalHospital color="primary" />}>
            {upcomingAppointmentsList.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t('provider.noUpcomingAppointments')}
              </Typography>
            ) : (
              <List>
                {upcomingAppointmentsList.map((apt) => (
                  <ListItem
                    key={apt.id}
                    button
                    onClick={() => onAppointmentSelect?.(apt.id)}
                    sx={{ mb: 1, bgcolor: 'background.default', borderRadius: 1 }}
                  >
                    <ListItemText
                      primary={apt.patientId}
                      secondary={`${format(new Date(apt.date), 'MMM dd, yyyy')} at ${apt.time}`}
                    />
                    <Chip label={apt.type} size="small" />
                  </ListItem>
                ))}
              </List>
            )}
          </HealthCard>
        </Grid>

        {/* Recent Patients */}
        {recentPatients.length > 0 && (
          <Grid item xs={12}>
            <HealthCard title={t('provider.recentPatients')} icon={<People color="primary" />}>
              <Grid container spacing={2}>
                {recentPatients.slice(0, 6).map((patient) => (
                  <Grid item xs={12} sm={6} md={4} key={patient.id}>
                    <Card
                      sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}
                      onClick={() => onPatientSelect?.(patient.id)}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Patient ID: {patient.id.slice(0, 8)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('provider.age')}: {patient.age} | {t('provider.gender')}: {patient.gender}
                        </Typography>
                        <Box mt={1}>
                          <Chip
                            label={`${patient.currentMedications.length} ${t('provider.medications')}`}
                            size="small"
                            sx={{ mr: 0.5 }}
                          />
                          <Chip
                            label={`${patient.allergies.length} ${t('provider.allergies')}`}
                            size="small"
                            color="warning"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </HealthCard>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
