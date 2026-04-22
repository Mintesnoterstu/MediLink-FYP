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
  Button,
  Stack,
  TextField,
  Divider,
  MenuItem,
  Snackbar,
} from '@mui/material';
import { useUI } from '@/contexts/UIContext';
import { consentService, PendingConsentRequest } from '@/features/patient/services/consentService';

export const ConsentManagementPage: React.FC = () => {
  const { language } = useUI();
  const isAmharic = language === 'am';
  const [loading, setLoading] = React.useState(false);
  const [pendingRequests, setPendingRequests] = React.useState<PendingConsentRequest[]>([]);
  const [activeConsents, setActiveConsents] = React.useState<any[]>([]);
  const [scope, setScope] = React.useState<'full_history' | 'allergies' | 'medications' | 'lab_results'>('full_history');
  const [durationDays, setDurationDays] = React.useState(30);
  const [toast, setToast] = React.useState<{ open: boolean; severity: 'success' | 'error' | 'info'; message: string }>({
    open: false,
    severity: 'info',
    message: '',
  });

  const notify = (severity: 'success' | 'error' | 'info', message: string) =>
    setToast({ open: true, severity, message });

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [pending, active] = await Promise.all([
        consentService.getPendingRequests(),
        consentService.getActiveConsents(),
      ]);
      setPendingRequests(Array.isArray(pending) ? pending : []);
      setActiveConsents(Array.isArray(active) ? active : []);
    } catch (e: any) {
      notify('error', e?.response?.data?.error || e?.message || 'Failed to load consent data');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const grantRequest = async (requestId: string) => {
    try {
      const scopePayload = {
        full_history: scope === 'full_history',
        allergies: scope === 'allergies',
        medications: scope === 'medications',
        lab_results: scope === 'lab_results',
      };
      await consentService.grantConsentForPatient({
        requestId,
        scope: scopePayload,
        durationDays,
      });
      notify('success', 'Consent granted successfully.');
      await load();
    } catch (e: any) {
      notify('error', e?.response?.data?.error || e?.message || 'Failed to grant consent');
    }
  };

  const denyRequest = async (requestId: string) => {
    try {
      await consentService.denyConsentRequest(requestId);
      notify('info', 'Consent request denied.');
      await load();
    } catch (e: any) {
      notify('error', e?.response?.data?.error || e?.message || 'Failed to deny request');
    }
  };

  const revokeConsent = async (consentId: string) => {
    try {
      await consentService.revokeConsent({ consentId });
      notify('info', 'Consent revoked.');
      await load();
    } catch (e: any) {
      notify('error', e?.response?.data?.error || e?.message || 'Failed to revoke consent');
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        {isAmharic ? 'ፈቃድ አስተዳደር' : 'CONSENT MANAGEMENT'}
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        {isAmharic
          ? '🔐 ይህ በጣም አስፈላጊው ክፍል ነው - መረጃዎን ማን እንደሚያይ እርስዎ ይቆጣጠራሉ'
          : '🔐 THIS IS THE MOST IMPORTANT SECTION - YOU CONTROL WHO SEES YOUR DATA'}
      </Alert>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            {isAmharic ? 'ንቁ ፈቃዶች' : 'Active Consents'}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{isAmharic ? 'ሐኪም' : 'Doctor'}</TableCell>
                <TableCell>{isAmharic ? 'ተቋም' : 'Facility'}</TableCell>
                <TableCell>{isAmharic ? 'የተሰጠበት ቀን' : 'Granted'}</TableCell>
                <TableCell>{isAmharic ? 'የሚያበቃበት ቀን' : 'Expires'}</TableCell>
                <TableCell>{isAmharic ? 'ወሰን' : 'Scope'}</TableCell>
                <TableCell>{isAmharic ? 'ሁኔታ' : 'Status'}</TableCell>
                <TableCell>{isAmharic ? 'እርምጃዎች' : 'Actions'}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeConsents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography variant="body2" color="text.secondary">
                      {loading ? 'Loading...' : isAmharic ? 'ምንም ንቁ ፈቃድ የለም' : 'No active consents'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {activeConsents.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.doctor_name || c.doctor_id}</TableCell>
                  <TableCell>{c.facility_name || '-'}</TableCell>
                  <TableCell>{c.granted_at ? new Date(c.granted_at).toLocaleString() : '-'}</TableCell>
                  <TableCell>{c.expires_at ? new Date(c.expires_at).toLocaleString() : '-'}</TableCell>
                  <TableCell>{typeof c.scope === 'string' ? c.scope : JSON.stringify(c.scope || {})}</TableCell>
                  <TableCell>{c.status}</TableCell>
                  <TableCell>
                    <Button size="small" color="error" variant="outlined" onClick={() => revokeConsent(c.id)}>
                      {isAmharic ? 'ሻርቅ' : 'REVOKE'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            {isAmharic
              ? 'በመጠባበቅ ላይ ያሉ የፈቃድ ጥያቄዎች'
              : 'Pending Consent Requests'}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{isAmharic ? 'ሐኪም' : 'Doctor'}</TableCell>
                <TableCell>{isAmharic ? 'ተቋም' : 'Facility'}</TableCell>
                <TableCell>{isAmharic ? 'የተጠየቀበት ቀን' : 'Request Date'}</TableCell>
                <TableCell>{isAmharic ? 'ምክንያት' : 'Reason'}</TableCell>
                <TableCell>{isAmharic ? 'እርምጃዎች' : 'Actions'}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography variant="body2" color="text.secondary">
                      {loading ? 'Loading...' : isAmharic ? 'ምንም በመጠባበቅ ላይ ጥያቄ የለም' : 'No pending consent requests'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {pendingRequests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.doctor_name || r.doctor_id}</TableCell>
                  <TableCell>{r.facility_name || '-'}</TableCell>
                  <TableCell>{r.requested_at ? new Date(r.requested_at).toLocaleString() : '-'}</TableCell>
                  <TableCell>{r.reason || '-'}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="contained" color="success" onClick={() => grantRequest(r.id)}>
                        {isAmharic ? 'ፍቀድ' : 'APPROVE'}
                      </Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => denyRequest(r.id)}>
                        {isAmharic ? 'ከልክል' : 'DENY'}
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            {isAmharic ? 'አዲስ ፈቃድ መስጠት' : 'Grant New Consent'}
          </Typography>

          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>
                {isAmharic ? 'ሐኪም ይፈልጉ' : 'Search for Doctor'}
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  placeholder={
                    isAmharic
                      ? 'የሐኪም ስም / ተቋም / ፈቃድ ቁጥር'
                      : 'Doctor name / facility / license number'
                  }
                />
                <Button variant="contained">
                  {isAmharic ? 'ፈልግ' : 'SEARCH'}
                </Button>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                {isAmharic
                  ? 'ለማጋራት የሚፈልጉትን መረጃ ይምረጡ'
                  : 'Select Data to Share'}
              </Typography>
              <TextField
                select
                fullWidth
                value={scope}
                onChange={(e) => setScope(e.target.value as any)}
                size="small"
              >
                <MenuItem value="full_history">{isAmharic ? 'ሙሉ ታሪክ' : 'Full History'}</MenuItem>
                <MenuItem value="allergies">{isAmharic ? 'አለርጂዎች ብቻ' : 'Allergies Only'}</MenuItem>
                <MenuItem value="medications">{isAmharic ? 'መድሀኒቶች ብቻ' : 'Medications Only'}</MenuItem>
                <MenuItem value="lab_results">{isAmharic ? 'የላብ ውጤቶች ብቻ' : 'Lab Results Only'}</MenuItem>
              </TextField>
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={700}>
                Select Duration / የጊዜ ገደብ ይምረጡ
              </Typography>
              <TextField
                select
                fullWidth
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                size="small"
              >
                <MenuItem value={1}>Single Visit (24 hours)</MenuItem>
                <MenuItem value={30}>30 Days</MenuItem>
                <MenuItem value={90}>90 Days</MenuItem>
                <MenuItem value={365}>Ongoing (until revoked)</MenuItem>
              </TextField>
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={700}>
                Reason for Access / የመዳረሻ ምክንያት
              </Typography>
              <TextField fullWidth placeholder="(Doctor-provided reason will appear here)" />
            </Box>

            <Alert severity="info">
              {isAmharic
                ? 'ከላይ ባሉ ጥያቄዎች ላይ APPROVE በመጫን ፈቃድ ይሰጣሉ።'
                : 'Use APPROVE on each pending request above to grant consent.'}
            </Alert>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((s) => ({ ...s, open: false }))}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

