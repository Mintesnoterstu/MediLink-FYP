import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Alert, Stack, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { professionalDataService } from '@/features/professional/services/professionalDataService';
import { PatientDataForm } from './PatientDataForm';

export const PatientDashboardView: React.FC = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<any>(null);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [selectedRecord, setSelectedRecord] = React.useState<any | null>(null);

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
  const humanizeLabel = (key: string) =>
    key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();

  const renderSection = (title: string, section: any) => {
    if (!section || typeof section !== 'object') return null;
    const entries = Object.entries(section).filter(([, v]) => String(v ?? '').trim() !== '');
    if (entries.length === 0) return null;
    return (
      <Box>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
          {title}
        </Typography>
        {entries.map(([k, v]) => (
          <Typography key={k} variant="body2" sx={{ mb: 0.25 }}>
            <strong>{humanizeLabel(k)}:</strong> {String(v)}
          </Typography>
        ))}
      </Box>
    );
  };

  const renderStructuredBlock = (recordData: any) => {
    if (!recordData || typeof recordData !== 'object') {
      return <Typography variant="body2" color="text.secondary">No clinical details available.</Typography>;
    }

    const soapKeys = ['subjective', 'objective', 'assessment', 'plan'];
    const otherEntries = Object.entries(recordData).filter(([k]) => !soapKeys.includes(k) && k !== 'attachments');

    return (
      <Stack spacing={1.25}>
        {renderSection('Subjective', recordData.subjective)}
        {renderSection('Objective', recordData.objective)}
        {renderSection('Assessment', recordData.assessment)}
        {renderSection('Plan', recordData.plan)}
        {otherEntries.length > 0 ? (
          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
              Additional Details
            </Typography>
            {otherEntries.map(([k, v]) => (
              <Typography key={k} variant="body2" sx={{ mb: 0.25 }}>
                <strong>{humanizeLabel(k)}:</strong> {typeof v === 'object' ? JSON.stringify(v) : String(v)}
              </Typography>
            ))}
          </Box>
        ) : null}
      </Stack>
    );
  };

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

        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                Existing Records (Read Only)
              </Typography>
              <Grid container spacing={1.5}>
                {records.slice(0, 12).map((r: any) => (
                  <Grid item xs={12} md={6} key={r.id}>
                    <Card variant="outlined">
                      <CardContent sx={{ py: 1.25 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                          <Typography variant="subtitle2" fontWeight={700}>{String(r.record_type || '').replace(/_/g, ' ')}</Typography>
                          <Chip size="small" label={String(r.status || '').toUpperCase()} />
                        </Stack>
                        <Typography variant="body2">Date: {r.record_date ? new Date(r.record_date).toLocaleDateString() : new Date(r.created_at).toLocaleDateString()}</Typography>
                        <Typography variant="body2">Doctor: {r.created_by_name || '-'}</Typography>
                        <Typography variant="body2">Facility: {r.facility_name || '-'}</Typography>
                        <Button size="small" variant="outlined" sx={{ mt: 1 }} onClick={() => setSelectedRecord(r)}>
                          View Detail
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                {records.length === 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">No records yet.</Typography>
                  </Grid>
                )}
              </Grid>
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

      <Dialog open={Boolean(selectedRecord)} onClose={() => setSelectedRecord(null)} maxWidth="md" fullWidth>
        <DialogTitle>Record Detail</DialogTitle>
        <DialogContent>
          {selectedRecord ? (
            <Stack spacing={1} sx={{ mt: 1 }}>
              <Typography variant="body2"><strong>Type:</strong> {String(selectedRecord.record_type || '').replace(/_/g, ' ')}</Typography>
              <Typography variant="body2"><strong>Date:</strong> {selectedRecord.record_date ? new Date(selectedRecord.record_date).toLocaleDateString() : new Date(selectedRecord.created_at).toLocaleDateString()}</Typography>
              <Typography variant="body2"><strong>Doctor:</strong> {selectedRecord.created_by_name || '-'}</Typography>
              <Typography variant="body2"><strong>Facility:</strong> {selectedRecord.facility_name || '-'}</Typography>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ py: 1.5 }}>
                  {renderStructuredBlock(selectedRecord.data)}
                </CardContent>
              </Card>
              {Array.isArray(selectedRecord?.data?.attachments) && selectedRecord.data.attachments.length > 0 && (
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2">Attachments</Typography>
                  {selectedRecord.data.attachments.map((a: any, idx: number) => (
                    <a key={`${a?.name || 'file'}-${idx}`} href={a?.dataUrl} download={a?.name || `attachment-${idx + 1}`}>
                      {a?.name || `Attachment ${idx + 1}`}
                    </a>
                  ))}
                </Stack>
              )}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedRecord(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

