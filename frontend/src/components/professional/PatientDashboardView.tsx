import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Alert } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { professionalDataService } from '@/features/professional/services/professionalDataService';
import { PatientDataForm } from './PatientDataForm';

export const PatientDashboardView: React.FC = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<any>(null);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const load = React.useCallback(async () => {
    if (!patientId) return;
    try {
      setLoading(true);
      const d = await professionalDataService.getPatientDashboard(patientId);
      setData(d);
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.response?.data?.error || 'Unable to load patient dashboard.' });
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const handleSaved = async (text = 'Saved successfully. Consent is now revoked until patient approves.') => {
    setMessage({ type: 'success', text });
    navigate('/dashboard');
  };

  const records = Array.isArray(data?.records) ? data.records : [];
  const medicalHistory = records.filter((r: any) => r.record_type === 'diagnosis' || r.record_type === 'note');
  const medications = records.filter((r: any) => r.record_type === 'prescription');
  const labs = records.filter((r: any) => r.record_type === 'lab');

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        {data?.patient?.full_name || 'Patient'} | {data?.patient?.ethiopian_health_id || '-'}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Consent: ACTIVE | Scope: {data?.consent?.scope ? JSON.stringify(data.consent.scope) : '-'} | Expires:{' '}
        {data?.consent?.expires_at ? new Date(data.consent.expires_at).toLocaleString() : '-'}
      </Typography>

      {message ? <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert> : null}
      {loading ? <Alert severity="info">Loading patient dashboard...</Alert> : null}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                Patient Information (Read Only)
              </Typography>
              <Typography variant="body2">
                Name: {data?.patient?.full_name || '-'} | Gender: {data?.patient?.gender || '-'}
              </Typography>
              <Typography variant="body2">
                Date of Birth: {data?.patient?.date_of_birth ? new Date(data.patient.date_of_birth).toLocaleDateString() : '-'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                Medical History
              </Typography>
              {medicalHistory.slice(0, 8).map((r: any) => (
                <Typography key={r.id} variant="body2" sx={{ mb: 0.5 }}>
                  • {r.record_date ? new Date(r.record_date).toLocaleDateString() : new Date(r.created_at).toLocaleDateString()} - {r.record_type}
                </Typography>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                Current Medications
              </Typography>
              {medications.slice(0, 8).map((r: any) => (
                <Typography key={r.id} variant="body2" sx={{ mb: 0.5 }}>
                  • {r.data?.medication || 'Medication'} - {r.data?.dosage || '-'}
                </Typography>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                Lab Results
              </Typography>
              {labs.slice(0, 8).map((r: any) => (
                <Typography key={r.id} variant="body2" sx={{ mb: 0.5 }}>
                  • {r.data?.test_name || 'Lab'} - {r.data?.result || 'Pending'}
                </Typography>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Complete Patient Data Entry (All fields optional)
              </Typography>
              {patientId ? <PatientDataForm patientId={patientId} onSaved={handleSaved} /> : null}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Alert severity="warning">
            Any change will revoke your consent until patient approves.
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
};

