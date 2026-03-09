import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  TextField,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';

export const ProfessionalDashboard: React.FC = () => {
  const { user } = useAuth();
  const { language } = useUI();

  const isAmharic = language === 'am';
  const [tab, setTab] = React.useState(0);

  const handleTabChange = (_: React.SyntheticEvent, value: number) => {
    setTab(value);
  };

  const name = user?.name || (isAmharic ? 'ዶ/ር ታደሰ በቀለ' : 'Dr. Tadesse Bekele');

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

      {/* Navigation tabs */}
      <Tabs
        value={tab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        <Tab label={isAmharic ? 'የእኔ ታካሚዎች' : 'MY PATIENTS'} />
        <Tab label={isAmharic ? 'ታካሚ ፈልግ' : 'SEARCH PATIENT'} />
        <Tab label={isAmharic ? 'የፈቃድ ጥያቄዎች' : 'CONSENT REQUESTS'} />
      </Tabs>

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
    </Box>
  );
};


