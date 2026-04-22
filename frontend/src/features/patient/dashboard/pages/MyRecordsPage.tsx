import React from 'react';
import { Box, Typography, Alert, Card, CardContent, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { useUI } from '@/contexts/UIContext';
import { apiClient } from '@/services/apiClient';

export const MyRecordsPage: React.FC = () => {
  const { language } = useUI();
  const isAmharic = language === 'am';
  const [rows, setRows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const r = await apiClient.get('/patient/records');
        if (mounted) setRows(Array.isArray(r.data) ? r.data : []);
      } catch (e: any) {
        if (mounted) setError(e?.response?.data?.error || 'Failed to load records');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        {isAmharic ? 'የሕክምና መዝገቦቼ' : 'MY HEALTH RECORDS'}
      </Typography>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            {isAmharic ? 'የሕክምና መዝገቦች' : 'Medical Records'}
          </Typography>
          {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{isAmharic ? 'ቀን' : 'Date'}</TableCell>
                <TableCell>{isAmharic ? 'አይነት' : 'Type'}</TableCell>
                <TableCell>{isAmharic ? 'የፈጠረው' : 'Created By'}</TableCell>
                <TableCell>{isAmharic ? 'ሁኔታ' : 'Status'}</TableCell>
                <TableCell>{isAmharic ? 'ዝርዝር' : 'Data'}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow>
              ) : rows.length === 0 ? (
                <TableRow><TableCell colSpan={5}>No records yet.</TableCell></TableRow>
              ) : rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.record_date ? new Date(r.record_date).toLocaleDateString() : new Date(r.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{r.record_type}</TableCell>
                  <TableCell>{r.created_by_name}</TableCell>
                  <TableCell>{r.status}</TableCell>
                  <TableCell>{r.data ? JSON.stringify(r.data) : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Alert severity="warning" sx={{ mt: 2 }}>
        {isAmharic
          ? '⚠️ የሕክምና መዝገቦችዎን እየተመለከቱ ነው። እነዚህ መዝገቦች በጤና ባለሙያዎች የተጨመሩ ናቸው እና በታካሚዎች በቀጥታ ሊስተካከሉ አይችሉም። ማንኛውም መረጃ የተሳሳተ ነው ብለው ካመኑ፣ እባክዎ “እርማት ይጠይቁ” የሚለውን አዝራር ይጠቀሙ።'
          : '⚠️ You are viewing your medical records. These records are added by healthcare professionals and cannot be edited directly by patients. If you believe any information is incorrect, please use the \"Request Correction\" button.'}
      </Alert>
    </Box>
  );
};

