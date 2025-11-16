import React, { useEffect, useMemo } from 'react';
import { Grid, Box, Typography, LinearProgress, Chip, List, ListItem, ListItemText, Button, Paper, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useHealthData } from '@/contexts/HealthDataContext';
import { useTranslation } from 'react-i18next';
import { HealthCard, MetricCard, LoadingSpinner } from '@/components/ui';
import { AIHealthAdvisor, EmergencyAlert } from '@/components/features/shared';
import { Favorite, LocalHospital, Medication, CalendarToday, TrendingUp, TrendingDown, Remove, History, Security, Add, Assignment, Vaccines, Warning } from '@mui/icons-material';
import { format, subDays, isAfter, parseISO, addDays, differenceInDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PatientData, MedicationAdherence, HealthTrend, ConsentRecord, Appointment, AIRecommendation } from '@/types';

interface HealthDashboardProps {
  patientData?: PatientData;
  healthMetrics?: any;
  aiRecommendations?: AIRecommendation[];
  onDataUpdate?: (data: any) => void;
  onEmergencyAlert?: () => void;
  isLoading?: boolean;
  language?: 'en' | 'am';
  theme?: 'light' | 'dark';
  aiService?: any;
  onAIFeedback?: (feedback: any) => void;
}

export const HealthDashboard: React.FC<HealthDashboardProps> = ({
  patientData: propPatientData,
  healthMetrics: _propHealthMetrics,
  aiRecommendations: propAIRecommendations,
  onDataUpdate: _onDataUpdate,
  onEmergencyAlert,
  isLoading: propIsLoading,
  language: _language,
  theme: _theme,
  aiService: _aiService,
  onAIFeedback: _onAIFeedback,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    patientData: contextPatientData,
    aiRecommendations: contextAIRecommendations,
    appointments,
    loadPatientData,
    loadAIRecommendations,
    loadAppointments,
    isLoading: contextIsLoading,
  } = useHealthData();

  const patientData = propPatientData || contextPatientData;
  const aiRecommendations = propAIRecommendations || contextAIRecommendations;
  const isLoading = propIsLoading !== undefined ? propIsLoading : contextIsLoading;

  useEffect(() => {
    if (user?.id && !propPatientData) {
      loadPatientData(user.id);
      loadAIRecommendations(user.id);
      loadAppointments(user.id);
    }
  }, [user?.id, loadPatientData, loadAIRecommendations, loadAppointments, propPatientData]);

  // Fallback data to prevent white screen
  const fallbackPatientData = useMemo(() => {
    if (patientData) return patientData;
    return {
      id: 'fallback',
      userId: user?.id || 'user-1',
      age: 0,
      gender: 'other' as const,
      medicalHistory: [],
      currentMedications: [],
      allergies: [],
      vitalSigns: [],
      emergencyContacts: [],
      location: 'Unknown',
    } as PatientData;
  }, [patientData, user?.id]);

  const displayPatientData = patientData || fallbackPatientData;
  const latestVitals = displayPatientData?.vitalSigns?.[displayPatientData.vitalSigns.length - 1];
  const currentMedications = displayPatientData?.currentMedications || [];

  // Calculate medication adherence statistics
  const medicationAdherence = useMemo<MedicationAdherence[]>(() => {
    if (!displayPatientData?.currentMedications) return [];
    
    return displayPatientData.currentMedications.map((med) => {
      // Mock calculation - in production, this would come from actual adherence tracking
      const totalDoses = 30; // Example: 30 doses expected
      const missedDoses = Math.floor(Math.random() * 5); // Example: 0-4 missed
      const adherenceRate = ((totalDoses - missedDoses) / totalDoses) * 100;
      
      return {
        medicationId: med.id,
        medicationName: med.name,
        adherenceRate,
        missedDoses,
        totalDoses,
        lastTaken: new Date().toISOString(),
        nextDose: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours from now
      };
    });
  }, [displayPatientData?.currentMedications]);

  // Generate health trend data
  const healthTrends = useMemo<HealthTrend[]>(() => {
    if (!displayPatientData?.vitalSigns || displayPatientData.vitalSigns.length === 0) return [];
    
    const heartRateTrend: HealthTrend = {
      metric: 'Heart Rate',
      dataPoints: displayPatientData.vitalSigns
        .filter(v => v.heartRate)
        .slice(-7)
        .map((v, idx) => ({
          date: format(subDays(new Date(), 6 - idx), 'MMM dd'),
          value: v.heartRate || 0,
        })),
      trend: 'stable',
      unit: 'bpm',
    };

    return [heartRateTrend];
  }, [displayPatientData?.vitalSigns]);

  // Get appointment history
  const appointmentHistory = useMemo(() => {
    if (!displayPatientData?.appointments && !appointments) return [];
    const allAppointments = displayPatientData?.appointments || appointments || [];
    return allAppointments
      .filter((apt: Appointment) => apt.status === 'completed')
      .sort((a: Appointment, b: Appointment) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, 5);
  }, [displayPatientData?.appointments, appointments]);

  // Get upcoming appointments
  const upcomingAppointments = useMemo(() => {
    if (!displayPatientData?.appointments && !appointments) return [];
    const allAppointments = displayPatientData?.appointments || appointments || [];
    return allAppointments
      .filter((apt: Appointment) => 
        apt.status === 'scheduled' && isAfter(parseISO(apt.date), new Date())
      )
      .sort((a: Appointment, b: Appointment) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      .slice(0, 3);
  }, [displayPatientData?.appointments, appointments]);

  // Get consent records
  const consentRecords = useMemo(() => {
    return displayPatientData?.consentRecords || [];
  }, [displayPatientData?.consentRecords]);

  const navigate = useNavigate();

  if (isLoading) {
    return <LoadingSpinner message={t('common.loading')} />;
  }

  // Calculate Health Score (0-100)
  const healthScore = useMemo(() => {
    let score = 70; // Base score
    if (latestVitals) {
      // Blood pressure check (normal: 120/80)
      if (latestVitals.bloodPressure) {
        const [systolic, diastolic] = latestVitals.bloodPressure.split('/').map(Number);
        if (systolic >= 90 && systolic <= 120 && diastolic >= 60 && diastolic <= 80) score += 10;
        else if (systolic > 140 || diastolic > 90) score -= 15;
      }
      // Heart rate check (normal: 60-100)
      if (latestVitals.heartRate) {
        if (latestVitals.heartRate >= 60 && latestVitals.heartRate <= 100) score += 10;
        else score -= 5;
      }
      // Temperature check (normal: 36.1-37.2°C)
      if (latestVitals.temperature) {
        if (latestVitals.temperature >= 36.1 && latestVitals.temperature <= 37.2) score += 10;
        else score -= 10;
      }
    }
    // Medication adherence bonus
    if (medicationAdherence.length > 0) {
      const avgAdherence = medicationAdherence.reduce((sum, m) => sum + m.adherenceRate, 0) / medicationAdherence.length;
      score += (avgAdherence / 100) * 10;
    }
    return Math.max(0, Math.min(100, Math.round(score)));
  }, [latestVitals, medicationAdherence]);

  // Get active conditions from medical history
  const activeConditions = useMemo(() => {
    if (!displayPatientData?.medicalHistory) return [];
    return displayPatientData.medicalHistory
      .filter((record: any) => {
        const recordDate = parseISO(record.date);
        const daysSince = differenceInDays(new Date(), recordDate);
        return daysSince <= 90; // Active if within last 90 days
      })
      .map((record: any) => record.diagnosis)
      .slice(0, 5);
  }, [displayPatientData?.medicalHistory]);

  // Get recent lab results (mock data - in production from API)
  const recentLabResults = useMemo(() => {
    return [
      { name: 'Blood Glucose', value: '95 mg/dL', status: 'normal', date: format(subDays(new Date(), 7), 'MMM dd, yyyy') },
      { name: 'Hemoglobin', value: '14.2 g/dL', status: 'normal', date: format(subDays(new Date(), 14), 'MMM dd, yyyy') },
      { name: 'Cholesterol', value: '180 mg/dL', status: 'normal', date: format(subDays(new Date(), 30), 'MMM dd, yyyy') },
    ];
  }, []);

  // Get vaccination reminders (mock data - in production from API)
  const vaccinationReminders = useMemo(() => {
    return [
      { name: 'COVID-19 Booster', dueDate: addDays(new Date(), 30), status: 'upcoming' },
      { name: 'Flu Vaccine', dueDate: addDays(new Date(), 60), status: 'upcoming' },
    ];
  }, []);

  // Get recent activity timeline
  const recentActivity = useMemo(() => {
    const activities: Array<{ type: string; title: string; date: Date; icon: React.ReactNode }> = [];
    
    // Add recent appointments
    upcomingAppointments.slice(0, 3).forEach((apt: Appointment) => {
      activities.push({
        type: 'appointment',
        title: `Appointment with ${apt.providerName}`,
        date: parseISO(apt.date),
        icon: <CalendarToday />,
      });
    });

    // Add recent medications
    currentMedications.slice(0, 2).forEach((med: any) => {
      activities.push({
        type: 'medication',
        title: `Started ${med.name}`,
        date: parseISO(med.startDate),
        icon: <Medication />,
      });
    });

    // Sort by date
    return activities.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
  }, [upcomingAppointments, currentMedications]);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight={700} mb={3}>
        {t('dashboard.welcome')}, {user?.name}
      </Typography>

      <Grid container spacing={3}>
        {/* Health Overview Section */}
        <Grid item xs={12}>
          <HealthCard title={t('dashboard.healthOverview')} icon={<Favorite color="primary" />}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Box textAlign="center" p={2} bgcolor="primary.light" borderRadius={2}>
                  <Typography variant="h3" fontWeight={700} color="primary.main">
                    {healthScore}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Health Score
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={healthScore}
                    color={healthScore >= 80 ? 'success' : healthScore >= 60 ? 'warning' : 'error'}
                    sx={{ mt: 1, height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={9}>
                <Grid container spacing={2}>
                  {latestVitals && (
                    <>
                      {latestVitals.bloodPressure && (
                        <Grid item xs={6} sm={4}>
                          <MetricCard
                            label="Blood Pressure"
                            value={latestVitals.bloodPressure}
                            unit="mmHg"
                          />
                        </Grid>
                      )}
                      {latestVitals.heartRate && (
                        <Grid item xs={6} sm={4}>
                          <MetricCard
                            label="Heart Rate"
                            value={latestVitals.heartRate}
                            unit="bpm"
                          />
                        </Grid>
                      )}
                      {latestVitals.temperature && (
                        <Grid item xs={6} sm={4}>
                          <MetricCard
                            label="Temperature"
                            value={latestVitals.temperature}
                            unit="°C"
                          />
                        </Grid>
                      )}
                      {latestVitals.weight && (
                        <Grid item xs={6} sm={4}>
                          <MetricCard
                            label="Weight"
                            value={latestVitals.weight}
                            unit="kg"
                          />
                        </Grid>
                      )}
                    </>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </HealthCard>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <HealthCard title={t('dashboard.quickActions')} icon={<Add color="primary" />}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<LocalHospital />}
                  onClick={() => navigate('/symptoms')}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {t('dashboard.logSymptoms')}
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CalendarToday />}
                  onClick={() => navigate('/appointments')}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {t('dashboard.bookAppointment')}
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Medication />}
                  onClick={() => navigate('/medications')}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {t('dashboard.addMedication')}
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Assignment />}
                  onClick={() => navigate('/records')}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {t('dashboard.viewRecords')}
                </Button>
              </Grid>
            </Grid>
          </HealthCard>
        </Grid>

        {/* Medical Summary */}
        <Grid item xs={12} md={8}>
          <HealthCard title={t('dashboard.medicalSummary')} icon={<LocalHospital color="primary" />}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  {t('dashboard.activeConditions')}
                </Typography>
                {activeConditions.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    {t('dashboard.noActiveConditions')}
                  </Typography>
                ) : (
                  <Box>
                    {activeConditions.map((condition, idx) => (
                      <Chip key={idx} label={condition} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                    ))}
                  </Box>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  {t('dashboard.recentLabResults')}
                </Typography>
                {recentLabResults.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    {t('dashboard.noLabResults')}
                  </Typography>
                ) : (
                  <List dense>
                    {recentLabResults.map((result, idx) => (
                      <ListItem key={idx} disablePadding>
                        <ListItemText
                          primary={result.name}
                          secondary={`${result.value} - ${result.date}`}
                        />
                        <Chip
                          label={result.status}
                          size="small"
                          color={result.status === 'normal' ? 'success' : 'warning'}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Grid>
            </Grid>
          </HealthCard>
        </Grid>

        {/* Recent Activity Timeline */}
        <Grid item xs={12} md={6}>
          <HealthCard title={t('dashboard.recentActivity')} icon={<History color="primary" />}>
            {recentActivity.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t('dashboard.noRecentActivity')}
              </Typography>
            ) : (
              <List>
                {recentActivity.map((activity, idx) => (
                  <ListItem key={idx} sx={{ pl: 0, pr: 0 }}>
                    <Box display="flex" alignItems="center" gap={2} width="100%">
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: 'primary.light',
                          color: 'primary.main',
                        }}
                      >
                        {activity.icon}
                      </Box>
                      <Box flex={1}>
                        <Typography variant="body2" fontWeight={600}>
                          {activity.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(activity.date, 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                    </Box>
                    {idx < recentActivity.length - 1 && <Divider sx={{ mt: 1, mb: 1 }} />}
                  </ListItem>
                ))}
              </List>
            )}
          </HealthCard>
        </Grid>

        {/* Appointments & Reminders */}
        <Grid item xs={12} md={6}>
          <HealthCard title={t('dashboard.appointmentsReminders')} icon={<CalendarToday color="primary" />}>
            <Box mb={2}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                {t('dashboard.upcomingAppointments')} (Next 7 Days)
              </Typography>
              {upcomingAppointments.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {t('dashboard.noUpcomingAppointments')}
                </Typography>
              ) : (
                <Box>
                  {upcomingAppointments
                    .filter((apt: Appointment) => {
                      const aptDate = parseISO(apt.date);
                      return differenceInDays(aptDate, new Date()) <= 7;
                    })
                    .map((apt: Appointment) => (
                      <Paper key={apt.id} elevation={0} sx={{ p: 1.5, mb: 1, bgcolor: 'background.default' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="start">
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {apt.providerName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(parseISO(apt.date), 'MMM dd, yyyy')} at {apt.time}
                            </Typography>
                          </Box>
                          <Chip label={apt.type} size="small" />
                        </Box>
                      </Paper>
                    ))}
                </Box>
              )}
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                <Vaccines fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                {t('dashboard.vaccinationReminders')}
              </Typography>
              {vaccinationReminders.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {t('dashboard.noVaccinationReminders')}
                </Typography>
              ) : (
                <Box>
                  {vaccinationReminders.map((vaccine, idx) => (
                    <Paper key={idx} elevation={0} sx={{ p: 1.5, mb: 1, bgcolor: 'warning.light' }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {vaccine.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Due: {format(vaccine.dueDate, 'MMM dd, yyyy')}
                          </Typography>
                        </Box>
                        <Chip
                          icon={<Warning />}
                          label={`${differenceInDays(vaccine.dueDate, new Date())} days`}
                          size="small"
                          color="warning"
                        />
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          </HealthCard>
        </Grid>

        {/* Emergency Alert */}
        <Grid item xs={12} md={4}>
          <EmergencyAlert
            patientLocation={displayPatientData?.location}
            patientDetails={displayPatientData}
            onAlertSent={onEmergencyAlert}
          />
        </Grid>

        {/* AI Health Advisor */}
        <Grid item xs={12} md={6}>
          <AIHealthAdvisor patientContext={displayPatientData} />
        </Grid>

        {/* AI Recommendations */}
        <Grid item xs={12} md={6}>
          <HealthCard title={t('dashboard.aiRecommendations')} icon={<LocalHospital color="primary" />}>
            {aiRecommendations.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No recommendations yet
              </Typography>
            ) : (
              <Box>
                {aiRecommendations.slice(0, 3).map((rec: any) => (
                  <Box key={rec.id} mb={2} p={2} bgcolor="background.default" borderRadius={1}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {rec.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {rec.message}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </HealthCard>
        </Grid>

        {/* Current Medications */}
        <Grid item xs={12} md={6}>
          <HealthCard title={t('dashboard.medications')} icon={<Medication color="primary" />}>
            {currentMedications.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No current medications
              </Typography>
            ) : (
              <Box>
                {currentMedications.slice(0, 3).map((med: any) => (
                  <Box key={med.id} mb={1}>
                    <Typography variant="body2" fontWeight={600}>
                      {med.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {med.dosage} - {med.frequency}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </HealthCard>
        </Grid>

        {/* Upcoming Appointments */}
        <Grid item xs={12} md={6}>
          <HealthCard title={t('dashboard.upcomingAppointments')} icon={<CalendarToday color="primary" />}>
            {upcomingAppointments.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t('dashboard.noUpcomingAppointments')}
              </Typography>
            ) : (
              <Box>
                {upcomingAppointments.map((apt: Appointment) => (
                  <Box key={apt.id} mb={1} p={1} bgcolor="background.default" borderRadius={1}>
                    <Typography variant="body2" fontWeight={600}>
                      {apt.providerName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(parseISO(apt.date), 'MMM dd, yyyy')} at {apt.time}
                    </Typography>
                    <Chip label={apt.type} size="small" sx={{ mt: 0.5 }} />
                  </Box>
                ))}
              </Box>
            )}
          </HealthCard>
        </Grid>

        {/* Appointment History */}
        <Grid item xs={12} md={6}>
          <HealthCard title={t('dashboard.appointmentHistory')} icon={<History color="primary" />}>
            {appointmentHistory.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t('dashboard.noAppointmentHistory')}
              </Typography>
            ) : (
              <List dense>
                {appointmentHistory.map((apt: Appointment) => (
                  <ListItem key={apt.id} divider>
                    <ListItemText
                      primary={apt.providerName}
                      secondary={`${format(parseISO(apt.date), 'MMM dd, yyyy')} - ${apt.type}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </HealthCard>
        </Grid>

        {/* Medication Adherence */}
        <Grid item xs={12} md={6}>
          <HealthCard title={t('dashboard.medicationAdherence')} icon={<Medication color="primary" />}>
            {medicationAdherence.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t('dashboard.noMedications')}
              </Typography>
            ) : (
              <Box>
                {medicationAdherence.map((adherence) => (
                  <Box key={adherence.medicationId} mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" fontWeight={600}>
                        {adherence.medicationName}
                      </Typography>
                      <Chip
                        label={`${adherence.adherenceRate.toFixed(0)}%`}
                        color={adherence.adherenceRate >= 80 ? 'success' : adherence.adherenceRate >= 60 ? 'warning' : 'error'}
                        size="small"
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={adherence.adherenceRate}
                      color={adherence.adherenceRate >= 80 ? 'success' : adherence.adherenceRate >= 60 ? 'warning' : 'error'}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                      {adherence.missedDoses} {t('dashboard.missedDoses')} of {adherence.totalDoses}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </HealthCard>
        </Grid>

        {/* Health Trends */}
        {healthTrends.length > 0 && (
          <Grid item xs={12} md={6}>
            <HealthCard title={t('dashboard.healthTrends')} icon={<TrendingUp color="primary" />}>
              {healthTrends.map((trend) => (
                <Box key={trend.metric} mb={3}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {trend.metric}
                    </Typography>
                    {trend.trend === 'improving' && <TrendingUp color="success" />}
                    {trend.trend === 'declining' && <TrendingDown color="error" />}
                    {trend.trend === 'stable' && <Remove color="action" />}
                  </Box>
                  <ResponsiveContainer width="100%" height={150}>
                    <LineChart data={trend.dataPoints}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#1976d2" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              ))}
            </HealthCard>
          </Grid>
        )}

        {/* Consent Records */}
        {consentRecords.length > 0 && (
          <Grid item xs={12} md={6}>
            <HealthCard title={t('dashboard.consentRecords')} icon={<Security color="primary" />}>
              <List dense>
                {consentRecords.map((consent: ConsentRecord) => (
                  <ListItem key={consent.id} divider>
                    <ListItemText
                      primary={consent.providerName}
                      secondary={`${t('consent.grantedAt')}: ${format(parseISO(consent.grantedAt), 'MMM dd, yyyy')}`}
                    />
                    <Chip
                      label={consent.expiresAt && isAfter(new Date(), parseISO(consent.expiresAt)) ? t('consent.expired') : t('consent.active')}
                      size="small"
                      color={consent.expiresAt && isAfter(new Date(), parseISO(consent.expiresAt)) ? 'default' : 'success'}
                    />
                  </ListItem>
                ))}
              </List>
            </HealthCard>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

