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
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { Home, BarChart, Settings, Logout as LogoutIcon, LocalHospital, Groups } from '@mui/icons-material';
import { useAuth } from '@/features/auth/context/AuthContext';
import { CreateDoctorForm, CreateDoctorPayload } from '@/components/admin/CreateDoctorForm';
import { CreateNurseForm, CreateNursePayload } from '@/components/admin/CreateNurseForm';
import { RegisterPatientForm, RegisterPatientPayload } from '@/components/admin/RegisterPatientForm';
import { DoctorsList } from '@/components/admin/DoctorsList';
import { NursesList } from '@/components/admin/NursesList';
import { PatientsList } from '@/components/admin/PatientsList';
import { facilityAdminService } from '@/features/admin/services/facilityAdminService';
import { useNavigate } from 'react-router-dom';

export const FacilityDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [stats, setStats] = React.useState({ totalDoctors: 0, totalNurses: 0, totalPatients: 0, todaysVisits: 0 });
  const [doctors, setDoctors] = React.useState<any[]>([]);
  const [nurses, setNurses] = React.useState<any[]>([]);
  const [patients, setPatients] = React.useState<any[]>([]);
  const [audit, setAudit] = React.useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [active, setActive] = React.useState<'dashboard' | 'doctor' | 'nurse' | 'patient' | 'statistics' | 'audit' | 'settings'>('dashboard');
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

  const load = React.useCallback(async () => {
    const [s, d, n, p, a] = await Promise.all([
      facilityAdminService.getStatistics(),
      facilityAdminService.getDoctors(),
      facilityAdminService.getNurses(),
      facilityAdminService.getPatients(),
      facilityAdminService.getAudit(),
    ]);
    setStats(s);
    setDoctors(d);
    setNurses(n);
    setPatients(p);
    setAudit(a);
  }, []);

  React.useEffect(() => {
    load().catch(() => notify('Failed to load facility dashboard', 'error'));
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

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden', boxSizing: 'border-box' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box display="flex" alignItems="center" gap={1.25}>
          <IconButton onClick={() => setDrawerOpen(true)} size="small" aria-label="open menu">
            <Home />
          </IconButton>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' }, lineHeight: 1.2 }}>
              FACILITY ADMIN DASHBOARD
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>{user?.name}</strong> · Role: Facility Admin
            </Typography>
          </Box>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        Facility admins can register patients but cannot view patient medical records; only anonymous counts and basic profile info are visible.
      </Alert>

      {(active === 'dashboard' || active === 'statistics') && (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <Card sx={{ flex: 1, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="caption">Total Doctors</Typography>
              <Typography variant="h5">{stats.totalDoctors}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="caption">Total Nurses</Typography>
              <Typography variant="h5">{stats.totalNurses}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="caption">Total Registered Patients</Typography>
              <Typography variant="h5">{stats.totalPatients}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="caption">Today's Visits</Typography>
              <Typography variant="h5">{stats.todaysVisits}</Typography>
            </CardContent>
          </Card>
        </Stack>
      )}

      <Stack spacing={3}>
        {(active === 'dashboard' || active === 'doctor') && (
          <>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={900} gutterBottom>Create Doctor</Typography>
                <CreateDoctorForm loading={loading} onSubmit={createDoctor} />
              </CardContent>
            </Card>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={900} gutterBottom>Doctors List</Typography>
                <DoctorsList rows={doctors} />
              </CardContent>
            </Card>
          </>
        )}

        {(active === 'dashboard' || active === 'nurse') && (
          <>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={900} gutterBottom>Create Nurse</Typography>
                <CreateNurseForm loading={loading} onSubmit={createNurse} />
              </CardContent>
            </Card>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={900} gutterBottom>Nurses List</Typography>
                <NursesList rows={nurses} />
              </CardContent>
            </Card>
          </>
        )}

        {(active === 'dashboard' || active === 'patient') && (
          <>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={900} gutterBottom>Register Patient (Facility Admin Only)</Typography>
                <RegisterPatientForm loading={loading} onCheckDuplicates={checkDuplicate} onSubmit={registerPatient} />
              </CardContent>
            </Card>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={900} gutterBottom>Patients List (Basic Info Only)</Typography>
                <PatientsList rows={patients} />
              </CardContent>
            </Card>
          </>
        )}

        {(active === 'dashboard' || active === 'audit') && (
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={900} gutterBottom>Audit Logs</Typography>
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
              <Typography variant="subtitle1" fontWeight={900} gutterBottom>Settings</Typography>
              <Typography variant="body2" color="text.secondary">
                Settings UI can be added here (frontend-only).
              </Typography>
            </CardContent>
          </Card>
        )}
      </Stack>

      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast((s) => ({ ...s, open: false }))}>
        <Alert severity={toast.severity} variant="filled">{toast.message}</Alert>
      </Snackbar>

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
            {user?.name || 'Facility Admin'}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Role: Facility Admin
          </Typography>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />
        <List>
          <ListItemButton onClick={() => { setActive('dashboard'); setDrawerOpen(false); }} sx={{ py: 1.2, '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } }}>
            <ListItemIcon sx={{ color: 'white', minWidth: 38 }}><Home /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
          <ListItemButton onClick={() => { setActive('doctor'); setDrawerOpen(false); }} sx={{ py: 1.2, '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } }}>
            <ListItemIcon sx={{ color: 'white', minWidth: 38 }}><Groups /></ListItemIcon>
            <ListItemText primary="Doctor Management" />
          </ListItemButton>
          <ListItemButton onClick={() => { setActive('nurse'); setDrawerOpen(false); }} sx={{ py: 1.2, '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } }}>
            <ListItemIcon sx={{ color: 'white', minWidth: 38 }}><Groups /></ListItemIcon>
            <ListItemText primary="Nurse Management" />
          </ListItemButton>
          <ListItemButton onClick={() => { setActive('patient'); setDrawerOpen(false); }} sx={{ py: 1.2, '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } }}>
            <ListItemIcon sx={{ color: 'white', minWidth: 38 }}><LocalHospital /></ListItemIcon>
            <ListItemText primary="Patient Registration" />
          </ListItemButton>
          <ListItemButton onClick={() => { setActive('statistics'); setDrawerOpen(false); }} sx={{ py: 1.2, '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } }}>
            <ListItemIcon sx={{ color: 'white', minWidth: 38 }}><BarChart /></ListItemIcon>
            <ListItemText primary="Statistics" />
          </ListItemButton>
          <ListItemButton onClick={() => { setActive('audit'); setDrawerOpen(false); }} sx={{ py: 1.2, '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } }}>
            <ListItemIcon sx={{ color: 'white', minWidth: 38 }}><Groups /></ListItemIcon>
            <ListItemText primary="Audit Logs" />
          </ListItemButton>
          <ListItemButton onClick={() => { setActive('settings'); setDrawerOpen(false); }} sx={{ py: 1.2, '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } }}>
            <ListItemIcon sx={{ color: 'white', minWidth: 38 }}><Settings /></ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
          <ListItemButton onClick={() => { setDrawerOpen(false); setConfirmLogout(true); }} sx={{ py: 1.2, '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } }}>
            <ListItemIcon sx={{ color: 'white', minWidth: 38 }}><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </List>
      </Drawer>

      <Dialog open={confirmLogout} onClose={() => setConfirmLogout(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Are you sure you want to log out?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmLogout(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              setConfirmLogout(false);
              logout();
              navigate('/');
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(patientSuccess)} onClose={() => setPatientSuccess(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Registration Successful</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ mt: 1 }}>
            <Alert severity="success" variant="outlined">
              Ethiopian Health ID: <strong>{patientSuccess?.ethiopianHealthId}</strong>
            </Alert>
            <Alert severity="info" variant="outlined">
              Temporary Password: <strong>{patientSuccess?.temporaryPassword}</strong>
            </Alert>
            <Typography variant="body2" color="text.secondary">
              Patient: <strong>{patientSuccess?.patientName}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email sent: <strong>{patientSuccess?.emailSent ? 'Yes' : 'No'}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Patient can log in using email + temporary password and must change password on first login.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => window.print()}>Print</Button>
          <Button variant="contained" onClick={() => setPatientSuccess(null)}>Register New Patient</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
