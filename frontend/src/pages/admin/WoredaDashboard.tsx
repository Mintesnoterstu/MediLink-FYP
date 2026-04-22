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
import { CreateFacilityAdminForm, CreateFacilityAdminPayload } from '@/components/admin/CreateFacilityAdminForm';
import { FacilityAdminsList } from '@/components/admin/FacilityAdminsList';
import { FacilitiesList } from '@/components/admin/FacilitiesList';
import { StatisticsCards } from '@/components/admin/StatisticsCards';
import { woredaAdminService } from '@/features/admin/services/woredaAdminService';
import { useNavigate } from 'react-router-dom';
import { useUI } from '@/contexts/UIContext';

export const WoredaDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { language } = useUI();
  const isAmharic = language === 'am';
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [stats, setStats] = React.useState({ totalFacilities: 0, totalProfessionals: 0, totalPatients: 0 });
  const [facilityAdmins, setFacilityAdmins] = React.useState<any[]>([]);
  const [facilities, setFacilities] = React.useState<any[]>([]);
  const [audit, setAudit] = React.useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [active, setActive] = React.useState<'dashboard' | 'facility' | 'statistics' | 'audit' | 'settings'>('dashboard');
  const [confirmLogout, setConfirmLogout] = React.useState(false);
  const [toast, setToast] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showToast = (message: string, severity: 'success' | 'error') => setToast({ open: true, message, severity });

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

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden', boxSizing: 'border-box' }}>
      {/* Header (same pattern as Professional Dashboard) */}
      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box display="flex" alignItems="center" gap={1.25}>
          <IconButton onClick={() => setDrawerOpen(true)} size="small" aria-label="open menu">
            <Home />
          </IconButton>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' }, lineHeight: 1.2 }}>
              {isAmharic ? 'የወረዳ አስተዳዳሪ ዳሽቦርድ' : 'WOREDA ADMIN DASHBOARD'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>{user?.name}</strong> · {isAmharic ? 'ሚና፡ የወረዳ አስተዳዳሪ' : 'Role: Woreda Admin'}
            </Typography>
          </Box>
        </Box>
      </Box>

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
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={900} gutterBottom>
                {isAmharic ? 'የተቋም አስተዳዳሪ ፍጠር' : 'Create Facility Admin'}
              </Typography>
              <CreateFacilityAdminForm loading={loading} onSubmit={onCreateAdmin} />
            </CardContent>
          </Card>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={900} gutterBottom>
                {isAmharic ? 'የተቋም አስተዳዳሪዎች' : 'Facility Admins'}
              </Typography>
              <FacilityAdminsList rows={facilityAdmins} />
            </CardContent>
          </Card>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={900} gutterBottom>{isAmharic ? 'ተቋማት' : 'Facilities'}</Typography>
              <FacilitiesList rows={facilities} />
            </CardContent>
          </Card>
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
            <Typography variant="subtitle1" fontWeight={900} gutterBottom>Settings</Typography>
            <Typography variant="body2" color="text.secondary">
              {isAmharic ? 'የቅንብር ገጽ እዚህ መጨመር ይቻላል።' : 'Settings UI can be added here (frontend-only).'}
            </Typography>
          </CardContent>
        </Card>
      )}

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
            {user?.name || (isAmharic ? 'የወረዳ አስተዳዳሪ' : 'Woreda Admin')}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {isAmharic ? 'ሚና፡ የወረዳ አስተዳዳሪ' : 'Role: Woreda Admin'}
          </Typography>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />
        <List>
          <ListItemButton onClick={() => { setActive('dashboard'); setDrawerOpen(false); }} sx={{ py: 1.2, '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } }}>
            <ListItemIcon sx={{ color: 'white', minWidth: 38 }}><Home /></ListItemIcon>
            <ListItemText primary={isAmharic ? 'ዳሽቦርድ' : 'Dashboard'} />
          </ListItemButton>
          <ListItemButton onClick={() => { setActive('facility'); setDrawerOpen(false); }} sx={{ py: 1.2, '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } }}>
            <ListItemIcon sx={{ color: 'white', minWidth: 38 }}><LocalHospital /></ListItemIcon>
            <ListItemText primary={isAmharic ? 'የተቋም አስተዳደር' : 'Facility Management'} />
          </ListItemButton>
          <ListItemButton onClick={() => { setActive('statistics'); setDrawerOpen(false); }} sx={{ py: 1.2, '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } }}>
            <ListItemIcon sx={{ color: 'white', minWidth: 38 }}><BarChart /></ListItemIcon>
            <ListItemText primary={isAmharic ? 'ስታቲስቲክስ' : 'Statistics'} />
          </ListItemButton>
          <ListItemButton onClick={() => { setActive('audit'); setDrawerOpen(false); }} sx={{ py: 1.2, '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } }}>
            <ListItemIcon sx={{ color: 'white', minWidth: 38 }}><Groups /></ListItemIcon>
            <ListItemText primary={isAmharic ? 'የኦዲት መዝገብ' : 'Audit Logs'} />
          </ListItemButton>
          <ListItemButton onClick={() => { setActive('settings'); setDrawerOpen(false); }} sx={{ py: 1.2, '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } }}>
            <ListItemIcon sx={{ color: 'white', minWidth: 38 }}><Settings /></ListItemIcon>
            <ListItemText primary={isAmharic ? 'ቅንብሮች' : 'Settings'} />
          </ListItemButton>
          <ListItemButton onClick={() => { setDrawerOpen(false); setConfirmLogout(true); }} sx={{ py: 1.2, '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } }}>
            <ListItemIcon sx={{ color: 'white', minWidth: 38 }}><LogoutIcon /></ListItemIcon>
            <ListItemText primary={isAmharic ? 'ውጣ' : 'Logout'} />
          </ListItemButton>
        </List>
      </Drawer>

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
