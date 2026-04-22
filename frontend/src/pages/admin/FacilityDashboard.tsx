import React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useUI } from '@/contexts/UIContext';
import { CreateDoctorForm, CreateDoctorPayload } from '@/components/admin/CreateDoctorForm';
import { CreateNurseForm, CreateNursePayload } from '@/components/admin/CreateNurseForm';
import { RegisterPatientForm, RegisterPatientPayload } from '@/components/admin/RegisterPatientForm';
import { DoctorsList } from '@/components/admin/DoctorsList';
import { NursesList } from '@/components/admin/NursesList';
import { PatientsList } from '@/components/admin/PatientsList';
import { facilityAdminService } from '@/features/admin/services/facilityAdminService';
import { useNavigate } from 'react-router-dom';
import { useDashboardMenu } from '@/features/patient/dashboard/context/DashboardMenuContext';
import {
  AdminHamburgerMenu,
  AdminHamburgerAction,
} from '@/features/admin/components/AdminHamburgerMenu';

export const FacilityDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { language } = useUI();
  const { menuOpen, closeMenu } = useDashboardMenu();
  const isAmharic = language === 'am';
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [stats, setStats] = React.useState({ totalDoctors: 0, totalNurses: 0, totalPatients: 0, todaysVisits: 0 });
  const [doctors, setDoctors] = React.useState<any[]>([]);
  const [nurses, setNurses] = React.useState<any[]>([]);
  const [patients, setPatients] = React.useState<any[]>([]);
  const [audit, setAudit] = React.useState<any[]>([]);
  const [active, setActive] = React.useState<'dashboard' | 'doctor' | 'nurse' | 'patient' | 'statistics' | 'audit' | 'settings'>('dashboard');
  const [manageTab, setManageTab] = React.useState<'doctor' | 'nurse' | 'patient'>('doctor');
  const [confirmLogout, setConfirmLogout] = React.useState(false);
  const [patientSuccess, setPatientSuccess] = React.useState<null | {
    patientName: string;
    ethiopianHealthId: string;
    temporaryPassword: string;
    emailSent: boolean;
  }>(null);
  const [toast, setToast] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const notify = (message: string, severity: 'success' | 'error' | 'warning') => setToast({ open: true, message, severity });
  const roleLabel = isAmharic ? 'የተቋም አስተዳዳሪ' : 'Facility Admin';

  const load = React.useCallback(async () => {
    const results = await Promise.allSettled([
      facilityAdminService.getStatistics(),
      facilityAdminService.getDoctors(),
      facilityAdminService.getNurses(),
      facilityAdminService.getPatients(),
      facilityAdminService.getAudit(),
    ]);

    const [s, d, n, p, a] = results;

    if (s.status === 'fulfilled') setStats(s.value);
    if (d.status === 'fulfilled') setDoctors(d.value);
    if (n.status === 'fulfilled') setNurses(n.value);
    if (p.status === 'fulfilled') setPatients(p.value);
    if (a.status === 'fulfilled') setAudit(a.value);

    const firstErr = results.find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined;
    if (firstErr) {
      const e: any = firstErr.reason;
      const apiError = e?.response?.data;
      const details = Array.isArray(apiError?.details) ? apiError.details.join(' ') : '';
      notify(details || apiError?.error || e?.message || 'Some dashboard data failed to load', 'warning');
    }
  }, []);

  React.useEffect(() => {
    load().catch((e: any) => {
      const apiError = e?.response?.data;
      const details = Array.isArray(apiError?.details) ? apiError.details.join(' ') : '';
      notify(details || apiError?.error || e?.message || 'Failed to load facility dashboard', 'error');
    });
  }, [load]);

  const withLoading = async (work: () => Promise<void>) => {
    try {
      setLoading(true);
      await work();
      await load();
    } catch (e: any) {
      const apiError = e?.response?.data;
      const details = Array.isArray(apiError?.details) ? apiError.details.join(' ') : '';
      notify(details || apiError?.error || e?.message || 'Request failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const createDoctor = async (payload: CreateDoctorPayload) => {
    await withLoading(async () => {
      await facilityAdminService.createDoctor(payload);
      notify('Doctor created and credentials emailed.', 'success');
    });
  };

  const createNurse = async (payload: CreateNursePayload) => {
    await withLoading(async () => {
      await facilityAdminService.createNurse(payload);
      notify('Nurse created and credentials emailed.', 'success');
    });
  };

  const checkDuplicate = async (payload: Pick<RegisterPatientPayload, 'kebeleIdNumber' | 'phoneNumber' | 'fullName' | 'dateOfBirth'>) => {
    const data = await facilityAdminService.checkDuplicate(payload);
    if (data.found) {
      notify(`Duplicate found: ${data.duplicates[0]?.ethiopian_health_id || 'existing patient'}`, 'warning');
    } else {
      notify('No existing patient found. You can proceed.', 'success');
    }
  };

  const registerPatient = async (payload: RegisterPatientPayload) => {
    await withLoading(async () => {
      const created = await facilityAdminService.registerPatient(payload);
      setPatientSuccess({
        patientName: payload.fullName,
        ethiopianHealthId: created.ethiopianHealthId,
        temporaryPassword: created.temporaryPassword,
        emailSent: Boolean(created.emailSent),
      });
      notify(`Registration successful. Ethiopian Health ID: ${created.ethiopianHealthId}`, 'success');
    });
  };

  const handleAdminMenuSelect = (action: AdminHamburgerAction) => {
    switch (action) {
      case 'dashboard':
        setActive('dashboard');
        break;
      case 'doctor_management':
        setActive('doctor');
        setManageTab('doctor');
        break;
      case 'nurse_management':
        setActive('nurse');
        setManageTab('nurse');
        break;
      case 'patient_registration':
        setActive('patient');
        setManageTab('patient');
        break;
      case 'statistics':
        setActive('statistics');
        break;
      case 'audit':
        setActive('audit');
        break;
      case 'settings':
        setActive('settings');
        break;
      case 'help':
        navigate('/help');
        break;
      case 'logout':
        setConfirmLogout(true);
        break;
      default:
        break;
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden', boxSizing: 'border-box' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' }, lineHeight: 1.2 }}>
            {isAmharic ? 'የተቋም አስተዳዳሪ ዳሽቦርድ' : 'FACILITY ADMIN DASHBOARD'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>{user?.name}</strong> · {isAmharic ? 'ሚና፡ የተቋም አስተዳዳሪ' : 'Role: Facility Admin'}
          </Typography>
        </Box>
      </Box>

      <AdminHamburgerMenu
        variant="facility"
        isOpen={menuOpen}
        onClose={closeMenu}
        onSelect={handleAdminMenuSelect}
        userName={user?.name}
        roleLabel={roleLabel}
      />

      <Alert severity="info" sx={{ mb: 2 }}>
        {isAmharic
          ? 'የተቋም አስተዳዳሪዎች ታካሚ መመዝገብ ይችላሉ፣ ነገር ግን የታካሚ ሕክምና መዝገብ አያዩም።'
          : 'Facility admins can register patients but cannot view patient medical records; only anonymous counts and basic profile info are visible.'}
      </Alert>

      {(active === 'dashboard' || active === 'statistics') && (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <Card sx={{ flex: 1, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="caption">{isAmharic ? 'ጠቅላላ ሐኪሞች' : 'Total Doctors'}</Typography>
              <Typography variant="h5">{stats.totalDoctors}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="caption">{isAmharic ? 'ጠቅላላ ነርሶች' : 'Total Nurses'}</Typography>
              <Typography variant="h5">{stats.totalNurses}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="caption">{isAmharic ? 'ጠቅላላ የተመዘገቡ ታካሚዎች' : 'Total Registered Patients'}</Typography>
              <Typography variant="h5">{stats.totalPatients}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="caption">{isAmharic ? 'የዛሬ ጉብኝቶች' : "Today's Visits"}</Typography>
              <Typography variant="h5">{stats.todaysVisits}</Typography>
            </CardContent>
          </Card>
        </Stack>
      )}

      <Stack spacing={3}>
        {(active === 'dashboard' || active === 'doctor' || active === 'nurse' || active === 'patient') && (
          <Tabs value={manageTab} onChange={(_e, val) => setManageTab(val)} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
            <Tab value="doctor" label={isAmharic ? 'የሐኪም አስተዳደር' : 'Doctor Management'} />
            <Tab value="nurse" label={isAmharic ? 'የነርስ አስተዳደር' : 'Nurse Management'} />
            <Tab value="patient" label={isAmharic ? 'የታካሚ ምዝገባ' : 'Patient Registration'} />
          </Tabs>
        )}
        {(active === 'dashboard' || active === 'doctor' || active === 'nurse' || active === 'patient') && manageTab === 'doctor' && (
          <>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={900} gutterBottom>{isAmharic ? 'ሐኪም ፍጠር' : 'Create Doctor'}</Typography>
                <CreateDoctorForm loading={loading} onSubmit={createDoctor} />
              </CardContent>
            </Card>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={900} gutterBottom>{isAmharic ? 'የሐኪሞች ዝርዝር' : 'Doctors List'}</Typography>
                <DoctorsList rows={doctors} />
              </CardContent>
            </Card>
          </>
        )}

        {(active === 'dashboard' || active === 'doctor' || active === 'nurse' || active === 'patient') && manageTab === 'nurse' && (
          <>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={900} gutterBottom>{isAmharic ? 'ነርስ ፍጠር' : 'Create Nurse'}</Typography>
                <CreateNurseForm loading={loading} onSubmit={createNurse} />
              </CardContent>
            </Card>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={900} gutterBottom>{isAmharic ? 'የነርሶች ዝርዝር' : 'Nurses List'}</Typography>
                <NursesList rows={nurses} />
              </CardContent>
            </Card>
          </>
        )}

        {(active === 'dashboard' || active === 'doctor' || active === 'nurse' || active === 'patient') && manageTab === 'patient' && (
          <>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={900} gutterBottom>
                  {isAmharic ? 'ታካሚ መዝግብ (ለተቋም አስተዳዳሪ ብቻ)' : 'Register Patient (Facility Admin Only)'}
                </Typography>
                <RegisterPatientForm loading={loading} onCheckDuplicates={checkDuplicate} onSubmit={registerPatient} />
              </CardContent>
            </Card>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={900} gutterBottom>
                  {isAmharic ? 'የታካሚዎች ዝርዝር (መሰረታዊ መረጃ ብቻ)' : 'Patients List (Basic Info Only)'}
                </Typography>
                <PatientsList rows={patients} />
              </CardContent>
            </Card>
          </>
        )}

        {(active === 'dashboard' || active === 'audit') && (
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={900} gutterBottom>{isAmharic ? 'የኦዲት መዝገቦች' : 'Audit Logs'}</Typography>
              {audit.slice(0, 10).map((item) => (
                <Typography key={`${item.ts}-${item.action}`} variant="body2" sx={{ mb: 1 }}>
                  {new Date(item.ts).toLocaleString()} - {item.action}
                </Typography>
              ))}
            </CardContent>
          </Card>
        )}

        {active === 'settings' && (
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={900} gutterBottom>{isAmharic ? 'ቅንብሮች' : 'Settings'}</Typography>
              <Typography variant="body2" color="text.secondary">
                {isAmharic ? 'የቅንብር ገጽ እዚህ መጨመር ይቻላል።' : 'Settings UI can be added here (frontend-only).'}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Stack>

      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast((s) => ({ ...s, open: false }))}>
        <Alert severity={toast.severity} variant="filled">{toast.message}</Alert>
      </Snackbar>

      <Dialog open={confirmLogout} onClose={() => setConfirmLogout(false)}>
        <DialogTitle>{isAmharic ? 'መውጣትን ያረጋግጡ' : 'Confirm Logout'}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">{isAmharic ? 'ከስርዓቱ መውጣት ይፈልጋሉ?' : 'Are you sure you want to log out?'}</Typography>
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

      <Dialog open={Boolean(patientSuccess)} onClose={() => setPatientSuccess(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{isAmharic ? 'ምዝገባ ተሳክቷል' : 'Registration Successful'}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ mt: 1 }}>
            <Alert severity="success" variant="outlined">
              {isAmharic ? 'የኢትዮጵያ የጤና መታወቂያ፡ ' : 'Ethiopian Health ID: '}
              <strong>{patientSuccess?.ethiopianHealthId}</strong>
            </Alert>
            <Alert severity="info" variant="outlined">
              {isAmharic ? 'የይለፍ ቃል፡ ' : 'Password: '}
              <strong>{patientSuccess?.temporaryPassword}</strong>
            </Alert>
            <Typography variant="body2" color="text.secondary">
              {isAmharic ? 'ታካሚ፡ ' : 'Patient: '}
              <strong>{patientSuccess?.patientName}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isAmharic ? 'ኢሜይል ተላከ፡ ' : 'Email sent: '}
              <strong>{patientSuccess?.emailSent ? (isAmharic ? 'አዎ' : 'Yes') : (isAmharic ? 'አይደለም' : 'No')}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isAmharic
                ? 'ታካሚው በኢሜይል እና በይለፍ ቃል መግባት ይችላል፣ በመጀመሪያ መግቢያ ላይ የይለፍ ቃል መቀየር አለበት።'
                : 'Patient can log in using email and password and must change password on first login.'}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => window.print()}>{isAmharic ? 'አትም' : 'Print'}</Button>
          <Button variant="contained" onClick={() => setPatientSuccess(null)}>{isAmharic ? 'አዲስ ታካሚ መዝግብ' : 'Register New Patient'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
