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
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [confirmLogout, setConfirmLogout] = React.useState(false);

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
      onClick: () => setTab(0),
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

  return (
    <Box>
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
                  <FormControl fullWidth>
                    <InputLabel>{isAmharic ? 'የሚፈጠር ደረጃ' : 'Create level'}</InputLabel>
                    <Select
                      label={isAmharic ? 'የሚፈጠር ደረጃ' : 'Create level'}
                      defaultValue={
                        adminLevel === 'zonal'
                          ? 'woreda'
                          : adminLevel === 'woreda' || adminLevel === 'city'
                          ? 'facility'
                          : 'none'
                      }
                    >
                      {adminLevel === 'zonal' && (
                        <>
                          <MenuItem value="woreda">{isAmharic ? 'የወረዳ አስተዳዳሪ' : 'Woreda Admin'}</MenuItem>
                          <MenuItem value="city">{isAmharic ? 'የከተማ አስተዳዳሪ' : 'City Admin'}</MenuItem>
                        </>
                      )}
                      {(adminLevel === 'woreda' || adminLevel === 'city') && (
                        <MenuItem value="facility">{isAmharic ? 'የተቋም አስተዳዳሪ' : 'Facility Admin'}</MenuItem>
                      )}
                      {adminLevel === 'facility' && (
                        <MenuItem value="none" disabled>
                          {isAmharic ? 'አይፈቀድም' : 'Not allowed'}
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                  <TextField fullWidth label={isAmharic ? 'ሙሉ ስም' : 'Full name'} />
                  <TextField fullWidth label={isAmharic ? 'ኢሜይል' : 'Email'} />
                  <TextField fullWidth label={isAmharic ? 'ስልክ' : 'Phone'} />
                  <Button variant="contained" disabled={adminLevel === 'facility'}>
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
            <Button variant="contained" disabled={!(adminLevel === 'woreda' || adminLevel === 'city')}>
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
            <Button variant="contained" disabled={adminLevel !== 'facility'}>
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
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    type="date"
                    label={isAmharic ? 'የትውልድ ቀን' : 'Date of Birth'}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth required>
                    <InputLabel>{isAmharic ? 'ጾታ' : 'Gender'}</InputLabel>
                    <Select label={isAmharic ? 'ጾታ' : 'Gender'} defaultValue="">
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
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Button variant="outlined" fullWidth sx={{ height: '100%' }}>
                    {isAmharic ? '📎 ፊት/ኋላ ስቀል' : '📎 UPLOAD FRONT/BACK'}
                  </Button>
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
                    <Select label={isAmharic ? 'ወረዳ' : 'Woreda'} defaultValue="">
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
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={isAmharic ? 'ስልክ' : 'Phone'}
                    placeholder="0912-345-678"
                    required
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
                <Button variant="outlined">
                  {isAmharic ? '🔍 ተደጋጋሚነት አረጋግጥ' : '🔍 CHECK FOR DUPLICATES'}
                </Button>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" color="inherit">
                    {isAmharic ? '❌ ሰርዝ' : '❌ CANCEL'}
                  </Button>
                  <Button variant="contained" color="primary">
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
              <Table component={Paper} size="small">
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
              <Button variant="contained">{isAmharic ? 'አስቀምጥ' : 'Save'}</Button>
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
    </Box>
  );
};


