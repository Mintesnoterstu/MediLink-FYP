import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Home,
  Groups,
  Search,
  MailOutline,
  EventAvailable,
  BarChart,
  Settings,
  HelpOutline,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '@/features/auth/services/authService';
import { professionalDataService, ProfessionalPatientSearchResult } from '@/features/professional/services/professionalDataService';
import { Snackbar, Alert } from '@mui/material';

export const ProfessionalDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { language } = useUI();
  const location = useLocation();
  const navigate = useNavigate();

  const isAmharic = language === 'am';
  const t = (en: string, am: string) => (isAmharic ? am : en);
  const [tab, setTab] = React.useState(0);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [confirmLogout, setConfirmLogout] = React.useState(false);
  const [isSavingSettings, setIsSavingSettings] = React.useState(false);
  const [healthId, setHealthId] = React.useState('');
  const [patientLookup, setPatientLookup] = React.useState<ProfessionalPatientSearchResult | null>(null);
  const [isLookingUp, setIsLookingUp] = React.useState(false);
  const [myPatients, setMyPatients] = React.useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = React.useState<any[]>([]);
  const [patientViewOpen, setPatientViewOpen] = React.useState(false);
  const [selectedPatient, setSelectedPatient] = React.useState<any | null>(null);
  const [patientViewData, setPatientViewData] = React.useState<any | null>(null);
  const [isLoadingPatientView] = React.useState(false);
  const [recordType, setRecordType] = React.useState('diagnosis');
  const [recordPayload, setRecordPayload] = React.useState('');
  const [recordDate, setRecordDate] = React.useState('');
  const [updateRecordId, setUpdateRecordId] = React.useState('');
  const [toast, setToast] = React.useState<{ open: boolean; severity: 'success' | 'error' | 'info'; message: string }>(
    { open: false, severity: 'info', message: '' },
  );

  const name = user?.name || (isAmharic ? 'ዶ/ር ታደሰ በቀለ' : 'Dr. Tadesse Bekele');

  // If header menu takes you to /dashboard/profile, open Settings tab.
  React.useEffect(() => {
    if (location.pathname.includes('/dashboard/profile') || location.pathname.includes('/dashboard/settings')) {
      setTab(5);
    }
  }, [location.pathname]);

  React.useEffect(() => {
    const openFromHeader = () => setDrawerOpen(true);
    window.addEventListener('open-role-dashboard-menu', openFromHeader);
    return () => window.removeEventListener('open-role-dashboard-menu', openFromHeader);
  }, []);

  const professionalMenu = [
    { id: 'dashboard', en: 'Dashboard', am: 'ዳሽቦርድ', icon: <Home />, onClick: () => setTab(0) },
    { id: 'patients', en: 'My Patients', am: 'የእኔ ታካሚዎች', icon: <Groups />, onClick: () => setTab(0) },
    { id: 'search', en: 'Search Patient', am: 'ታካሚ ፈልግ', icon: <Search />, onClick: () => setTab(1) },
    { id: 'consents', en: 'Consent Requests', am: 'የፈቃድ ጥያቄዎች', icon: <MailOutline />, onClick: () => setTab(2) },
    { id: 'schedule', en: 'My Schedule', am: 'የእኔ መርሐግብር', icon: <EventAvailable />, onClick: () => setTab(3) },
    { id: 'stats', en: 'Statistics', am: 'ስታቲስቲክስ', icon: <BarChart />, onClick: () => setTab(4) },
    { id: 'settings', en: 'Settings', am: 'ቅንብሮች', icon: <Settings />, onClick: () => setTab(5) },
    { id: 'help', en: 'Help', am: 'እርዳታ', icon: <HelpOutline />, onClick: () => navigate('/help') },
    { id: 'logout', en: 'Logout', am: 'ውጣ', icon: <LogoutIcon />, onClick: () => setConfirmLogout(true) },
  ];

  const handleMenuClick = (fn: () => void) => {
    setDrawerOpen(false);
    fn();
  };

  const handleSaveSettings = async () => {
    if (!user?.id) return;
    try {
      setIsSavingSettings(true);
      await authService.updateUser(user.id, { name });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const runSearch = async () => {
    const q = String(healthId || '').trim().toUpperCase();
    if (!q) return;
    try {
      setIsLookingUp(true);
      const results = await professionalDataService.searchPatients(q);
      setPatientLookup((results && results[0]) || null);
      if (!results || results.length === 0) {
        setToast({ open: true, severity: 'info', message: 'No patient found for this Ethiopian Health ID.' });
      }
    } catch (e: any) {
      const msg = e?.response?.data?.error || (e instanceof Error ? e.message : 'Search failed');
      setToast({ open: true, severity: 'error', message: msg });
    } finally {
      setIsLookingUp(false);
    }
  };

  const requestConsent = async () => {
    try {
      const q = String(healthId || patientLookup?.ethiopian_health_id || '').trim().toUpperCase();
      if (!q) return;
      await professionalDataService.requestConsentByHealthId(q, 'Follow-up treatment');
      setToast({ open: true, severity: 'success', message: 'Request sent. Waiting for patient approval.' });
      const [p, mine] = await Promise.all([
        professionalDataService.getPendingConsentRequests(),
        professionalDataService.getMyPatients(),
      ]);
      setPendingRequests(Array.isArray(p) ? p : []);
      setMyPatients(Array.isArray(mine) ? mine : []);
    } catch (e: any) {
      const details = Array.isArray(e?.response?.data?.details) ? e.response.data.details.join(' | ') : '';
      const msg = details || e?.response?.data?.error || (e instanceof Error ? e.message : 'Request failed');
      setToast({ open: true, severity: 'error', message: msg });
    }
  };

  const cancelRequest = async (requestId: string) => {
    try {
      await professionalDataService.cancelPendingConsentRequest(requestId);
      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
      setToast({ open: true, severity: 'success', message: 'Consent request cancelled.' });
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to cancel request';
      setToast({ open: true, severity: 'error', message: msg });
    }
  };

  const openPatientView = async (patient: any) => {
    if (!patient?.id) return;
    navigate(`/professional/patient/${patient.id}/dashboard`);
  };

  const quickViewById = (id: string) => {
    if (!id) return;
    navigate(`/professional/patient/${id}/dashboard`);
  };

  const createRecord = async () => {
    try {
      if (!selectedPatient?.id) return;
      const payload = recordPayload.trim() ? JSON.parse(recordPayload) : {};
      await professionalDataService.createHealthRecord({
        patientId: selectedPatient.id,
        recordType,
        recordDate: recordDate || undefined,
        encryptedData: payload,
      });
      setToast({
        open: true,
        severity: 'success',
        message: 'Record saved. Consent auto-revoked until patient approves.',
      });
      setRecordPayload('');
      setRecordDate('');
      setPatientViewOpen(false);
      setPatientViewData(null);
      setSelectedPatient(null);
      const mine = await professionalDataService.getMyPatients();
      setMyPatients(Array.isArray(mine) ? mine : []);
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to save record';
      setToast({ open: true, severity: 'error', message: msg });
    }
  };

  const updateRecord = async () => {
    try {
      if (!updateRecordId.trim()) {
        setToast({ open: true, severity: 'error', message: 'Record ID is required for update.' });
        return;
      }
      const payload = recordPayload.trim() ? JSON.parse(recordPayload) : {};
      await professionalDataService.updateHealthRecord(updateRecordId.trim(), payload);
      setToast({
        open: true,
        severity: 'success',
        message: 'Record updated. Consent auto-revoked until patient approves.',
      });
      setRecordPayload('');
      setUpdateRecordId('');
      setPatientViewOpen(false);
      setPatientViewData(null);
      setSelectedPatient(null);
      const mine = await professionalDataService.getMyPatients();
      setMyPatients(Array.isArray(mine) ? mine : []);
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to update record';
      setToast({ open: true, severity: 'error', message: msg });
    }
  };

  React.useEffect(() => {
    if (tab === 0) {
      professionalDataService
        .getMyPatients()
        .then((r) => setMyPatients(Array.isArray(r) ? r : []))
        .catch(() => setMyPatients([]));

      const interval = window.setInterval(() => {
        professionalDataService
          .getMyPatients()
          .then((r) => setMyPatients(Array.isArray(r) ? r : []))
          .catch(() => null);
      }, 10000);
      return () => window.clearInterval(interval);
    }
    if (tab === 2) {
      professionalDataService
        .getPendingConsentRequests()
        .then((p) => setPendingRequests(Array.isArray(p) ? p : []))
        .catch(() => setPendingRequests([]));
    }
    return undefined;
  }, [tab]);

  React.useEffect(() => {
    const q = new URLSearchParams(location.search);
    const patientId = q.get('patientId');
    if (!patientId) return;
    quickViewById(patientId);
  }, [location.search]);

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden', boxSizing: 'border-box' }}>
      {/* Header */}
      <Typography variant="h6" fontWeight={800} sx={{ mb: 1, fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' }, lineHeight: 1.3 }}>
        {isAmharic ? 'የጤና ባለሙያ ዳሽቦርድ' : 'HEALTH PROFESSIONAL DASHBOARD'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {isAmharic ? '👤 ' : '👤 '}
        <strong>{name}</strong>
        <br />
        {isAmharic ? 'ሚና፡ ሐኪም' : 'Role: Doctor'}
        <br />
        {isAmharic
          ? 'ተቋም፡ ጅማ ሆስፒታል | ዲፓርትመንት፡ ውጪ ታካሚ'
          : 'Facility: Jimma Hospital | Department: Outpatient'}
        <br />
        {isAmharic
          ? 'የመጨረሻ መግቢያ፡ ዛሬ 8፡30'
          : 'Last Login: Today 8:30 AM'}
      </Typography>

      {/* Notice */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'warning.light',
          bgcolor: 'warning.50',
        }}
      >
        <CardContent>
          <Typography variant="subtitle2" fontWeight={800} gutterBottom>
            {isAmharic ? '⚠️ አስፈላጊ ማሳሰቢያ' : '⚠️ Important Notice'}
          </Typography>
          <Typography variant="body2">
            {isAmharic
              ? 'ፈቃድ የሰጡዎትን ታካሚዎች ብቻ ማየት ይችላሉ።'
              : 'You can ONLY view patients who have granted you consent.'}
          </Typography>
          <Typography variant="body2">
            {isAmharic
              ? 'ማንኛውም ዝማኔ ታካሚው እስኪያጸድቅ ድረስ ፈቃድዎን በራስ-ሰር ይሻራል።'
              : 'Any update you make will auto-revoke your consent until the patient approves.'}
          </Typography>
        </CardContent>
      </Card>

      {/* Tab 1: My Patients */}
      {tab === 0 && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>
              {isAmharic
                ? 'የዛሬ ታካሚዎች (ንቁ ፈቃድ ያላቸው)'
                : "TODAY'S PATIENTS (with active consent)"}
            </Typography>
          </Grid>
          {myPatients.length === 0 ? (
            <Grid item xs={12}>
              <Alert severity="info">No patients yet.</Alert>
            </Grid>
          ) : (
            myPatients.map((p) => (
              <Grid item xs={12} md={6} key={p.id}>
                <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                      <Button variant="text" size="small" onClick={() => openPatientView(p)} sx={{ p: 0, minWidth: 0 }}>
                        {p.full_name}
                      </Button>{' '}
                      ({p.ethiopian_health_id})
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Consent: ✅ ACTIVE
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Scope: {typeof p.scope === 'string' ? p.scope : JSON.stringify(p.scope || {})} | Expires:{' '}
                      {p.expires_at ? new Date(p.expires_at).toLocaleString() : '-'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Last Access: {p.last_access ? new Date(p.last_access).toLocaleString() : '-'}
                    </Typography>
                    <Button variant="contained" size="small" onClick={() => openPatientView(p)}>
                      {isAmharic ? 'ዳሽቦርድ ተመልከት' : 'VIEW DASHBOARD'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Tab 2: Ethiopian Health ID Access */}
      {tab === 1 && (
        <Box>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
            {isAmharic ? 'የታካሚ መታወቂያ ያስገቡ' : 'ENTER PATIENT ETHIOPIAN HEALTH ID'}
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label={t('Ethiopian Health ID', 'የኢትዮጵያ የጤና መታወቂያ')}
                placeholder={t('ETH-2026-0415-AB123', 'ETH-2026-0415-AB123')}
                value={healthId}
                onChange={(e) => setHealthId(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ height: '100%' }}>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ height: '100%' }}
                  disabled={isLookingUp}
                  onClick={runSearch}
                >
                  {t('LOOKUP', 'ፈልግ')}
                </Button>
                <Button fullWidth variant="contained" sx={{ height: '100%' }} onClick={() => requestConsent()}>
                  {t('REQUEST ACCESS', 'ፈቃድ ጠይቅ')}
                </Button>
              </Stack>
            </Grid>
          </Grid>

          {patientLookup && (
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  {patientLookup.full_name} | {patientLookup.ethiopian_health_id}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {isAmharic ? 'የፈቃድ ሁኔታ፡ ' : 'Consent Status: '}
                  {patientLookup.has_active_consent ? '✅ ACTIVE' : '❌ NO ACTIVE CONSENT'}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    size="small"
                    disabled={!patientLookup.has_active_consent}
                    onClick={() => openPatientView(patientLookup)}
                  >
                    {t('VIEW DATA', 'መረጃ ተመልከት')}
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    disabled={patientLookup.has_active_consent}
                    onClick={() => requestConsent()}
                  >
                    {t('REQUEST ACCESS', 'ፈቃድ ጠይቅ')}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {/* Tab 3: Consent Requests */}
      {tab === 2 && (
        <Box>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
            {isAmharic ? 'በመጠባበቅ ላይ ያሉ የፈቃድ ጥያቄዎች' : 'PENDING CONSENT REQUESTS'}
          </Typography>
          <Grid container spacing={2}>
            {pendingRequests.map((r) => (
              <Grid item xs={12} md={6} key={r.id}>
                <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                      {isAmharic ? 'ታካሚ ID፡ ' : 'Patient ID: '} {r.patient_id}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {isAmharic ? 'ሁኔታ፡ ' : 'Status: '} {r.status}
                    </Typography>
                    <Button variant="outlined" size="small" onClick={() => cancelRequest(r.id)}>
                      {t('CANCEL REQUEST', 'ጥያቄ ሰርዝ')}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} variant="filled" onClose={() => setToast((t) => ({ ...t, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>

      <Dialog open={patientViewOpen} onClose={() => setPatientViewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{isAmharic ? 'የታካሚ ዳሽቦርድ (የሐኪም እይታ)' : "Patient Dashboard (Doctor's View)"}</DialogTitle>
        <DialogContent>
          {isLoadingPatientView ? (
            <Typography variant="body2">{isAmharic ? 'በመጫን ላይ...' : 'Loading...'}</Typography>
          ) : (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {selectedPatient?.full_name || patientViewData?.patient?.full_name || '-'} ({selectedPatient?.ethiopian_health_id || patientViewData?.patient?.ethiopian_health_id || '-'})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Scope: {patientViewData?.consent?.scope ? JSON.stringify(patientViewData.consent.scope) : (selectedPatient?.scope ? JSON.stringify(selectedPatient.scope) : '-')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Consent: ACTIVE | Expires: {patientViewData?.consent?.expires_at ? new Date(patientViewData.consent.expires_at).toLocaleString() : '-'}
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                    {t('Patient Information', 'የታካሚ መረጃ')}
                  </Typography>
                  <Typography variant="body2">
                    Name: {patientViewData?.patient?.full_name || '-'} | Gender: {patientViewData?.patient?.gender || '-'}
                  </Typography>
                  <Typography variant="body2">
                    Date of Birth: {patientViewData?.patient?.date_of_birth ? new Date(patientViewData.patient.date_of_birth).toLocaleDateString() : '-'}
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                    {t('Medical History and Records', 'የህክምና ታሪክ እና መዝገቦች')}
                  </Typography>
                  {(patientViewData?.records || []).slice(0, 8).map((r: any) => (
                    <Typography key={r.id} variant="body2" sx={{ mb: 0.5 }}>
                      • {r.record_date ? new Date(r.record_date).toLocaleDateString() : new Date(r.created_at).toLocaleDateString()} - {r.record_type} ({r.status})
                    </Typography>
                  ))}
                  {(!patientViewData?.records || patientViewData.records.length === 0) && (
                    <Typography variant="body2" color="text.secondary">
                      No records yet.
                    </Typography>
                  )}
                </CardContent>
              </Card>

              <Typography variant="subtitle2" fontWeight={700}>
                {isAmharic ? 'አዲስ መዝገብ ጨምር (auto-revoke)' : 'Add New Record (auto-revoke)'}
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                <Button variant="outlined" onClick={() => setRecordType('diagnosis')}>{t('Add Diagnosis', 'ምርመራ ጨምር')}</Button>
                <Button variant="outlined" onClick={() => setRecordType('prescription')}>{t('Add Prescription', 'መድሀኒት ትእዛዝ ጨምር')}</Button>
                <Button variant="outlined" onClick={() => setRecordType('note')}>{t('Add Note', 'ማስታወሻ ጨምር')}</Button>
                <Button variant="outlined" onClick={() => setRecordType('lab')}>{t('Order Lab', 'ላብ ትዕዛዝ ስጥ')}</Button>
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                <FormControl fullWidth>
                  <InputLabel>{t('Record Type', 'የመዝገብ አይነት')}</InputLabel>
                  <Select label={t('Record Type', 'የመዝገብ አይነት')} value={recordType} onChange={(e) => setRecordType(String(e.target.value))}>
                    <MenuItem value="diagnosis">{t('Diagnosis', 'ምርመራ')}</MenuItem>
                    <MenuItem value="prescription">{t('Prescription', 'የመድሀኒት ትዕዛዝ')}</MenuItem>
                    <MenuItem value="lab">{t('Lab', 'ላብ')}</MenuItem>
                    <MenuItem value="note">{t('Note', 'ማስታወሻ')}</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label={t('Record Date (optional)', 'የመዝገብ ቀን (አማራጭ)')}
                  type="date"
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
              <TextField
                fullWidth
                multiline
                minRows={4}
                label={t('Record JSON (e.g. {"summary":"Follow-up","details":"..."} )', 'የመዝገብ JSON (ለምሳሌ {"summary":"Follow-up","details":"..."} )')}
                value={recordPayload}
                onChange={(e) => setRecordPayload(e.target.value)}
              />
              <Button variant="contained" onClick={createRecord}>
                {t('SAVE RECORD', 'መዝገብ አስቀምጥ')}
              </Button>

              <Divider />

              <Typography variant="subtitle2" fontWeight={700}>
                {isAmharic ? 'ያለ መዝገብ አሻሽል (auto-revoke)' : 'Update Existing Record (auto-revoke)'}
              </Typography>
              <TextField
                fullWidth
                label={t('Record ID', 'የመዝገብ መለያ')}
                value={updateRecordId}
                onChange={(e) => setUpdateRecordId(e.target.value)}
              />
              <Button variant="outlined" onClick={updateRecord}>
                {t('UPDATE RECORD', 'መዝገብ አሻሽል')}
              </Button>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPatientViewOpen(false)}>{isAmharic ? 'ዝጋ' : 'Close'}</Button>
        </DialogActions>
      </Dialog>

      {/* Tab 4: My Schedule */}
      {tab === 3 && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 1 }}>
              {isAmharic ? 'የዛሬ ቀጠሮዎች' : "TODAY'S APPOINTMENTS"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={800}>
                  {isAmharic ? '09:00 - አልማዝ ከበደ' : '09:00 - Almaz Kebede'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {isAmharic ? 'ምክንያት፡ ተከታታይ ሕክምና' : 'Reason: Follow-up treatment'}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setToast({ open: true, severity: 'info', message: 'Open a patient from “My Patients” to view their dashboard.' })}
                >
                  {isAmharic ? 'ታካሚ ዳሽቦርድ ክፈት' : 'OPEN PATIENT DASHBOARD'}
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  {isAmharic
                    ? 'ማስታወሻ፡ ይህ የምሳሌ ካርድ ነው። ከ"My Patients" ውስጥ ታካሚ ምረጥ።'
                    : 'Note: This is a demo card. Open a real patient from “My Patients”.'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 5: Statistics */}
      {tab === 4 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  {isAmharic ? 'ጠቅላላ ንቁ ፈቃዶች' : 'Total active consents'}
                </Typography>
                <Typography variant="h5" fontWeight={900}>
                  2
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  {isAmharic ? 'የዛሬ ታካሚዎች' : "Today's patients"}
                </Typography>
                <Typography variant="h5" fontWeight={900}>
                  2
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  {isAmharic ? 'በመጠባበቅ ላይ ጥያቄዎች' : 'Pending consent requests'}
                </Typography>
                <Typography variant="h5" fontWeight={900}>
                  2
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  {isAmharic ? 'የሳምንቱ ቀጠሮዎች' : "This week's appointments"}
                </Typography>
                <Typography variant="h5" fontWeight={900}>
                  5
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 6: Settings */}
      {tab === 5 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={900} gutterBottom>
                  {isAmharic ? 'የሙያ መረጃ' : 'Professional Profile'}
                </Typography>
                <Stack spacing={1}>
                  <TextField fullWidth label={t('Name', 'ስም')} defaultValue={name} />
                  <TextField
                    fullWidth
                    label={t('Specialization', 'ስፔሻላይዜሽን')}
                    defaultValue={isAmharic ? 'አጠቃላይ ሕክምና' : 'General Practice'}
                  />
                  <TextField
                    fullWidth
                    label={t('Department', 'ዲፓርትመንት')}
                    defaultValue={isAmharic ? 'ውጪ ታካሚ' : 'Outpatient'}
                  />
                  <TextField fullWidth label={t('License (read-only)', 'ፈቃድ ቁጥር (ለንባብ ብቻ)')} value="MOH-12345" disabled />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={900} gutterBottom>
                  {isAmharic ? 'የስራ ቅንብሮች' : 'Working Hours & Preferences'}
                </Typography>
                <Stack spacing={1}>
                  <FormControl fullWidth>
                    <InputLabel>{t('Consultation duration (min)', 'የምክክር ጊዜ (ደቂቃ)')}</InputLabel>
                    <Select label={t('Consultation duration (min)', 'የምክክር ጊዜ (ደቂቃ)')} defaultValue={30}>
                      <MenuItem value={15}>15</MenuItem>
                      <MenuItem value={30}>30</MenuItem>
                      <MenuItem value={45}>45</MenuItem>
                      <MenuItem value={60}>60</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label={t('Working hours (example)', 'የስራ ሰዓት (ምሳሌ)')}
                    defaultValue={isAmharic ? 'ሰኞ-አርብ 08:00-17:00' : 'Mon–Fri 08:00–17:00'}
                  />
                  <Divider />
                  <Button variant="contained" onClick={handleSaveSettings} disabled={isSavingSettings}>
                    {t('Save', 'አስቀምጥ')}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 280 },
            bgcolor: '#2C3E50',
            color: 'white',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={800}>
            {name}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {isAmharic ? 'ሚና፡ የጤና ባለሙያ' : 'Role: Health Professional'}
          </Typography>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />
        <List>
          {professionalMenu.map((item) => (
            <ListItemButton
              key={item.id}
              onClick={() => handleMenuClick(item.onClick)}
              sx={{ py: 1.2, '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 38 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={isAmharic ? item.am : item.en}
              />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Dialog open={confirmLogout} onClose={() => setConfirmLogout(false)}>
        <DialogTitle>{isAmharic ? 'መውጣትን ያረጋግጡ' : 'Confirm Logout'}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {isAmharic ? 'ከስርዓቱ መውጣት ይፈልጋሉ?' : 'Are you sure you want to log out?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmLogout(false)}>{isAmharic ? 'ሰርዝ' : 'Cancel'}</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              setConfirmLogout(false);
              logout();
              navigate('/');
            }}
          >
            {isAmharic ? 'ውጣ' : 'Logout'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};


