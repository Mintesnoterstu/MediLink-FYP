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

export const ProfessionalDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { language } = useUI();
  const location = useLocation();
  const navigate = useNavigate();

  const isAmharic = language === 'am';
  const [tab, setTab] = React.useState(0);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [confirmLogout, setConfirmLogout] = React.useState(false);

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

  return (
    <Box>
      {/* Header */}
      <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
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

          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  {isAmharic
                    ? 'ታካሚ፡ አልማዝ ከበደ (ETH-2026-0315-AB123)'
                    : 'Patient: Almaz Kebede (ETH-2026-0315-AB123)'}
                </Typography>
                <Typography variant="body2">
                  {isAmharic ? 'ዕድሜ፡ 35 | ጾታ፡ ሴት' : 'Age: 35 | Gender: Female'}
                </Typography>
                <Typography variant="body2">
                  {isAmharic
                    ? 'ፈቃድ፡ ✅ ንቁ - ሙሉ ታሪክ'
                    : 'Consent: ✅ ACTIVE - Full History'}
                </Typography>
                <Typography variant="body2">
                  {isAmharic
                    ? 'የተሰጠበት፡ 2026-03-16 | የሚያበቃበት፡ 2026-04-16'
                    : 'Granted: 2026-03-16 | Expires: 2026-04-16'}
                </Typography>
                <Typography variant="body2">
                  {isAmharic
                    ? 'የመጨረሻ ጉብኝት፡ 2026-03-10'
                    : 'Last Visit: 2026-03-10'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {isAmharic
                    ? 'ምክንያት፡ ተከታታይ ሕክምና'
                    : 'Reason: Follow-up treatment'}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Button variant="contained" size="small">
                    {isAmharic ? 'ዳሽቦርድ ተመልከት' : 'VIEW DASHBOARD'}
                  </Button>
                  <Button variant="outlined" size="small">
                    {isAmharic ? 'ማስታወሻ ጨምር' : 'ADD NOTE'}
                  </Button>
                  <Button variant="outlined" size="small">
                    {isAmharic ? 'ላብራቶሪ አዘዝ' : 'ORDER LAB'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  {isAmharic
                    ? 'ታካሚ፡ ተክሌ ኃይሉ (ETH-2026-0315-CD456)'
                    : 'Patient: Tekle Hailu (ETH-2026-0315-CD456)'}
                </Typography>
                <Typography variant="body2">
                  {isAmharic ? 'ዕድሜ፡ 40 | ጾታ፡ ወንድ' : 'Age: 40 | Gender: Male'}
                </Typography>
                <Typography variant="body2">
                  {isAmharic
                    ? 'ፈቃድ፡ ✅ ንቁ - አለርጂዎች ብቻ'
                    : 'Consent: ✅ ACTIVE - Allergies Only'}
                </Typography>
                <Typography variant="body2">
                  {isAmharic
                    ? 'የተሰጠበት፡ 2026-03-15 | የሚያበቃበት፡ 2026-04-15'
                    : 'Granted: 2026-03-15 | Expires: 2026-04-15'}
                </Typography>
                <Typography variant="body2">
                  {isAmharic
                    ? 'የመጨረሻ ጉብኝት፡ 2026-03-15'
                    : 'Last Visit: 2026-03-15'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {isAmharic
                    ? 'ምክንያት፡ የአለርጂ ምልክቶች'
                    : 'Reason: Allergy symptoms'}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Button variant="contained" size="small">
                    {isAmharic ? 'ዳሽቦርድ ተመልከት' : 'VIEW DASHBOARD'}
                  </Button>
                  <Button variant="outlined" size="small">
                    {isAmharic ? 'ማስታወሻ ጨምር' : 'ADD NOTE'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 2: Search Patient */}
      {tab === 1 && (
        <Box>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
            {isAmharic ? 'ታካሚ ፈልግ' : 'SEARCH PATIENT'}
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                defaultValue="id"
                label={isAmharic ? 'በፍለጋ' : 'Search by'}
                SelectProps={{ native: true }}
              >
                <option value="name">{isAmharic ? 'ስም' : 'Name'}</option>
                <option value="id">
                  {isAmharic
                    ? 'የኢትዮጵያ የጤና መታወቂያ'
                    : 'Ethiopian Health ID'}
                </option>
                <option value="phone">
                  {isAmharic ? 'ስልክ' : 'Phone'}
                </option>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={isAmharic ? 'የፍለጋ ቃል' : 'Search Term'}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                sx={{ height: '100%' }}
              >
                {isAmharic ? 'ፈልግ' : 'SEARCH'}
              </Button>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    {isAmharic
                      ? 'አልማዝ ከበደ | ETH-2026-0315-AB123 | ጅማ ወረዳ'
                      : 'Almaz Kebede | ETH-2026-0315-AB123 | Jimma Woreda'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {isAmharic
                      ? 'የፈቃድ ሁኔታ፡ ✅ ንቁ (ሙሉ ታሪክ)'
                      : 'Consent Status: ✅ ACTIVE (Full History)'}
                  </Typography>
                  <Button variant="contained" size="small">
                    {isAmharic ? 'ዳሽቦርድ ተመልከት' : 'VIEW DASHBOARD'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    {isAmharic
                      ? 'ተክሌ ኃይሉ | ETH-2026-0315-CD456 | ሰካ ወረዳ'
                      : 'Tekle Hailu | ETH-2026-0315-CD456 | Seka Woreda'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {isAmharic
                      ? 'የፈቃድ ሁኔታ፡ ❌ ንቁ ፈቃድ የለም'
                      : 'Consent Status: ❌ NO ACTIVE CONSENT'}
                  </Typography>
                  <Button variant="contained" size="small">
                    {isAmharic ? 'ፈቃድ ጠይቅ' : 'REQUEST CONSENT'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Tab 3: Consent Requests */}
      {tab === 2 && (
        <Box>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
            {isAmharic
              ? 'በመጠባበቅ ላይ ያሉ የፈቃድ ጥያቄዎች (2)'
              : 'PENDING CONSENT REQUESTS (2)'}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    {isAmharic
                      ? 'ታካሚ፡ አበበች መሐመድ | ETH-2026-0315-EF789'
                      : 'Patient: Abebech Mohammed | ETH-2026-0315-EF789'}
                  </Typography>
                  <Typography variant="body2">
                    {isAmharic
                      ? 'የተጠየቀበት፡ 2026-03-16 | ምክንያት፡ የመጀመሪያ ምክክር'
                      : 'Requested: 2026-03-16 | Reason: Initial consultation'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {isAmharic
                      ? 'ሁኔታ፡ የታካሚ ማጽደቅ በመጠባበቅ ላይ'
                      : 'Status: Waiting for patient approval'}
                  </Typography>
                  <Button variant="outlined" size="small">
                    {isAmharic ? 'ጥያቄ ሰርዝ' : 'CANCEL REQUEST'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

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
                <Button variant="contained" size="small">
                  {isAmharic ? 'ታካሚ ዳሽቦርድ ክፈት' : 'OPEN PATIENT DASHBOARD'}
                </Button>
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
                  <TextField fullWidth label={isAmharic ? 'ስም' : 'Name'} defaultValue={name} />
                  <TextField
                    fullWidth
                    label={isAmharic ? 'ስፔሻላይዜሽን' : 'Specialization'}
                    defaultValue={isAmharic ? 'አጠቃላይ ሕክምና' : 'General Practice'}
                  />
                  <TextField
                    fullWidth
                    label={isAmharic ? 'ዲፓርትመንት' : 'Department'}
                    defaultValue={isAmharic ? 'ውጪ ታካሚ' : 'Outpatient'}
                  />
                  <TextField fullWidth label={isAmharic ? 'ፈቃድ ቁጥር (read-only)' : 'License (read-only)'} value="MOH-12345" disabled />
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
                    <InputLabel>{isAmharic ? 'የምክክር ጊዜ (ደቂቃ)' : 'Consultation duration (min)'}</InputLabel>
                    <Select label={isAmharic ? 'የምክክር ጊዜ (ደቂቃ)' : 'Consultation duration (min)'} defaultValue={30}>
                      <MenuItem value={15}>15</MenuItem>
                      <MenuItem value={30}>30</MenuItem>
                      <MenuItem value={45}>45</MenuItem>
                      <MenuItem value={60}>60</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label={isAmharic ? 'የስራ ሰዓት (ምሳሌ)' : 'Working hours (example)'}
                    defaultValue={isAmharic ? 'ሰኞ-አርብ 08:00-17:00' : 'Mon–Fri 08:00–17:00'}
                  />
                  <Divider />
                  <Button variant="contained">{isAmharic ? 'አስቀምጥ' : 'Save'}</Button>
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


