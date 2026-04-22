import React from 'react';
import {
  Box,
  Typography,
  Alert,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  Stack,
  TableContainer,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { useUI } from '@/contexts/UIContext';
import { apiClient } from '@/services/apiClient';
import { consentService } from '@/features/patient/services/consentService';

export const MyRecordsPage: React.FC = () => {
  const { language } = useUI();
  const isAmharic = language === 'am';
  const [rows, setRows] = React.useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [disputeTarget, setDisputeTarget] = React.useState<string | null>(null);
  const [disputeReason, setDisputeReason] = React.useState('');

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [recordsRes, pending] = await Promise.all([
        apiClient.get('/patient/records'),
        consentService.getPendingApprovals(),
      ]);
      setRows(Array.isArray(recordsRes.data) ? recordsRes.data : []);
      setPendingApprovals(Array.isArray(pending) ? pending : []);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load records');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
    const onRefresh = () => load();
    window.addEventListener('focus', onRefresh);
    window.addEventListener('patient-dashboard-updated', onRefresh as EventListener);
    return () => {
      window.removeEventListener('focus', onRefresh);
      window.removeEventListener('patient-dashboard-updated', onRefresh as EventListener);
    };
  }, [load]);

  const broadcastRefresh = () => window.dispatchEvent(new Event('patient-dashboard-updated'));

  const onApprove = async (recordId: string) => {
    try {
      await consentService.approveRecord(recordId);
      await load();
      broadcastRefresh();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to approve record');
    }
  };

  const onDispute = async () => {
    if (!disputeTarget) return;
    try {
      await consentService.disputeRecord(disputeTarget, disputeReason.trim() || 'Data looks incorrect');
      setDisputeTarget(null);
      setDisputeReason('');
      await load();
      broadcastRefresh();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to dispute record');
    }
  };

  const prettyType = (type: string) => String(type || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const formatData = (data: Record<string, unknown> | null | undefined) => {
    if (!data || typeof data !== 'object') return '-';
    const pairs = Object.entries(data).filter(([, v]) => v !== '' && v !== null && v !== undefined);
    if (pairs.length === 0) return '-';
    return pairs
      .slice(0, 5)
      .map(([k, v]) => `${k}: ${String(v)}`)
      .join(' | ');
  };

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
          <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{isAmharic ? 'ቀን' : 'Date'}</TableCell>
                <TableCell>{isAmharic ? 'አይነት' : 'Type'}</TableCell>
                <TableCell>{isAmharic ? 'የፈጠረው' : 'Created By'}</TableCell>
                <TableCell>{isAmharic ? 'ሁኔታ' : 'Status'}</TableCell>
                <TableCell>{isAmharic ? 'ዝርዝር' : 'Data'}</TableCell>
                <TableCell>{isAmharic ? 'እርምጃ' : 'Action'}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6}>Loading...</TableCell></TableRow>
              ) : rows.length === 0 ? (
                <TableRow><TableCell colSpan={6}>No records yet.</TableCell></TableRow>
              ) : rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.record_date ? new Date(r.record_date).toLocaleDateString() : new Date(r.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{prettyType(r.record_type)}</TableCell>
                  <TableCell>{r.created_by_name}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={r.status === 'approved' ? 'success' : r.status === 'disputed' ? 'error' : 'warning'}
                      label={String(r.status || '').toUpperCase()}
                    />
                  </TableCell>
                  <TableCell>{formatData(r.data)}</TableCell>
                  <TableCell>
                    {r.status === 'pending' ? (
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="contained" color="success" onClick={() => onApprove(r.id)}>
                          {isAmharic ? 'አጽድቅ' : 'APPROVE'}
                        </Button>
                        <Button size="small" variant="outlined" color="error" onClick={() => setDisputeTarget(r.id)}>
                          {isAmharic ? 'ክርክር' : 'DISPUTE'}
                        </Button>
                      </Stack>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {pendingApprovals.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {isAmharic
            ? `የማጽደቅ ጥያቄዎች አሉ: ${pendingApprovals.length}`
            : `Pending modification approvals: ${pendingApprovals.length}`}
        </Alert>
      )}

      <Alert severity="warning" sx={{ mt: 2 }}>
        {isAmharic
          ? '⚠️ የሕክምና መዝገቦችዎን እየተመለከቱ ነው። እነዚህ መዝገቦች በጤና ባለሙያዎች የተጨመሩ ናቸው እና በታካሚዎች በቀጥታ ሊስተካከሉ አይችሉም። ማንኛውም መረጃ የተሳሳተ ነው ብለው ካመኑ፣ እባክዎ “እርማት ይጠይቁ” የሚለውን አዝራር ይጠቀሙ።'
          : '⚠️ You are viewing your medical records. These records are added by healthcare professionals and cannot be edited directly by patients. If you believe any information is incorrect, please use the \"Request Correction\" button.'}
      </Alert>

      <Dialog open={Boolean(disputeTarget)} onClose={() => setDisputeTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{isAmharic ? 'የክርክር ምክንያት' : 'Dispute Reason'}</DialogTitle>
        <DialogContent>
          <TextField
            multiline
            minRows={3}
            fullWidth
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
            placeholder={isAmharic ? 'ምክንያት ያስገቡ...' : 'Enter reason...'}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDisputeTarget(null)}>{isAmharic ? 'ሰርዝ' : 'Cancel'}</Button>
          <Button color="error" variant="contained" onClick={onDispute}>
            {isAmharic ? 'አስገባ' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

