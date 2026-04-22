import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Chip,
  Stack,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Home,
  BarChart,
  Business,
  MedicalServices,
  PersonAdd,
  Assignment,
  Settings,
  HelpOutline,
  Logout as LogoutIcon,
  ManageAccounts,
} from '@mui/icons-material';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useUI } from '@/contexts/UIContext';
import { useNavigate } from 'react-router-dom';
import { patientRegistrationService } from '@/features/admin/services/patientRegistrationService';
import { apiClient } from '@/services/apiClient';
import { professionalService } from '@/features/admin/services/professionalService';
import { institutionService } from '@/features/admin/services/institutionService';
import { ZonalDashboard } from '@/pages/admin/ZonalDashboard';
import { WoredaDashboard } from '@/pages/admin/WoredaDashboard';
import { CityDashboard } from '@/pages/admin/CityDashboard';
import { FacilityDashboard } from '@/pages/admin/FacilityDashboard';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { language } = useUI();
  const navigate = useNavigate();

  const isAmharic = language === 'am';
  const [tab, setTab] = React.useState(0);

  const adminName = user?.name || (isAmharic ? 'ዶ/ር ተስፋዬ አየለ' : 'Dr. Tesfaye Ayele');
  const facilityName = isAmharic ? 'ጅማ ሆስፒታል' : 'Jimma Hospital';

  // Admin hierarchy level (defaults to facility admin for existing demo)
  const adminLevel = (user as any)?.adminLevel || 'facility'; // 'zonal' | 'woreda' | 'city' | 'facility'
  if (adminLevel === 'zonal') {
    return <ZonalDashboard />;
  }
  if (adminLevel === 'woreda') {
    return <WoredaDashboard />;
  }
  if (adminLevel === 'city') {
    return <CityDashboard />;
  }
  if (adminLevel === 'facility') {
    return <FacilityDashboard />;
  }
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [confirmLogout, setConfirmLogout] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    severity: 'success' | 'info' | 'warning' | 'error';
    message: string;
  }>({ open: false, severity: 'info', message: '' });
  const [createLevel, setCreateLevel] = React.useState(
    adminLevel === 'zonal'
      ? 'woreda'
      : adminLevel === 'woreda' || adminLevel === 'city'
      ? 'facility'
      : 'none'
  );
  const [newAdminName, setNewAdminName] = React.useState('');
  const [newAdminEmail, setNewAdminEmail] = React.useState('');
  const [newAdminPhone, setNewAdminPhone] = React.useState('');
  const [isRegisteringPatient, setIsRegisteringPatient] = React.useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = React.useState(false);
  const [isCreatingFacility, setIsCreatingFacility] = React.useState(false);
  const [isCreatingProfessional, setIsCreatingProfessional] = React.useState(false);
  const [patientForm, setPatientForm] = React.useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    kebeleId: '',
    phone: '',
    email: '',
    woreda: '',
    kebele: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: '',
  });

  const roleLabel = adminLevel === 'zonal'
    ? (isAmharic ? 'የዞን አስተዳዳሪ' : 'Zonal Admin')
    : adminLevel === 'woreda'
    ? (isAmharic ? 'የወረዳ አስተዳዳሪ' : 'Woreda Admin')
    : adminLevel === 'city'
    ? (isAmharic ? 'የከተማ አስተዳዳሪ' : 'City Admin')
    : (isAmharic ? 'የተቋም አስተዳዳሪ' : 'Facility Admin');

  type AdminMenuItem = {
    id: string;
    en: string;
    am: string;
    icon: React.ReactNode;
    onClick: () => void;
    visible: boolean;
  };

  const adminMenuItems: AdminMenuItem[] = [
    { id: 'dashboard', en: 'Dashboard', am: 'ዳሽቦርድ', icon: <Home />, onClick: () => setTab(0), visible: true },
    { id: 'stats', en: 'Statistics', am: 'ስታቲስቲክስ', icon: <BarChart />, onClick: () => setTab(0), visible: true },
    {
      id: 'admins',
      en: 'Admin Management',
      am: 'የአስተዳዳሪ አስተዳደር',
      icon: <ManageAccounts />,
      onClick: () => setTab(1),
      visible: adminLevel !== 'facility',
    },
    {
      id: 'facilities',
      en: 'Facility Management',
      am: 'የተቋም አስተዳደር',
      icon: <Business />,
      onClick: () => setTab(2),
      visible: adminLevel === 'woreda' || adminLevel === 'city',
    },
    {
      id: 'professionals',
      en: 'Professional Management',
      am: 'የባለሙያ አስተዳደር',
      icon: <MedicalServices />,
      onClick: () => setTab(3),
      visible: adminLevel === 'facility',
    },
    {
      id: 'registration',
      en: 'Patient Registration',
      am: 'የታካሚ ምዝገባ',
      icon: <PersonAdd />,
      onClick: () => setTab(4),
      visible: adminLevel === 'facility',
    },
    {
      id: 'audit',
      en: 'Audit Logs',
      am: 'የኦዲት መዝገብ',
      icon: <Assignment />,
      onClick: () => setTab(6),
      visible: true,
    },
    { id: 'settings', en: 'Settings', am: 'ቅንብሮች', icon: <Settings />, onClick: () => setTab(5), visible: true },
    { id: 'help', en: 'Help', am: 'እርዳታ', icon: <HelpOutline />, onClick: () => navigate('/help'), visible: true },
    {
      id: 'logout',
      en: 'Logout',
      am: 'ውጣ',
      icon: <LogoutIcon />,
      onClick: () => setConfirmLogout(true),
      visible: true,
    },
  ];

  const handleMenuClick = (fn: () => void) => {
    setDrawerOpen(false);
    fn();
  };

  const toast = (severity: typeof snackbar.severity, message: string) => {
    setSnackbar({ open: true, severity, message });
  };

  const handleCreateAdmin = () => {
    if (adminLevel === 'facility') {
      toast('warning', isAmharic ? 'በዚህ ደረጃ ላይ አዲስ አስተዳዳሪ መፍጠር አይፈቀድም።' : 'Creating new admins is not allowed at this level.');
      return;
    }
    if (!createLevel || createLevel === 'none' || !newAdminName.trim() || !newAdminEmail.trim() || !newAdminPhone.trim()) {
      toast('warning', isAmharic ? 'እባክዎ ሁሉንም አስፈላጊ መረጃ ያስገቡ።' : 'Please fill all required fields.');
      return;
    }
    const role =
      createLevel === 'woreda' ? 'woreda_admin' : createLevel === 'city' ? 'city_admin' : 'facility_admin';
    const password = 'password';
    setIsCreatingAdmin(true);
    apiClient
      .post('/admin/users', {
        email: newAdminEmail.trim(),
        phone: newAdminPhone.trim(),
        fullName: newAdminName.trim(),
        role,
        password,
      })
      .then(() => {
        toast(
          'success',
          isAmharic ? `አስተዳዳሪ ተፈጥሯል። ፓስወርድ: ${password}` : `Admin created. Password: ${password}`,
        );
        setNewAdminName('');
        setNewAdminEmail('');
        setNewAdminPhone('');
      })
      .catch((e) => {
        toast('error', e instanceof Error ? e.message : 'Failed to create admin');
      })
      .finally(() => setIsCreatingAdmin(false));
  };

  const handleRegisterFacility = async () => {
    try {
      setIsCreatingFacility(true);
      // Minimal demo: create a facility under Jimma woreda seed id used in migrations
      const woredaId = '22222222-2222-2222-2222-222222222201';
      const created = await institutionService.createFacility({
        name: 'New Demo Facility',
        nameAm: 'አዲስ ዲሞ ተቋም',
        type: 'hospital',
        typeAm: 'ሆስፒታል',
        woredaId,
        licenseNumber: `DEMO-${Date.now()}`,
      });
      toast('success', isAmharic ? 'ተቋም ተመዝግቧል።' : 'Facility registered.');
      return created;
    } catch (e) {
      toast('error', e instanceof Error ? e.message : 'Failed to register facility');
    } finally {
      setIsCreatingFacility(false);
    }
  };

  const handleCreateProfessional = async () => {
    try {
      setIsCreatingProfessional(true);
      const password = 'password';
      await professionalService.createProfessional({
        email: `demo.pro.${Date.now()}@medilink.demo`,
        fullName: 'Demo Professional',
        role: 'doctor',
        licenseNumber: `MOH-${Date.now()}`,
        password,
      });
      toast('success', isAmharic ? `ባለሙያ ተፈጥሯል። ፓስወርድ: ${password}` : `Professional created. Password: ${password}`);
    } catch (e) {
      toast('error', e instanceof Error ? e.message : 'Failed to create professional');
    } finally {
      setIsCreatingProfessional(false);
    }
  };

  const handlePatientFormChange = (key: keyof typeof patientForm, value: string) => {
    setPatientForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetPatientForm = () => {
    setPatientForm({
      fullName: '',
      dateOfBirth: '',
      gender: '',
      kebeleId: '',
      phone: '',
      email: '',
      woreda: '',
      kebele: '',
      emergencyName: '',
      emergencyPhone: '',
      emergencyRelation: '',
    });
  };

  const handleRegisterPatient = async () => {
    if (!patientForm.fullName || !patientForm.phone || !patientForm.kebeleId || !patientForm.gender) {
      toast('warning', isAmharic ? 'እባክዎ አስፈላጊ መረጃዎችን ያስገቡ።' : 'Please fill all required patient fields.');
      return;
    }

    const safeName = patientForm.fullName.trim().toLowerCase().replace(/\s+/g, '.');
    const fallbackEmail = `${safeName || 'patient'}@medilink.local`;

    try {
      setIsRegisteringPatient(true);
      const result = await patientRegistrationService.registerPatient({
        fullName: patientForm.fullName.trim(),
        email: patientForm.email.trim() || fallbackEmail,
        phone: patientForm.phone.trim(),
        ethiopianHealthId: patientForm.kebeleId.trim(),
        dateOfBirth: patientForm.dateOfBirth || undefined,
        gender: patientForm.gender as 'male' | 'female' | 'other',
        encryptedData: {
          woreda: patientForm.woreda,
          kebele: patientForm.kebele,
          emergencyContact: {
            name: patientForm.emergencyName,
            phone: patientForm.emergencyPhone,
            relation: patientForm.emergencyRelation,
          },
        },
      });
      toast(
        'success',
        isAmharic
          ? `ታካሚ ተመዝግቧል። ጊዜያዊ ፓስወርድ: ${result?.tempPassword || 'sent'}`
          : `Patient registered. Temporary password: ${result?.tempPassword || 'sent'}`,
      );
      resetPatientForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to register patient';
      toast('error', message);
    } finally {
      setIsRegisteringPatient(false);
    }
  };

  React.useEffect(() => {
    // Open "System Settings" when header menu goes to /dashboard/profile
    // (Admin dashboard itself is mounted on /dashboard/*; menu links already point there.)
    // Keep default tab unless user explicitly navigates later.
  }, []);

  React.useEffect(() => {
    const openFromHeader = () => setDrawerOpen(true);
    window.addEventListener('open-role-dashboard-menu', openFromHeader);
    return () => window.removeEventListener('open-role-dashboard-menu', openFromHeader);
  }, []);

  // Keep select value valid when user/admin level arrives after initial render.
  React.useEffect(() => {
    if (adminLevel === 'zonal') {
      if (!['woreda', 'city'].includes(createLevel)) setCreateLevel('woreda');
      return;
    }
    if (adminLevel === 'woreda' || adminLevel === 'city') {
      if (createLevel !== 'facility') setCreateLevel('facility');
      return;
    }
    if (createLevel !== 'none') setCreateLevel('none');
  }, [adminLevel, createLevel]);

  return (
    <Box
      sx={{
        px: { xs: 1, md: 2 },
        pb: 6,
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        overflowX: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800} gutterBottom sx={{ mb: 0 }}>
          {isAmharic ? 'የአስተዳዳሪ ዳሽቦርድ' : 'ADMIN DASHBOARD'}
          {' · '}
          <span style={{ opacity: 0.8, fontSize: '0.9em' }}>
            {isAmharic ? `ደረጃ፡ ${adminLevel}` : `Level: ${adminLevel}`}
          </span>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isAmharic ? 'ገብተዋል፡ ' : 'Logged in as: '}
          <strong>{adminName}</strong>{' '}
          {isAmharic ? 'በ' : 'at '}
          <strong>{facilityName}</strong>
        </Typography>
      </Box>

      {/* Dashboard notices + topline stats: only on main statistics tab */}
      {tab === 0 && (
        <>
          {/* Important notice */}
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
              <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                {isAmharic ? '⚠️ በአካል መገኘት ያስፈልጋል' : '⚠️ IN-PERSON REGISTRATION REQUIRED'}
              </Typography>
              <Typography variant="body2">
                {isAmharic
                  ? 'ታካሚው ከዋናው መታወቂያ ሰነድ ጋር መገኘት አለበት።'
                  : 'Patient must be present with original ID document.'}
              </Typography>
              <Typography variant="body2">
                {isAmharic
                  ? 'ከመቀጠልዎ በፊት ማንነትን ያረጋግጡ።'
                  : 'Verify identity before proceeding.'}
              </Typography>
              <Typography variant="body2">
                {isAmharic
                  ? 'የመታወቂያ ሰነዱን ይቃኙ ወይም ፎቶ ያንሱ።'
                  : 'Scan or photograph the ID document.'}
              </Typography>
            </CardContent>
          </Card>

          {/* Core rule: admins never see patient medical data */}
          <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'info.light', bgcolor: 'info.50' }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={900} gutterBottom>
                {isAmharic ? '🔒 ዋና ደንብ' : '🔒 Core Rule'}
              </Typography>
              <Typography variant="body2">
                {isAmharic
                  ? 'ማንኛውም አስተዳዳሪ የታካሚ የሕክምና መረጃ ማየት አይችልም። የሚታዩ ቁጥሮች/ስታቲስቲክስ ብቻ ናቸው።'
                  : 'No admin can view patient medical data. Admin dashboards show anonymous statistics only.'}
              </Typography>
            </CardContent>
          </Card>

          {/* Quick anonymous stats */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={3}>
              <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    {isAmharic ? 'ጠቅላላ ታካሚዎች (ቁጥር)' : 'Total patients (count)'}
                  </Typography>
                  <Typography variant="h5" fontWeight={900}>
                    234,567+
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    {isAmharic ? 'ጠቅላላ ተቋማት' : 'Total facilities'}
                  </Typography>
                  <Typography variant="h5" fontWeight={900}>
                    86
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    {isAmharic ? 'ባለሙያዎች (ዶ/ር+ነርስ)' : 'Professionals (doctors+nurses)'}
                  </Typography>
                  <Typography variant="h5" fontWeight={900}>
                    1,240
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    {isAmharic ? 'የዛሬ ምዝገባዎች' : "Today's registrations"}
                  </Typography>
                  <Typography variant="h5" fontWeight={900}>
                    18
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {tab === 0 && (
        <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={900} gutterBottom>
              {isAmharic ? 'አጠቃላይ ስታቲስቲክስ (ስም የሌለው)' : 'Anonymous statistics overview'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isAmharic
                ? 'እዚህ ቦታ ውስጥ የዞን/ወረዳ/ከተማ/ተቋም መለኪያዎች ብቻ ይታያሉ (ስሞች ወይም መዝገቦች አይታዩም)።'
                : 'This area shows counts only (no patient names/records).'}
            </Typography>
          </CardContent>
        </Card>
      )}

      {tab === 6 && (
        <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={900} gutterBottom>
              {isAmharic ? 'የኦዲት መዝገብ (Mock)' : 'AUDIT LOGS (Mock)'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {isAmharic
                ? 'እዚህ ቦታ ላይ የተግባር መዝገቦች ይታያሉ (API እስኪገናኝ ድረስ ማስመሰል ነው).'
                : 'Entries below are mock data until API integration.'}
            </Typography>
            <TableContainer component={Paper} sx={{ overflowX: 'auto', maxWidth: '100%' }}>
              <Table size="small" sx={{ minWidth: 280 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>{isAmharic ? 'ጊዜ' : 'Time'}</TableCell>
                    <TableCell>{isAmharic ? 'ተግባር' : 'Action'}</TableCell>
                    <TableCell>{isAmharic ? 'ተጠቃሚ' : 'Actor'}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>2026-03-15 10:30</TableCell>
                    <TableCell>{isAmharic ? 'ታካሚ ምዝገባ' : 'Patient registration'}</TableCell>
                    <TableCell>{isAmharic ? 'ዶ/ር ተስፋዬ አየለ' : 'Dr. Tesfaye Ayele'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2026-03-15 09:15</TableCell>
                    <TableCell>{isAmharic ? 'ኦዲት ፍተሻ' : 'Audit check'}</TableCell>
                    <TableCell>{isAmharic ? 'ዶ/ር ተስፋዬ አየለ' : 'Dr. Tesfaye Ayele'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {tab === 1 && (
        <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={900} gutterBottom>
              {isAmharic ? 'የአስተዳዳሪ ስርዓት (Downward creation only)' : 'Admin hierarchy (downward creation only)'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {isAmharic
                ? 'እያንዳንዱ ደረጃ በታች ያለውን ደረጃ ብቻ ይፈጥራል።'
                : 'Each level can create ONLY the level directly below it.'}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                  {isAmharic ? 'አዲስ አስተዳዳሪ ፍጠር' : 'Create new admin'}
                </Typography>
                <Stack spacing={1}>
                  <TextField
                    fullWidth
                    select
                    label={isAmharic ? 'የሚፈጠር ደረጃ' : 'Create level'}
                    value={createLevel}
                    onChange={(e) => setCreateLevel(String(e.target.value))}
                    SelectProps={{ native: true }}
                  >
                    {adminLevel === 'zonal' && (
                      <>
                        <option value="woreda">{isAmharic ? 'የወረዳ አስተዳዳሪ' : 'Woreda Admin'}</option>
                        <option value="city">{isAmharic ? 'የከተማ አስተዳዳሪ' : 'City Admin'}</option>
                      </>
                    )}
                    {(adminLevel === 'woreda' || adminLevel === 'city') && (
                      <option value="facility">{isAmharic ? 'የተቋም አስተዳዳሪ' : 'Facility Admin'}</option>
                    )}
                    {adminLevel === 'facility' && (
                      <option value="none" disabled>
                        {isAmharic ? 'አይፈቀድም' : 'Not allowed'}
                      </option>
                    )}
                  </TextField>
                  <TextField fullWidth label={isAmharic ? 'ሙሉ ስም' : 'Full name'} value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} />
                  <TextField fullWidth label={isAmharic ? 'ኢሜይል' : 'Email'} value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} />
                  <TextField fullWidth label={isAmharic ? 'ስልክ' : 'Phone'} value={newAdminPhone} onChange={(e) => setNewAdminPhone(e.target.value)} />
                  <Button
                    variant="contained"
                    onClick={handleCreateAdmin}
                    disabled={adminLevel === 'facility' || isCreatingAdmin}
                  >
                    {isAmharic ? 'ፍጠር' : 'Create'}
                  </Button>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                  {isAmharic ? 'ማብራሪያ' : 'Explanation'}
                </Typography>
                <Stack spacing={0.75}>
                  <Typography variant="body2">- {isAmharic ? 'ዞን → ወረዳ/ከተማ' : 'Zonal → Woreda/City'}</Typography>
                  <Typography variant="body2">- {isAmharic ? 'ወረዳ/ከተማ → ተቋም' : 'Woreda/City → Facility'}</Typography>
                  <Typography variant="body2">- {isAmharic ? 'ተቋም → ዶ/ር/ነርስ/ታካሚ ምዝገባ' : 'Facility → Doctor/Nurse + Patient registration'}</Typography>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {tab === 2 && (
        <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={900} gutterBottom>
              {isAmharic ? 'ተቋም መመዝገብ / መቆጣጠር' : 'Facility registration / management'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {adminLevel === 'woreda' || adminLevel === 'city'
                ? isAmharic
                  ? 'ይህ ደረጃ አዲስ ተቋም መመዝገብ እና የተቋም አስተዳዳሪ መፍጠር ይችላል።'
                  : 'This level can register new facilities and create facility admins.'
                : isAmharic
                ? 'ይህ ክፍል በዚህ ደረጃ ላይ ሊገድብ ይችላል።'
                : 'This section may be restricted for your level.'}
            </Typography>
            <Button
              variant="contained"
              disabled={!(adminLevel === 'woreda' || adminLevel === 'city') || isCreatingFacility}
              onClick={handleRegisterFacility}
            >
              {isAmharic ? 'አዲስ ተቋም መመዝገብ' : 'Register New Facility'}
            </Button>
          </CardContent>
        </Card>
      )}

      {tab === 3 && (
        <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={900} gutterBottom>
              {isAmharic ? 'ዶ/ር እና ነርሶች መፍጠር' : 'Create doctors and nurses'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {adminLevel === 'facility'
                ? isAmharic
                  ? 'የተቋም አስተዳዳሪ ብቻ ዶ/ር/ነርስ መፍጠር ይችላል (ፈቃድ ማረጋገጥ ጨምሮ)።'
                  : 'Only facility admins can create doctor/nurse accounts (with license verification).'
                : isAmharic
                ? 'ይህ ክፍል ለተቋም አስተዳዳሪ ብቻ ነው።'
                : 'This section is for facility admins only.'}
            </Typography>
            <Button
              variant="contained"
              disabled={adminLevel !== 'facility' || isCreatingProfessional}
              onClick={handleCreateProfessional}
            >
              {isAmharic ? 'አዲስ ባለሙያ ፍጠር' : 'Create Professional'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tab 5: Patient Registration (facility admin only) */}
      {tab === 4 && adminLevel !== 'facility' && (
        <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={900}>
              {isAmharic ? 'ይህ ክፍል ለተቋም አስተዳዳሪ ብቻ ነው።' : 'This section is for Facility Admins only.'}
            </Typography>
          </CardContent>
        </Card>
      )}

      {tab === 4 && adminLevel === 'facility' && (
      <Grid container spacing={3}>
        {/* Registration form */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={800} gutterBottom>
                {isAmharic ? 'የታካሚ ምዝገባ ቅጽ' : 'Patient Registration Form'}
              </Typography>

              {/* Section 1: Patient Information */}
              <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 2, mb: 1 }}>
                {isAmharic ? 'የታካሚ መረጃ' : 'Patient Information'}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={isAmharic ? 'ሙሉ ስም' : 'Full Name'}
                    placeholder={
                      isAmharic ? 'የታካሚውን ሙሉ ስም ያስገቡ' : "Enter patient's full name"
                    }
                    required
                    value={patientForm.fullName}
                    onChange={(e) => handlePatientFormChange('fullName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    type="date"
                    label={isAmharic ? 'የትውልድ ቀን' : 'Date of Birth'}
                    InputLabelProps={{ shrink: true }}
                    required
                    value={patientForm.dateOfBirth}
                    onChange={(e) => handlePatientFormChange('dateOfBirth', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth required>
                    <InputLabel>{isAmharic ? 'ጾታ' : 'Gender'}</InputLabel>
                    <Select
                      label={isAmharic ? 'ጾታ' : 'Gender'}
                      value={patientForm.gender}
                      onChange={(e) => handlePatientFormChange('gender', String(e.target.value))}
                    >
                      <MenuItem value="male">
                        {isAmharic ? 'ወንድ' : 'Male'}
                      </MenuItem>
                      <MenuItem value="female">
                        {isAmharic ? 'ሴት' : 'Female'}
                      </MenuItem>
                      <MenuItem value="other">
                        {isAmharic ? 'ሌላ' : 'Other'}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={isAmharic ? 'የቀበሌ መታወቂያ ቁጥር' : 'Kebele ID Number'}
                    placeholder={
                      isAmharic
                        ? 'የቀበሌ መታወቂያ ቁጥር ያስገቡ'
                        : 'Enter Kebele ID number'
                    }
                    required
                    value={patientForm.kebeleId}
                    onChange={(e) => handlePatientFormChange('kebeleId', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      component="label"
                      variant="outlined"
                      fullWidth
                      sx={{ height: '100%' }}
                    >
                      {isAmharic ? '📎 ፋይል ስቀል (አማራጭ)' : '📎 UPLOAD FILE (OPTIONAL)'}
                      <input
                        type="file"
                        hidden
                        accept=".pdf,.txt,.doc,.docx,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      />
                    </Button>
                    <Typography variant="caption" color="text.secondary">
                      {isAmharic
                        ? 'አማራጭ ነው። የሚፈቀዱ ፋይሎች: PDF, Word, TXT'
                        : 'Optional. Allowed files: PDF, Word, TXT'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Section 2: Contact Information */}
              <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 3, mb: 1 }}>
                {isAmharic ? 'የመገናኛ መረጃ' : 'Contact Information'}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      label={isAmharic ? 'የስልክ ቁጥር' : 'Phone Number'}
                      placeholder="0911-234-567"
                      required
                      value={patientForm.phone}
                      onChange={(e) => handlePatientFormChange('phone', e.target.value)}
                    />
                    <Button variant="outlined">
                      {isAmharic ? 'ስልክ አረጋግጥ' : 'VERIFY PHONE'}
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="email"
                    label={isAmharic ? 'ኢሜይል' : 'Email'}
                    placeholder="patient@email.com"
                    value={patientForm.email}
                    onChange={(e) => handlePatientFormChange('email', e.target.value)}
                  />
                </Grid>
              </Grid>

              {/* Section 3: Location Information */}
              <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 3, mb: 1 }}>
                {isAmharic ? 'የአካባቢ መረጃ' : 'Location Information'}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label={isAmharic ? 'ክልል' : 'Region'}
                    value={isAmharic ? 'ኦሮሚያ' : 'Oromia'}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label={isAmharic ? 'ዞን' : 'Zone'}
                    value={isAmharic ? 'ጅማ' : 'Jimma'}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth required>
                    <InputLabel>{isAmharic ? 'ወረዳ' : 'Woreda'}</InputLabel>
                    <Select
                      label={isAmharic ? 'ወረዳ' : 'Woreda'}
                      value={patientForm.woreda}
                      onChange={(e) => handlePatientFormChange('woreda', String(e.target.value))}
                    >
                      <MenuItem value="jimma">{isAmharic ? 'ጅማ' : 'Jimma'}</MenuItem>
                      <MenuItem value="seka">{isAmharic ? 'ሰካ' : 'Seka'}</MenuItem>
                      <MenuItem value="gera">{isAmharic ? 'ጌራ' : 'Gera'}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label={isAmharic ? 'ቀበሌ' : 'Kebele'}
                    placeholder={
                      isAmharic
                        ? 'የቀበሌ ቁጥር/ስም ያስገቡ'
                        : 'Enter kebele number/name'
                    }
                    required
                    value={patientForm.kebele}
                    onChange={(e) => handlePatientFormChange('kebele', e.target.value)}
                  />
                </Grid>
              </Grid>

              {/* Section 4: Emergency Contact */}
              <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 3, mb: 1 }}>
                {isAmharic ? 'የድንገተኛ አደጋ መጠናኛ' : 'Emergency Contact'}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={isAmharic ? 'ስም' : 'Name'}
                    placeholder={isAmharic ? 'ሙሉ ስም' : 'Full name'}
                    required
                    value={patientForm.emergencyName}
                    onChange={(e) => handlePatientFormChange('emergencyName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={isAmharic ? 'ስልክ' : 'Phone'}
                    placeholder="0912-345-678"
                    required
                    value={patientForm.emergencyPhone}
                    onChange={(e) => handlePatientFormChange('emergencyPhone', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={isAmharic ? 'ዝምድና' : 'Relation'}
                    placeholder={
                      isAmharic
                        ? 'ለምሳሌ፡ ወንድም፣ እህት፣ እናት'
                        : 'e.g., Brother, Sister, Mother'
                    }
                    required
                    value={patientForm.emergencyRelation}
                    onChange={(e) => handlePatientFormChange('emergencyRelation', e.target.value)}
                  />
                </Grid>
              </Grid>

              {/* Duplicate check + form buttons */}
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                  justifyContent: 'space-between',
                  mt: 3,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() =>
                    toast(
                      'info',
                      isAmharic ? 'ተደጋጋሚነት ምርመራ እየተዘጋጀ ነው።' : 'Duplicate check will be connected next.',
                    )
                  }
                >
                  {isAmharic ? '🔍 ተደጋጋሚነት አረጋግጥ' : '🔍 CHECK FOR DUPLICATES'}
                </Button>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" color="inherit" onClick={resetPatientForm}>
                    {isAmharic ? '❌ ሰርዝ' : '❌ CANCEL'}
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleRegisterPatient}
                    disabled={isRegisteringPatient}
                  >
                    {isAmharic ? '✅ ታካሚ መዝግብ' : '✅ REGISTER PATIENT'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Side panel: confirmation + recent registrations */}
        <Grid item xs={12} lg={4}>
          {/* Mock confirmation card */}
          <Card
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'success.light',
              mb: 3,
            }}
          >
            <CardContent>
              <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                {isAmharic
                  ? '✅ ታካሚ በተሳካ ሁኔታ ተመዝግቧል'
                  : '✅ PATIENT REGISTERED SUCCESSFULLY'}
              </Typography>
              <Typography variant="body2">
                {isAmharic
                  ? 'የኢትዮጵያ የጤና መታወቂያ፡ ETH-2026-0315-AB123'
                  : 'Ethiopian Health ID: ETH-2026-0315-AB123'}
              </Typography>
              <Typography variant="body2">
                {isAmharic
                  ? 'የታካሚ ስም፡ አልማዝ ከበደ'
                  : 'Patient Name: Almaz Kebede'}
              </Typography>
              <Typography variant="body2">
                {isAmharic
                  ? 'የመዘገበው፡ ዶ/ር ተስፋዬ አየለ'
                  : 'Registered By: Dr. Tesfaye Ayele'}
              </Typography>
              <Typography variant="body2">
                {isAmharic ? 'ተቋም፡ ጅማ ሆስፒታል' : 'Facility: Jimma Hospital'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {isAmharic
                  ? 'ቀን/ሰዓት፡ 2026-03-15 10:30:00'
                  : 'Date/Time: 2026-03-15 10:30:00'}
              </Typography>

              <Chip
                size="small"
                color="primary"
                label={
                  isAmharic
                    ? 'ኤስኤምኤስ ከመግቢያ መረጃ ጋር ተልኳል'
                    : 'SMS sent with login credentials'
                }
                sx={{ mb: 1 }}
              />

              <Typography variant="body2">
                {isAmharic
                  ? 'ታካሚው መግባት የሚችልበት፡ portal.medilink.et'
                  : 'Patient can log in at: portal.medilink.et'}
              </Typography>
              <Typography variant="body2">
                {isAmharic
                  ? 'ጊዜያዊ የይለፍ ቃል፡ Temp@123456 (መጀመሪያ ጊዜ ማስተካከል አለበት)'
                  : 'Temporary password: Temp@123456 (must change on first login)'}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                <Button size="small" variant="outlined">
                  {isAmharic
                    ? '🖨️ የጤና መታወቂያ ካርድ አትም'
                    : '🖨️ PRINT HEALTH ID CARD'}
                </Button>
                <Button size="small" variant="outlined">
                  {isAmharic
                    ? '👤 የታካሚ መገለጫ ተመልከት'
                    : '👤 VIEW PATIENT PROFILE'}
                </Button>
                <Button size="small" variant="contained">
                  {isAmharic
                    ? '📋 አዲስ ታካሚ መዝግብ'
                    : '📋 REGISTER NEW PATIENT'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Recent registrations table */}
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                {isAmharic ? 'የቅርብ ጊዜ ምዝገባዎች' : 'Recent Registrations'}
              </Typography>
              <TableContainer component={Paper} sx={{ overflowX: 'auto', maxWidth: '100%' }}>
                <Table size="small" sx={{ minWidth: 520 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>{isAmharic ? 'ሰዓት' : 'Time'} </TableCell>
                      <TableCell>{isAmharic ? 'ስም' : 'Name'}</TableCell>
                      <TableCell>
                        {isAmharic ? 'የኢትዮጵያ የጤና መታወቂያ' : 'Ethiopian Health ID'}
                      </TableCell>
                      <TableCell>{isAmharic ? 'የመዘገበው' : 'Registered By'}</TableCell>
                      <TableCell>{isAmharic ? 'አትም' : 'Print'}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>10:30</TableCell>
                      <TableCell>
                        {isAmharic ? 'አልማዝ ከበደ' : 'Almaz Kebede'}
                      </TableCell>
                      <TableCell>ETH-2026-0315-AB123</TableCell>
                      <TableCell>
                        {isAmharic ? 'ዶ/ር ተስፋዬ አየለ' : 'Dr. Tesfaye Ayele'}
                      </TableCell>
                      <TableCell>🖨️</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>09:15</TableCell>
                      <TableCell>
                        {isAmharic ? 'ተክሌ ኃይሉ' : 'Tekle Hailu'}
                      </TableCell>
                      <TableCell>ETH-2026-0315-CD456</TableCell>
                      <TableCell>
                        {isAmharic ? 'ዶ/ር ተስፋዬ አየለ' : 'Dr. Tesfaye Ayele'}
                      </TableCell>
                      <TableCell>🖨️</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      )}

      {tab === 5 && (
        <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={900} gutterBottom>
              {isAmharic ? 'የአስተዳዳሪ ቅንብሮች' : 'Admin Settings'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {isAmharic
                ? 'የፓስወርድ ለውጥ፣ 2FA (አስፈላጊ ለአስተዳዳሪ)፣ ማስታወቂያዎች እና ሴሽን ጊዜ ገደብ ቅንብሮች እዚህ ይገኛሉ።'
                : 'Change password, 2FA (required for admins), notification preferences, and session timeout settings appear here.'}
            </Typography>
            <Stack spacing={1} sx={{ maxWidth: 520 }}>
              <TextField fullWidth label={isAmharic ? 'ስም' : 'Name'} defaultValue={adminName} />
              <TextField fullWidth label={isAmharic ? '2FA' : '2FA'} value={isAmharic ? 'አስፈላጊ (Required)' : 'Required'} disabled />
              <Button
                variant="contained"
                onClick={() =>
                  toast(
                    'success',
                    isAmharic ? 'ቅንብሮች ተቀምጠዋል።' : 'Settings saved successfully.',
                  )
                }
              >
                {isAmharic ? 'አስቀምጥ' : 'Save'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
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
            {adminName}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {roleLabel}
          </Typography>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />
        <List>
          {adminMenuItems.filter((item) => item.visible).map((item) => (
            <ListItemButton
              key={item.id}
              onClick={() => handleMenuClick(item.onClick)}
              sx={{
                py: 1.2,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
                '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.2)' },
              }}
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};


