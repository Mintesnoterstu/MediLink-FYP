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
import { CreateFacilityAdminForm, CreateFacilityAdminPayload } from '@/components/admin/CreateFacilityAdminForm';
import { FacilityAdminsList } from '@/components/admin/FacilityAdminsList';
import { FacilitiesList } from '@/components/admin/FacilitiesList';
import { StatisticsCards } from '@/components/admin/StatisticsCards';
import { woredaAdminService } from '@/features/admin/services/woredaAdminService';
import { useNavigate } from 'react-router-dom';
import { useUI } from '@/contexts/UIContext';
import { useDashboardMenu } from '@/features/patient/dashboard/context/DashboardMenuContext';
import {
  AdminHamburgerMenu,
  AdminHamburgerAction,
} from '@/features/admin/components/AdminHamburgerMenu';

export const WoredaDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { language } = useUI();
  const { menuOpen, closeMenu } = useDashboardMenu();
  const isAmharic = language === 'am';
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [stats, setStats] = React.useState({ totalFacilities: 0, totalProfessionals: 0, totalPatients: 0 });
  const [facilityAdmins, setFacilityAdmins] = React.useState<any[]>([]);
  const [facilities, setFacilities] = React.useState<any[]>([]);
  const [audit, setAudit] = React.useState<any[]>([]);
  const [active, setActive] = React.useState<'dashboard' | 'facility' | 'statistics' | 'audit' | 'settings'>('dashboard');
  const [facilityTab, setFacilityTab] = React.useState<'create' | 'admins' | 'facilities'>('create');
  const [confirmLogout, setConfirmLogout] = React.useState(false);
  const [toast, setToast] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showToast = (message: string, severity: 'success' | 'error') => setToast({ open: true, message, severity });
  const roleLabel = isAmharic ? 'የወረዳ አስተዳዳሪ' : 'Woreda Admin';

  const load = React.useCallback(async () => {
    const [s, admins, facs, a] = await Promise.all([
      woredaAdminService.getStatistics(),
      woredaAdminService.getFacilityAdmins(),
      woredaAdminService.getFacilities(),
      woredaAdminService.getAudit(),
    ]);
    setStats(s);
    setFacilityAdmins(admins);
    setFacilities(facs);
    setAudit(a);
  }, []);

  React.useEffect(() => {
    load().catch(() => showToast('Failed to load woreda dashboard', 'error'));
  }, [load]);

  const withLoading = async (work: () => Promise<void>) => {
    try {
      setLoading(true);
      await work();
      await load();
    } catch (e: any) {
      showToast(e?.response?.data?.error || e?.message || 'Request failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onCreateAdmin = async (payload: CreateFacilityAdminPayload) => {
    await withLoading(async () => {
      await woredaAdminService.createFacilityAdmin(payload);
      showToast('Facility admin created and credentials emailed.', 'success');
    });
  };

  const handleAdminMenuSelect = (action: AdminHamburgerAction) => {
    switch (action) {
      case 'dashboard':
        setActive('dashboard');
        break;
      case 'facility_management':
        setActive('facility');
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
            {isAmharic ? 'የወረዳ አስተዳዳሪ ዳሽቦርድ' : 'WOREDA ADMIN DASHBOARD'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>{user?.name}</strong> · {isAmharic ? 'ሚና፡ የወረዳ አስተዳዳሪ' : 'Role: Woreda Admin'}
          </Typography>
        </Box>
      </Box>

      <AdminHamburgerMenu
        variant="woreda_city"
        isOpen={menuOpen}
        onClose={closeMenu}
        onSelect={handleAdminMenuSelect}
        userName={user?.name}
        roleLabel={roleLabel}
      />

      <Alert severity="info" sx={{ mb: 2 }}>
        {isAmharic
          ? 'የወረዳ አስተዳዳሪዎች ስም-አልባ ስታቲስቲክስ ብቻ ያያሉ። የታካሚ ዝርዝር መረጃ አይታይም።'
          : 'Woreda admins can only view anonymous statistics. No patient-level data is shown.'}
      </Alert>

      {(active === 'dashboard' || active === 'statistics') && (
        <StatisticsCards stats={stats} />
      )}

      {(active === 'dashboard' || active === 'facility') && (
        <Stack spacing={3} sx={{ mt: 3 }}>
          <Tabs
            value={facilityTab}
            onChange={(_e, val) => setFacilityTab(val)}
            sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
          >
            <Tab value="create" label={isAmharic ? 'አስተዳዳሪ ፍጠር' : 'Create Admin'} />
            <Tab value="admins" label={isAmharic ? 'የተቋም አስተዳዳሪዎች' : 'Facility Admins'} />
            <Tab value="facilities" label={isAmharic ? 'ተቋማት' : 'Facilities'} />
          </Tabs>
          {facilityTab === 'create' && (
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={900} gutterBottom>
                {isAmharic ? 'የተቋም አስተዳዳሪ ፍጠር' : 'Create Facility Admin'}
              </Typography>
              <CreateFacilityAdminForm loading={loading} onSubmit={onCreateAdmin} />
            </CardContent>
          </Card>
          )}
          {facilityTab === 'admins' && (
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={900} gutterBottom>
                {isAmharic ? 'የተቋም አስተዳዳሪዎች' : 'Facility Admins'}
              </Typography>
              <FacilityAdminsList rows={facilityAdmins} />
            </CardContent>
          </Card>
          )}
          {facilityTab === 'facilities' && (
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={900} gutterBottom>{isAmharic ? 'ተቋማት' : 'Facilities'}</Typography>
              <FacilitiesList rows={facilities} />
            </CardContent>
          </Card>
          )}
        </Stack>
      )}

      {(active === 'dashboard' || active === 'audit') && (
        <Card sx={{ mt: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
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
        <Card sx={{ mt: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={900} gutterBottom>{isAmharic ? 'ቅንብሮች' : 'Settings'}</Typography>
            <Typography variant="body2" color="text.secondary">
              {isAmharic ? 'የቅንብር ገጽ እዚህ መጨመር ይቻላል።' : 'Settings UI can be added here (frontend-only).'}
            </Typography>
          </CardContent>
        </Card>
      )}

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
    </Box>
  );
};
