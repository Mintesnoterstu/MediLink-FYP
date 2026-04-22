import React from 'react';
import axios from 'axios';
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
  Grid,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useUI } from '@/contexts/UIContext';
import { useDashboardMenu } from '@/features/patient/dashboard/context/DashboardMenuContext';
import {
  AdminHamburgerMenu,
  AdminHamburgerAction,
} from '@/features/admin/components/AdminHamburgerMenu';
import { CreateWoredaForm } from '@/components/admin/CreateWoredaForm';
import { CreateCityForm } from '@/components/admin/CreateCityForm';
import { AdminsList } from '@/components/admin/AdminsList';
import {
  zonalAdminService,
  AdminRow,
  AuditRow,
  ZoneStats,
  CreatedAdminResponse,
  EmailStatusResponse,
} from '@/features/admin/services/zonalAdminService';

const defaultStats: ZoneStats = {
  totalWoredas: 10,
  totalFacilities: 86,
  totalProfessionals: 456,
  totalPatients: 234567,
};

export const ZonalDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { language } = useUI();
  const { menuOpen, closeMenu } = useDashboardMenu();
  const isAmharic = language === 'am';
  const [mainPanel, setMainPanel] = React.useState<'tabs' | 'settings'>('tabs');
  const [activeTab, setActiveTab] = React.useState(0);
  const [confirmLogout, setConfirmLogout] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [stats, setStats] = React.useState<ZoneStats>(defaultStats);
  const [woredaAdmins, setWoredaAdmins] = React.useState<AdminRow[]>([]);
  const [cityAdmins, setCityAdmins] = React.useState<AdminRow[]>([]);
  const [auditLogs, setAuditLogs] = React.useState<AuditRow[]>([]);
  const [lastCreatedAccount, setLastCreatedAccount] = React.useState<CreatedAdminResponse | null>(null);
  const [emailStatus, setEmailStatus] = React.useState<EmailStatusResponse | null>(null);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; type: 'success' | 'error' }>({
    open: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, type });
  };

  const loadData = React.useCallback(async () => {
    const [statsData, woredaData, cityData, auditData, emailStatusData] = await Promise.all([
      zonalAdminService.getStatistics(),
      zonalAdminService.getWoredaAdmins(),
      zonalAdminService.getCityAdmins(),
      zonalAdminService.getAuditLogs(),
      zonalAdminService.getEmailStatus(),
    ]);
    setStats({
      totalWoredas: statsData.totalWoredas || 10,
      totalFacilities: statsData.totalFacilities || 86,
      totalProfessionals: statsData.totalProfessionals || 456,
      totalPatients: statsData.totalPatients || 234567,
    });
    setWoredaAdmins(woredaData);
    setCityAdmins(cityData);
    setAuditLogs(auditData);
    setEmailStatus(emailStatusData);
  }, []);

  React.useEffect(() => {
    loadData().catch(() => {
      showToast('Failed to load zonal dashboard data', 'error');
    });
  }, [loadData]);

  const wrapCreate = async (action: () => Promise<void>) => {
    try {
      setLoading(true);
      await action();
      await loadData();
    } catch (error: unknown) {
      let message = error instanceof Error ? error.message : 'Request failed';
      if (axios.isAxiosError(error)) {
        const apiMessage = error.response?.data?.error;
        if (typeof apiMessage === 'string' && apiMessage.trim()) {
          message = apiMessage;
        }
      }
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyPassword = async () => {
    if (!lastCreatedAccount?.temporaryPassword) return;
    await navigator.clipboard.writeText(lastCreatedAccount.temporaryPassword);
    showToast('Temporary password copied.');
  };

  const roleLabel = isAmharic ? 'የዞን አስተዳዳሪ' : 'Zonal Admin';

  const handleAdminMenuSelect = (action: AdminHamburgerAction) => {
    switch (action) {
      case 'dashboard':
        setMainPanel('tabs');
        setActiveTab(0);
        break;
      case 'admin_management':
        setMainPanel('tabs');
        setActiveTab(1);
        break;
      case 'statistics':
        setMainPanel('tabs');
        setActiveTab(0);
        break;
      case 'audit':
        setMainPanel('tabs');
        setActiveTab(3);
        break;
      case 'settings':
        setMainPanel('settings');
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
    <Box sx={{ px: { xs: 1, md: 2 }, pb: 4 }}>
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #0f3b76 0%, #0f5c96 100%)',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box>
              <Typography variant="h5" fontWeight={800}>
                {isAmharic ? 'የዞን አስተዳዳሪ ዳሽቦርድ' : 'Zonal Admin Dashboard'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {user?.name} ({user?.adminLevel || (isAmharic ? 'ዞን' : 'zonal')})
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <AdminHamburgerMenu
        variant="zonal"
        isOpen={menuOpen}
        onClose={closeMenu}
        onSelect={handleAdminMenuSelect}
        userName={user?.name}
        roleLabel={roleLabel}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">{isAmharic ? 'ጠቅላላ ወረዳዎች' : 'Total Woredas'}</Typography>
              <Typography variant="h5" fontWeight={800}>{stats.totalWoredas || 10}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">{isAmharic ? 'ጠቅላላ ተቋማት' : 'Total Facilities'}</Typography>
              <Typography variant="h5" fontWeight={800}>{stats.totalFacilities || 86}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">{isAmharic ? 'ጠቅላላ ባለሙያዎች' : 'Total Professionals'}</Typography>
              <Typography variant="h5" fontWeight={800}>{stats.totalProfessionals || 456}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">{isAmharic ? 'ጠቅላላ ታካሚዎች' : 'Total Patients'}</Typography>
              <Typography variant="h5" fontWeight={800}>{(stats.totalPatients || 234567).toLocaleString()}+</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {mainPanel === 'settings' && (
        <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={900} gutterBottom>
              {isAmharic ? 'ቅንብሮች' : 'Settings'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isAmharic
                ? 'የቅንብር ገጽ እዚህ መጨመር ይቻላል።'
                : 'Settings UI can be added here (frontend-only).'}
            </Typography>
          </CardContent>
        </Card>
      )}

      {mainPanel === 'tabs' && (
        <>
      <Tabs value={activeTab} onChange={(_e, val) => { setActiveTab(val); setMainPanel('tabs'); }} sx={{ mb: 2 }}>
        <Tab label={isAmharic ? 'ዳሽቦርድ' : 'Dashboard'} />
        <Tab label={isAmharic ? 'አስተዳዳሪ ፍጠር' : 'Create Admins'} />
        <Tab label={isAmharic ? 'ዝርዝሮች' : 'Lists'} />
        <Tab label={isAmharic ? 'የቅርብ እንቅስቃሴ' : 'Recent Activity'} />
      </Tabs>

      {emailStatus && (
        <Alert severity={emailStatus.configured ? 'success' : 'warning'} sx={{ mb: 2 }}>
          {emailStatus.message}
        </Alert>
      )}

      {activeTab === 1 && (
        <Stack spacing={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Create Woreda Admin</Typography>
              <CreateWoredaForm
                loading={loading}
                onSubmit={(payload) =>
                  wrapCreate(async () => {
                    const created = await zonalAdminService.createWoredaAdmin(payload);
                    setLastCreatedAccount(created);
                    showToast(created.emailDelivered ? 'Woreda admin created and email sent.' : 'Woreda admin created. Email not delivered; use temporary password shown.');
                  })
                }
              />
            </CardContent>
          </Card>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Create City Admin</Typography>
              <CreateCityForm
                loading={loading}
                onSubmit={(payload) =>
                  wrapCreate(async () => {
                    const created = await zonalAdminService.createCityAdmin(payload);
                    setLastCreatedAccount(created);
                    showToast(created.emailDelivered ? 'City admin created and email sent.' : 'City admin created. Email not delivered; use temporary password shown.');
                  })
                }
              />
            </CardContent>
          </Card>
        </Stack>
      )}

      {activeTab === 2 && (
        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Woreda Admins</Typography>
              <AdminsList rows={woredaAdmins} scope="woreda" />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>City Admin</Typography>
              <AdminsList rows={cityAdmins} scope="city" />
            </CardContent>
          </Card>
        </Stack>
      )}

      {activeTab === 3 && (
        <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Recent Activity</Typography>
            {auditLogs.slice(0, 5).map((log) => (
              <Typography key={`${log.ts}-${log.action}`} variant="body2" sx={{ mb: 1 }}>
                {new Date(log.ts).toLocaleString()} - {log.action}
              </Typography>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === 0 && (
        <Alert severity="info">
          {isAmharic
            ? 'የዞን አስተዳዳሪዎች ስም-አልባ ስታቲስቲክስ ብቻ ያያሉ። የታካሚ የሕክምና መረጃ አይገኝም።'
            : 'Zonal admins can only view anonymous statistics and cannot access patient-level medical data.'}
        </Alert>
      )}
        </>
      )}

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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.type} variant="filled">{snackbar.message}</Alert>
      </Snackbar>

      <Dialog open={Boolean(lastCreatedAccount)} onClose={() => setLastCreatedAccount(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Admin account created</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Share these credentials with the new admin:
          </Typography>
          <Typography variant="body2"><strong>Email:</strong> {lastCreatedAccount?.email}</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Temporary Password:</strong> {lastCreatedAccount?.temporaryPassword}
          </Typography>
          <Alert severity={lastCreatedAccount?.emailDelivered ? 'success' : 'warning'}>
            {lastCreatedAccount?.emailDelivered
              ? 'Email notification was sent successfully.'
              : `Email notification failed (${lastCreatedAccount?.emailError || 'unknown error'}). Please configure SMTP and retry.`}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={copyPassword}>Copy Password</Button>
          <Button variant="contained" onClick={() => setLastCreatedAccount(null)}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
