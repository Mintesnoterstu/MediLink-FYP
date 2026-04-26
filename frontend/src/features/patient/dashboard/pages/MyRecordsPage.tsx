import React from 'react';
import {
  Box,
  Typography,
  Alert,
  Card,
  CardContent,
  Chip,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
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
  const [selected, setSelected] = React.useState<any | null>(null);

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
    const interval = window.setInterval(onRefresh, 10000);
    return () => {
      window.removeEventListener('focus', onRefresh);
      window.removeEventListener('patient-dashboard-updated', onRefresh as EventListener);
      window.clearInterval(interval);
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

  const humanizeLabel = (key: string) =>
    key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();

  const renderSoapSection = (title: string, section: any) => {
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
          <Grid container spacing={1.5}>
            {loading && (
              <Grid item xs={12}><Typography variant="body2">Loading...</Typography></Grid>
            )}
            {!loading && rows.length === 0 && (
              <Grid item xs={12}><Typography variant="body2">No records yet.</Typography></Grid>
            )}
            {!loading && rows.map((r) => (
              <Grid item xs={12} md={6} key={r.id}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={700}>{prettyType(r.record_type)}</Typography>
                      <Chip
                        size="small"
                        color={r.status === 'approved' ? 'success' : r.status === 'disputed' ? 'error' : 'warning'}
                        label={String(r.status || '').toUpperCase()}
                      />
                    </Stack>
                    <Typography variant="body2">Date: {r.record_date ? new Date(r.record_date).toLocaleDateString() : new Date(r.created_at).toLocaleDateString()}</Typography>
                    <Typography variant="body2">Doctor: {r.created_by_name || '-'}</Typography>
                    <Typography variant="body2">Facility: {r.facility_name || '-'}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{formatData(r.data)}</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                      <Button size="small" variant="outlined" onClick={() => setSelected(r)}>View Details</Button>
                      {r.status === 'pending' ? (
                        <>
                          <Button size="small" variant="contained" color="success" onClick={() => onApprove(r.id)}>
                            {isAmharic ? 'አጽድቅ' : 'APPROVE'}
                          </Button>
                          <Button size="small" variant="outlined" color="error" onClick={() => setDisputeTarget(r.id)}>
                            {isAmharic ? 'ክርክር' : 'DISPUTE'}
                          </Button>
                        </>
                      ) : null}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
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
      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
        <DialogTitle>Record Details</DialogTitle>
        <DialogContent>
          {selected ? (
            <Stack spacing={1} sx={{ mt: 1 }}>
              <Typography variant="body2"><strong>Type:</strong> {prettyType(selected.record_type)}</Typography>
              <Typography variant="body2"><strong>Date:</strong> {selected.record_date ? new Date(selected.record_date).toLocaleDateString() : new Date(selected.created_at).toLocaleDateString()}</Typography>
              <Typography variant="body2"><strong>Doctor:</strong> {selected.created_by_name || '-'}</Typography>
              <Typography variant="body2"><strong>Facility:</strong> {selected.facility_name || '-'}</Typography>
              <TextField
                multiline
                minRows={8}
                value={(() => {
                  const d = selected.data || {};
                  if (d && typeof d === 'object' && (d.subjective || d.objective || d.assessment || d.plan)) {
                    return 'Patient-friendly SOAP view is shown below.';
                  }
                  return JSON.stringify(d, null, 2);
                })()}
                InputProps={{ readOnly: true }}
              />
              {selected?.data && (selected.data.subjective || selected.data.objective || selected.data.assessment || selected.data.plan) && (
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {renderSoapSection('Subjective (What patient says)', selected.data.subjective)}
                  {renderSoapSection('Objective (Clinical findings)', selected.data.objective)}
                  {renderSoapSection('Assessment (Diagnosis)', selected.data.assessment)}
                  {renderSoapSection('Plan (Treatment and follow-up)', selected.data.plan)}
                </Stack>
              )}
              {Array.isArray(selected?.data?.attachments) && selected.data.attachments.length > 0 && (
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2">Attachments</Typography>
                  {selected.data.attachments.map((a: any, idx: number) => (
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
          <Button onClick={() => setSelected(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

