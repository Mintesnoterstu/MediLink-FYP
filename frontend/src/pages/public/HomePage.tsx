import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Container,
  Stack,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
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
  ];

  const heroTitleText = isAmharic ? 'ሜድሊንክ — ደህንነቱ የተጠበቀየተጠበቀ፣ ባለሁለት ቋንቋ፣ በAI የታገዘ የጤና አገልግሎት' : 'MediLink — Secure, bilingual, AI-powered healthcare';
  const heroSubtitleText = isAmharic
    ? 'ለህዝብ መረጃ እና የግል ዳሽቦርድ የተዋሃደ መድረክ። ለታካሚዎች፣ ለአገልግሎት ሰጪዎች እና ለአስተዳዳሪዎች የተዘጋጀ።'
    : 'Access a unified platform for public resources and personal dashboards. Designed for patients, providers, and administrators.';
  const getStartedLabel = isAmharic ? 'ጀምር' : 'Get started';
  const learnMoreLabel = isAmharic ? 'ተጨማሪ ይወቁ' : 'Learn more';
  const jimmaGlanceLabel = isAmharic ? 'የጅማ ዞን በአጭሩ' : 'Jimma Zone at a Glance';
  const heroStats = [
    { label: 'Woredas', labelAm: 'ወረዳዎች', value: '10' },
    { label: 'Health Facilities', labelAm: 'የጤና ተቋማት', value: '86' },
    { label: 'Health Professionals', labelAm: 'የጤና ባለሙያዎች', value: '456' },
    { label: 'Patients', labelAm: 'ታካሚዎች', value: '234,567+' },
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
              <Typography
                variant="h2"
                component="h1"
                fontWeight={800}
                gutterBottom
                sx={{ fontSize: { xs: '2.2rem', sm: '2.6rem', md: '3.1rem' }, lineHeight: 1.15 }}
              >
                {heroTitleText}
              </Typography>
              <Typography
                variant="h5"
                sx={{ opacity: 0.92, mb: 4, maxWidth: 780, fontSize: { xs: '1.15rem', sm: '1.25rem', md: '1.35rem' } }}
              >
                {heroSubtitleText}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <PrimaryButton
                  size="large"
                  onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
                  sx={{ minWidth: 160 }}
                >
                  {getStartedLabel}
                </PrimaryButton>
                <SecondaryButton
                  size="large"
                  onClick={() => navigate('/about')}
                  sx={{ borderColor: 'white', color: 'white' }}
                >
                  {learnMoreLabel}
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
                  {jimmaGlanceLabel}
                </Typography>
                <Grid container spacing={2}>
                  {heroStats.map((item) => (
                    <Grid item xs={6} key={item.label}>
                      <Typography variant="h3" fontWeight={800} sx={{ fontSize: { xs: '1.8rem', sm: '2.1rem' } }}>
                        {item.value}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9, fontSize: { xs: '0.95rem', sm: '1rem' } }}>
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
        {/* Quick access to dashboard services - compact */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom sx={{ fontSize: { xs: '1.5rem', md: '1.8rem' } }}>
            {isAmharic ? 'ወደ ዳሽቦርድ አገልግሎቶች ፈጣን መዳረሻ' : 'Quick access to dashboard services'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2, maxWidth: 780 }}>
            {isAmharic
              ? 'የግል እና የሙያ መሣሪያዎች አጭር ግምገማ። ህዝባዊ ጎብኚዎች ሁሉንም መረጃ ማየት ይችላሉ፤ ለግል ባህሪያት ብቻ መግቢያ ያስፈልጋል።'
              : 'A concise overview of personal and professional tools. Public visitors can browse all resources; login is only required for personalized features.'}
          </Typography>
          <Grid container spacing={2}>
            {dashboardServices.map((service) => (
              <Grid item xs={12} sm={6} md={4} key={service.title}>
                <Card
                  sx={{
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    transition: 'all 0.25s ease',
                    '&:hover': { boxShadow: 4, borderColor: 'primary.main' },
                  }}
                >
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="subtitle1" fontWeight={800} color="primary.main">
                      {isAmharic && service.titleAm ? service.titleAm : service.title}
                    </Typography>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => navigate(service.path)}
                      sx={{ mt: 0.5, fontWeight: 700, color: 'primary.main', p: 0, minHeight: 0, fontSize: '0.95rem' }}
                    >
                      {isAmharic && service.ctaAm ? service.ctaAm : service.cta}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Login direction - single card */}
        <Box sx={{ mb: 6 }}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 3 }}>
              <Typography variant="h6" fontWeight={700}>
                {isAmharic ? 'ዳሽቦርድ አገልግሎቶችን ለማግኘት ይግቡ' : 'Access dashboard services'}
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                {isAmharic
                  ? 'የግል መዝገቦች፣ ፈቃድ አስተዳደር እና ቀጠሮዎች ለማግኘት ወደ መግቢያ ገጽ ይሂዱ።'
                  : 'Sign in to view your records, consent, and appointments.'}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <PrimaryButton onClick={() => navigate('/login')} sx={{ minWidth: 140 }}>
                  {isAmharic ? 'ግባ' : 'Go to Login'}
                </PrimaryButton>
                <SecondaryButton onClick={() => navigate('/register')} sx={{ minWidth: 140 }}>
                  {isAmharic ? 'መለያ ፍጠር' : 'Create account'}
                </SecondaryButton>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                * {isAmharic ? 'አዳዲስ ታካሚዎች በጤና ተቋም በመታወቂያ መመዝገብ አለባቸው' : 'New patients must register at a health facility with ID'}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Public resources */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1.35rem', sm: '1.6rem', md: '2rem' } }}>
            {isAmharic ? 'የህዝብ መረጃዎችን ያስሱ' : 'Explore our public resources'}
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

    </Box>
  );
};







