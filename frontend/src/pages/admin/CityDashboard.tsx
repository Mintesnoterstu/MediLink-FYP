import React from 'react';
import { Alert, Box, Card, CardContent, Snackbar, Stack, Typography } from '@mui/material';
import { useAuth } from '@/features/auth/context/AuthContext';
import { CreateFacilityAdminForm, CreateFacilityAdminPayload } from '@/components/admin/CreateFacilityAdminForm';
import { RegisterFacilityForm, RegisterFacilityPayload } from '@/components/admin/RegisterFacilityForm';
import { FacilityAdminsList } from '@/components/admin/FacilityAdminsList';
import { FacilitiesList } from '@/components/admin/FacilitiesList';
import { StatisticsCards } from '@/components/admin/StatisticsCards';
import { cityAdminService } from '@/features/admin/services/cityAdminService';

export const CityDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [stats, setStats] = React.useState({ totalFacilities: 0, totalProfessionals: 0, totalPatients: 0 });
  const [facilityAdmins, setFacilityAdmins] = React.useState<any[]>([]);
  const [facilities, setFacilities] = React.useState<any[]>([]);
  const [audit, setAudit] = React.useState<any[]>([]);
  const [toast, setToast] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showToast = (message: string, severity: 'success' | 'error') => setToast({ open: true, message, severity });

  const load = React.useCallback(async () => {
    const [s, admins, facs, a] = await Promise.all([
      cityAdminService.getStatistics(),
      cityAdminService.getFacilityAdmins(),
      cityAdminService.getFacilities(),
      cityAdminService.getAudit(),
    ]);
    setStats(s);
    setFacilityAdmins(admins);
    setFacilities(facs);
    setAudit(a);
  }, []);

  React.useEffect(() => {
    load().catch(() => showToast('Failed to load city dashboard', 'error'));
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
      await cityAdminService.createFacilityAdmin(payload);
      showToast('Facility admin created and credentials emailed.', 'success');
    });
  };

  const onRegisterFacility = async (payload: RegisterFacilityPayload) => {
    await withLoading(async () => {
      await cityAdminService.registerFacility(payload);
      showToast('Facility registered successfully.', 'success');
    });
  };

  return (
    <Box sx={{ px: { xs: 1, md: 2 }, pb: 4 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>City Admin Dashboard</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {user?.name} (City Admin - Jimma City)
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        City admins can only view anonymous statistics. No patient-level data is shown.
      </Alert>

      <StatisticsCards stats={stats} />

      <Stack spacing={3} sx={{ mt: 3 }}>
        <Card><CardContent><Typography variant="h6" gutterBottom>Create Facility Admin</Typography><CreateFacilityAdminForm loading={loading} onSubmit={onCreateAdmin} /></CardContent></Card>
        <Card><CardContent><Typography variant="h6" gutterBottom>Register Facility</Typography><RegisterFacilityForm loading={loading} onSubmit={onRegisterFacility} /></CardContent></Card>
        <Card><CardContent><Typography variant="h6" gutterBottom>Facility Admins</Typography><FacilityAdminsList rows={facilityAdmins} /></CardContent></Card>
        <Card><CardContent><Typography variant="h6" gutterBottom>Facilities</Typography><FacilitiesList rows={facilities} /></CardContent></Card>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Recent Activity</Typography>
            {audit.slice(0, 5).map((item) => (
              <Typography key={`${item.ts}-${item.action}`} variant="body2" sx={{ mb: 1 }}>
                {new Date(item.ts).toLocaleString()} - {item.action}
              </Typography>
            ))}
          </CardContent>
        </Card>
      </Stack>

      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast((s) => ({ ...s, open: false }))}>
        <Alert severity={toast.severity} variant="filled">{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
};
