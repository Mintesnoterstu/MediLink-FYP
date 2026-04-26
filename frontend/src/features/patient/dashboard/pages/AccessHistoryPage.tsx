import React from 'react';
import { Box, Typography, Card, CardContent, Table, TableHead, TableRow, TableCell, TableBody, Alert } from '@mui/material';
import { useUI } from '@/contexts/UIContext';
import { consentService } from '@/features/patient/services/consentService';

export const AccessHistoryPage: React.FC = () => {
  const { language } = useUI();
  const isAmharic = language === 'am';
  const [loading, setLoading] = React.useState(false);
  const [rows, setRows] = React.useState<any[]>([]);
  const [error, setError] = React.useState<string>('');

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await consentService.getAccessAudit();
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load access history');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
    const onRefresh = () => load();
    window.addEventListener('focus', onRefresh);
    window.addEventListener('patient-dashboard-updated', onRefresh as EventListener);
    const interval = window.setInterval(onRefresh, 10000);
    return () => {
      window.removeEventListener('focus', onRefresh);
      window.removeEventListener('patient-dashboard-updated', onRefresh as EventListener);
      window.clearInterval(interval);
    };
  }, [load]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        {isAmharic ? 'የመዳረሻ ታሪክ' : 'ACCESS HISTORY'}
      </Typography>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            {isAmharic ? 'የመዳረሻ መዝገብ' : 'Access Log'}
          </Typography>
          {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{isAmharic ? 'ቀን እና ሰዓት' : 'Date & Time'}</TableCell>
                <TableCell>{isAmharic ? 'የተጠቀመው' : 'Actor'}</TableCell>
                <TableCell>{isAmharic ? 'እርምጃ' : 'Action'}</TableCell>
                <TableCell>{isAmharic ? 'ዝርዝር' : 'Details'}</TableCell>
                <TableCell>{isAmharic ? 'ድርጊት' : 'Action'}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5}>{isAmharic ? 'በመጫን ላይ...' : 'Loading...'}</TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>{isAmharic ? 'ምንም ታሪክ የለም' : 'No access history yet.'}</TableCell>
                </TableRow>
              ) : rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{(r.created_at || r.ts) ? new Date(r.created_at || r.ts).toLocaleString() : '-'}</TableCell>
                  <TableCell>{r.actor_name || r.actor_id || '-'}</TableCell>
                  <TableCell>{r.action || r.action_type || '-'}</TableCell>
                  <TableCell>{r.details ? JSON.stringify(r.details) : '-'}</TableCell>
                  <TableCell>{r.status || 'logged'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};

