import React from 'react';
import { Alert, Box, Card, CardContent, Grid, Typography } from '@mui/material';
import { useUI } from '@/contexts/UIContext';
import { apiClient } from '@/services/apiClient';

export const HealthSummary: React.FC = () => {
  const { language } = useUI();
  const isAmharic = language === 'am';
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [summary, setSummary] = React.useState<{
    name: string;
    age: string;
    gender: string;
    healthId: string;
    bloodType: string;
    allergies: string;
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    weight: string;
    activeConsents: number;
    nextAppointment: string;
    lastVisit: string;
    pendingApprovals: number;
  }>({
    name: '-',
    age: '-',
    gender: '-',
    healthId: '-',
    bloodType: '-',
    allergies: '-',
    bloodPressure: '-',
    heartRate: '-',
    temperature: '-',
    weight: '-',
    activeConsents: 0,
    nextAppointment: '-',
    lastVisit: '-',
    pendingApprovals: 0,
  });

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [profileRes, recordsRes, consentsRes, pendingRes, appointmentsRes] = await Promise.all([
          apiClient.get('/patient/me'),
          apiClient.get('/patient/records'),
          apiClient.get('/patient/consents/active'),
          apiClient.get('/patient/consents/approvals/pending'),
          apiClient.get('/patient/appointments'),
        ]);

        const profile = profileRes.data || {};
        const records = Array.isArray(recordsRes.data) ? recordsRes.data : [];
        const activeConsents = Array.isArray(consentsRes.data) ? consentsRes.data : [];
        const pendingApprovals = Array.isArray(pendingRes.data) ? pendingRes.data : [];
        const appointments = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : [];

        const vitals = Array.isArray(profile.vitalSigns) && profile.vitalSigns.length > 0 ? profile.vitalSigns[0] : null;
        const encryptedData = profile.encryptedData && typeof profile.encryptedData === 'object' ? profile.encryptedData : {};
        const allergies = Array.isArray(encryptedData.allergies)
          ? encryptedData.allergies.join(', ')
          : encryptedData.allergies || '-';

        const now = Date.now();
        const nextAppointment = appointments
          .map((a: any) => ({ ...a, ts: a.appointment_date ? new Date(a.appointment_date).getTime() : 0 }))
          .filter((a: any) => a.ts > now)
          .sort((a: any, b: any) => a.ts - b.ts)[0];

        const lastRecord = records[0];

        setSummary({
          name: profile.fullName || '-',
          age: profile.age != null ? String(profile.age) : '-',
          gender: profile.gender || '-',
          healthId: profile.ethiopianHealthId || '-',
          bloodType: encryptedData.bloodType || encryptedData.blood_type || '-',
          allergies: String(allergies || '-'),
          bloodPressure: vitals?.bloodPressure || '-',
          heartRate: vitals?.heartRate ? `${vitals.heartRate} bpm` : '-',
          temperature: vitals?.temperature ? `${vitals.temperature} C` : '-',
          weight: vitals?.weight ? `${vitals.weight} kg` : '-',
          activeConsents: activeConsents.length,
          nextAppointment: nextAppointment?.appointment_date
            ? new Date(nextAppointment.appointment_date).toLocaleString()
            : '-',
          lastVisit: lastRecord?.record_date
            ? new Date(lastRecord.record_date).toLocaleDateString()
            : lastRecord?.created_at
              ? new Date(lastRecord.created_at).toLocaleDateString()
              : '-',
          pendingApprovals: pendingApprovals.length,
        });
      } catch (e: any) {
        setError(e?.response?.data?.error || 'Failed to load health summary');
      } finally {
        setLoading(false);
      }
    };

    void load();
    const refresh = () => void load();
    window.addEventListener('focus', refresh);
    window.addEventListener('patient-dashboard-updated', refresh as EventListener);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('patient-dashboard-updated', refresh as EventListener);
    };
  }, []);

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        {isAmharic ? 'የጤና ማጠቃለያ' : 'Health Summary'}
      </Typography>
      {loading ? <Alert severity="info" sx={{ mb: 2 }}>Loading summary...</Alert> : null}
      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
                {isAmharic ? 'የግል መረጃ' : 'Personal Information'}
              </Typography>
              <Typography variant="body2">{isAmharic ? `ስም፡ ${summary.name}` : `Name: ${summary.name}`}</Typography>
              <Typography variant="body2">{isAmharic ? `እድሜ፡ ${summary.age}` : `Age: ${summary.age}`}</Typography>
              <Typography variant="body2">{isAmharic ? `ጾታ፡ ${summary.gender}` : `Gender: ${summary.gender}`}</Typography>
              <Typography variant="body2">{isAmharic ? `የጤና መታወቂያ፡ ${summary.healthId}` : `Health ID: ${summary.healthId}`}</Typography>
              <Typography variant="body2">{isAmharic ? `የደም አይነት፡ ${summary.bloodType}` : `Blood Type: ${summary.bloodType}`}</Typography>
              <Typography variant="body2">{isAmharic ? `አለርጂዎች፡ ${summary.allergies}` : `Allergies: ${summary.allergies}`}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
                {isAmharic ? 'የቅርብ ጊዜ የሕይወት ምልክቶች' : 'Recent Vitals'}
              </Typography>
              <Typography variant="body2">{isAmharic ? `የደም ግፊት፡ ${summary.bloodPressure}` : `Blood Pressure: ${summary.bloodPressure}`}</Typography>
              <Typography variant="body2">{isAmharic ? `የልብ ምት፡ ${summary.heartRate}` : `Heart Rate: ${summary.heartRate}`}</Typography>
              <Typography variant="body2">{isAmharic ? `የሙቀት መጠን፡ ${summary.temperature}` : `Temperature: ${summary.temperature}`}</Typography>
              <Typography variant="body2">{isAmharic ? `ክብደት፡ ${summary.weight}` : `Weight: ${summary.weight}`}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
                {isAmharic ? 'ፈጣን ስታቲስቲክስ' : 'Quick Stats'}
              </Typography>
              <Typography variant="body2">{isAmharic ? `ንቁ ፈቃዶች፡ ${summary.activeConsents}` : `Active Consents: ${summary.activeConsents}`}</Typography>
              <Typography variant="body2">{isAmharic ? `የሚመጡ ቀጠሮዎች፡ ${summary.nextAppointment}` : `Upcoming Appointment: ${summary.nextAppointment}`}</Typography>
              <Typography variant="body2">{isAmharic ? `የመጨረሻ ጉብኝት፡ ${summary.lastVisit}` : `Last Visit: ${summary.lastVisit}`}</Typography>
              <Typography variant="body2">{isAmharic ? `በመጠባበቅ ላይ ያሉ ማጽደቆች፡ ${summary.pendingApprovals}` : `Pending Approvals: ${summary.pendingApprovals}`}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

