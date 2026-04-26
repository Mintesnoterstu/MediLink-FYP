import React from 'react';
import { Alert, Box, Card, CardContent, Typography, Stack, Button } from '@mui/material';
import { useUI } from '@/contexts/UIContext';
import { useNavigate } from 'react-router-dom';
import { consentService } from '@/features/patient/services/consentService';

export const MyDoctors: React.FC = () => {
  const { language } = useUI();
  const isAmharic = language === 'am';
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [rows, setRows] = React.useState<any[]>([]);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await consentService.getActiveConsents();
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load doctors with active consent.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
    const refresh = () => void load();
    window.addEventListener('focus', refresh);
    window.addEventListener('patient-dashboard-updated', refresh as EventListener);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('patient-dashboard-updated', refresh as EventListener);
    };
  }, [load]);

  const revoke = async (consentId: string) => {
    try {
      await consentService.revokeConsent({ consentId });
      await load();
      window.dispatchEvent(new Event('patient-dashboard-updated'));
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to revoke consent.');
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        {isAmharic ? 'የእኔ ሐኪሞች' : 'My Doctors'}
      </Typography>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            {isAmharic ? 'ንቁ ፈቃድ ያላቸው ሐኪሞች' : 'Doctors with Active Consent'}
          </Typography>
          {loading ? <Alert severity="info" sx={{ mb: 1 }}>Loading doctors...</Alert> : null}
          {error ? <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert> : null}
          {!loading && rows.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {isAmharic ? 'ንቁ ፈቃድ ያለው ሐኪም የለም።' : 'No doctors with active consent.'}
            </Typography>
          ) : null}
          {rows.map((row) => (
            <Box key={row.id} sx={{ mb: 2 }}>
              <Typography variant="body2">{row.doctor_name || row.doctor_id || '-'}</Typography>
              <Typography variant="body2" color="text.secondary">
                {isAmharic ? 'ተቋም፡ ' : 'Facility: '}
                {row.facility_name || '-'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isAmharic ? 'የፈቃድ ወሰን፡ ' : 'Consent Scope: '}
                {typeof row.scope === 'object' ? JSON.stringify(row.scope) : String(row.scope || '-')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {isAmharic ? 'የሚያበቃበት፡ ' : 'Expires: '}
                {row.expires_at ? new Date(row.expires_at).toLocaleString() : '-'}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" onClick={() => navigate('/dashboard/access-history')}>
                  {isAmharic ? 'የመዳረሻ መዝገብ ተመልከት' : 'View Access Log'}
                </Button>
                <Button size="small" variant="outlined" color="error" onClick={() => revoke(row.id)}>
                  {isAmharic ? 'ሻርቅ' : 'Revoke'}
                </Button>
              </Stack>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};

