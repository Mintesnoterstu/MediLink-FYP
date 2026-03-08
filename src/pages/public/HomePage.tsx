import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Divider,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton, SecondaryButton, EmergencyButton } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { language } = useUI();
  const isAmharic = language === 'am';

  const dashboardServices = [
    {
      title: 'AI Symptom Checker',
      titleAm: 'AI የምልክት መፈተሻ',
      description: 'Preliminary guidance for common conditions',
      descriptionAm: 'ለተለመዱ በሽታዎች የመጀመሪያ ደረጃ መረጃ',
      cta: 'Try now',
      ctaAm: 'አሁን ይሞክሩ',
      path: '/symptom-checker',
    },
    {
      title: 'Health Records',
      titleAm: 'የጤና መዝገቦች',
      description: 'View your complete medical history (view only)',
      descriptionAm: 'የተሟላ የሕክምና ታሪክዎን ይመልከቱ (ለማየት ብቻ)',
      cta: 'View sample',
      ctaAm: 'ናሙና ይመልከቱ',
      path: '/dashboard',
    },
    {
      title: 'Consent Management',
      titleAm: 'የፈቃድ አስተዳደር',
      description: 'You control which doctors see your data - grant or revoke anytime',
      descriptionAm: 'የትኞቹ ሐኪሞች መረጃዎን ማየት እንደሚችሉ እርስዎ ይቆጣጠራሉ - በማንኛውም ጊዜ ፈቃድ ይስጡ ወይም ይሻሩ',
      cta: 'Learn more',
      ctaAm: 'ተጨማሪ ይወቁ',
      path: '/dashboard',
    },
    {
      title: 'Medication Tracker',
      titleAm: 'የመድሀኒት ተከታታይ',
      description: 'Track prescriptions and get reminders',
      descriptionAm: 'የታዘዙ መድሀኒቶችን ይከታተሉ እና ማሳሰቢያ ይቀበሉ',
      cta: 'View demo',
      ctaAm: 'ናሙና ይመልከቱ',
      path: '/medications',
    },
    {
      title: 'Appointment Scheduler',
      titleAm: 'የቀጠሮ አስተካካይ',
      description: 'Schedule appointments with providers',
      descriptionAm: 'ከአገልግሎት ሰጪዎች ጋር ቀጠሮ ይያዙ',
      cta: 'Check schedule',
      ctaAm: 'መርሃግብር ይፈትሹ',
      path: '/appointments',
    },
    {
      title: 'Provider Connection',
      titleAm: 'ከአገልግሎት ሰጪ ግንኙነት',
      description: 'Connect with doctors (with your consent)',
      descriptionAm: 'ከሐኪሞች ጋር ይገናኙ (በፈቃድዎ)',
      cta: 'Browse providers',
      ctaAm: 'አገልግሎት ሰጪዎችን ያስሱ',
      path: '/about',
    },
  ];

  const publicResources = [
    {
      title: 'Disease Hub',
      titleAm: 'የበሽታ መድረክ',
      description: 'Information on common diseases (8 featured)',
      descriptionAm: 'ስለ ተለመዱ በሽታዎች መረጃ (8 የተለዩ)',
      cta: 'Explore',
      ctaAm: 'ያስሱ',
      path: '/diseases',
    },
    {
      title: 'Medicine Hub',
      titleAm: 'የመድሀኒት መድረክ',
      description: 'Common OTC medicines and traditional remedies',
      descriptionAm: 'የተለመዱ ያለሐኪም የሚገዙ መድሀኒቶች እና ባህላዊ መፍትሄዎች',
      cta: 'Explore',
      ctaAm: 'ያስሱ',
      path: '/medicines',
    },
    {
      title: 'AI Health Assistant',
      titleAm: 'AI የጤና ረዳት',
      description: 'Ask health questions (educational only)',
      descriptionAm: 'የጤና ጥያቄዎችን ይጠይቁ (ለትምህርት ብቻ)',
      cta: 'Chat now',
      ctaAm: 'አሁን ይውዩ',
      path: '/about',
    },
    {
      title: 'About MediLink',
      titleAm: 'ስለ ሜድሊንክ',
      description: 'Learn how MediLink works for patients and doctors',
      descriptionAm: 'ሜድሊንክ ለታካሚዎች እና ለሐኪሞች እንዴት እንደሚሠራ ይወቁ',
      cta: 'Learn more',
      ctaAm: 'ተጨማሪ ይወቁ',
      path: '/about',
    },
    {
      title: 'Health Library',
      titleAm: 'የጤና ቤተ-መጻሕፍት',
      description: 'Articles on prevention, nutrition, and wellness',
      descriptionAm: 'ስለ መከላከል፣ አመጋገብ እና ጤና መጣጠን መጣጥፎች',
      cta: 'Read',
      ctaAm: 'ያንብቡ',
      path: '/symptom-checker',
    },
    {
      title: 'Emergency',
      titleAm: 'ድንገተኛ',
      description: 'Quick access to emergency contacts and hotlines',
      descriptionAm: 'ፈጣን የድንገተኛ መጠናኛዎች እና የስልክ ቁጥሮች',
      cta: 'Open',
      ctaAm: 'ክፈት',
      path: '/emergency',
    },
  ];

  const heroStats = [
    { label: 'Woredas', labelAm: 'ወረዳዎች', value: '10' },
    { label: 'Health Facilities', labelAm: 'የጤና ተቋማት', value: '86' },
    { label: 'Health Professionals', labelAm: 'የጤና ባለሙያዎች', value: '456' },
    { label: 'Patients', labelAm: 'ታካሚዎች', value: '234,567+' },
  ];

  const publicBullets = [
    { en: 'Explore disease and medicine hubs', am: 'የበሽታ እና መድሀኒት መድረኮችን ያስሱ' },
    { en: 'Learn about common diseases and their symptoms', am: 'ስለ ተለመዱ በሽታዎች እና ምልክቶቻቸው ይማሩ' },
    { en: 'Switch between English and Amharic', am: 'በእንግሊዝኛ እና በአማርኛ መካከል ይቀያይሩ' },
    { en: 'Access emergency information 24/7', am: 'የድንገተኛ መረጃን 24/7 ያግኙ' },
  ];

  const dataControlBullets = [
    { en: 'Only doctors with your consent can view your records', am: 'የእርስዎን ፈቃድ ያላቸው ሐኪሞች ብቻ መዝገቦችዎን ማየት ይችላሉ' },
    { en: 'You can grant or revoke access anytime', am: 'በማንኛውም ጊዜ ፈቃድ መስጠት ወይም መሻር ይችላሉ' },
    { en: 'Every access is logged and visible to you', am: 'እያንዳንዱ መዳረሻ ተመዝግቦ ለእርስዎ ይታያል' },
    { en: 'Any doctor update requires your approval', am: 'ማንኛውም የሐኪም ዝማኔ ማጽደቅዎን ይጠይቃል' },
  ];

  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4eb6f2 0%, #4A90E2 60%, #2C3E50 100%)',
          color: 'white',
          py: { xs: 8, md: 10 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
                MediLink — Secure, bilingual, AI-powered healthcare
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 4, maxWidth: 720 }}>
                Access a unified platform for public resources and personal dashboards. Designed for patients, providers, and administrators.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <PrimaryButton
                  size="large"
                  onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
                  sx={{ minWidth: 160 }}
                >
                  Get started
                </PrimaryButton>
                <SecondaryButton
                  size="large"
                  onClick={() => navigate('/about')}
                  sx={{ borderColor: 'white', color: 'white' }}
                >
                  Learn more
                </SecondaryButton>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  bgcolor: 'rgba(255,255,255,0.12)',
                  borderRadius: 3,
                  p: 3,
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: 'white',
                }}
              >
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {isAmharic ? 'የጅማ ዞን በአጭሩ' : 'Jimma Zone at a Glance'}
                </Typography>
                <Grid container spacing={2}>
                  {heroStats.map((item) => (
                    <Grid item xs={6} key={item.label}>
                      <Typography variant="h4" fontWeight={700}>
                        {item.value}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {isAmharic ? item.labelAm : item.label}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Quick access dashboard preview */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Quick access to dashboard services
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 780 }}>
            A concise overview of personal and professional tools. Public visitors can browse all resources; authentication is only required for personalized features.
          </Typography>
          <Grid container spacing={3}>
            {dashboardServices.map((service) => (
              <Grid item xs={12} sm={6} md={4} key={service.title}>
                <Card
                  sx={{
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      boxShadow: 6,
                      borderColor: 'primary.main',
                      transform: 'translateY(-6px)',
                    },
                  }}
                >
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                      {isAmharic && service.titleAm ? service.titleAm : service.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                      {isAmharic && service.descriptionAm ? service.descriptionAm : service.description}
                    </Typography>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => navigate(service.path)}
                      sx={{ alignSelf: 'flex-start', fontWeight: 600, color: 'primary.main' }}
                    >
                      {isAmharic && service.ctaAm ? service.ctaAm : service.cta}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Access gateway */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h5" fontWeight={700}>
                  Access your dashboard
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Secure login for personal features. Public resources remain open without authentication.
                </Typography>
                <Stack spacing={2}>
                  <TextField label="Email" type="email" fullWidth />
                  <TextField label="PIN or Password" type="password" fullWidth />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <PrimaryButton fullWidth onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}>
                      Login
                    </PrimaryButton>
                    <SecondaryButton fullWidth onClick={() => navigate('/register')}>
                      Create account
                    </SecondaryButton>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    * {isAmharic ? 'አዳዲስ ታካሚዎች በመታወቂያ በጤና ተቋም መመዝገብ አለባቸው' : 'New patients must register at a health facility with ID'}
                  </Typography>
                  <Stack direction="row" justifyContent="space-between">
                    <Button size="small" variant="text" onClick={() => navigate('/login')}>
                      Show PIN pad
                    </Button>
                    <Button size="small" variant="text" onClick={() => navigate('/login')}>
                      Forgot PIN?
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Public resources remain open
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  You can review diseases, medicines, and health guidance without logging in. Sign in only when you want to save or track personal data.
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={1.5}>
                  {publicBullets.map((bullet) => (
                    <Typography key={bullet.en} variant="body2">
                      {isAmharic ? `• ${bullet.am}` : `• ${bullet.en}`}
                    </Typography>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Public resources */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Explore our public resources
          </Typography>
          <Grid container spacing={3}>
            {publicResources.map((resource) => (
              <Grid item xs={12} sm={6} md={4} key={resource.title}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      boxShadow: 6,
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {isAmharic && resource.titleAm ? resource.titleAm : resource.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                      {isAmharic && resource.descriptionAm ? resource.descriptionAm : resource.description}
                    </Typography>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => navigate(resource.path)}
                      sx={{ alignSelf: 'flex-start', fontWeight: 600, color: 'primary.main' }}
                    >
                      {isAmharic && resource.ctaAm ? resource.ctaAm : resource.cta}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* You Control Your Data */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {isAmharic ? 'መረጃዎን ይቆጣጠራሉ' : 'You Control Your Data'}
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {dataControlBullets.map((bullet) => (
              <Grid item xs={12} sm={6} key={bullet.en}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.default',
                  }}
                >
                  <CardContent>
                    <Typography variant="body2">
                      {isAmharic ? bullet.am : bullet.en}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      {/* Fixed emergency access */}
      <Box sx={{ position: 'fixed', right: 24, bottom: 24, zIndex: 1200 }}>
        <EmergencyButton onClick={() => navigate('/emergency')} />
      </Box>
    </Box>
  );
};







