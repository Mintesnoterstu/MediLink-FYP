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

export const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const dashboardServices = [
    
    {
      title: 'Health Records',
      description: 'View a consolidated history of your visits and labs.',
      cta: 'View sample',
      path: '/dashboard',
    },
    {
      title: 'Consent Management',
      description: 'Control who can access each record and when.',
      cta: 'Learn more',
      path: '/dashboard',
    },
    {
      title: 'Medication Tracker',
      description: 'Stay on schedule with dosage reminders.',
      cta: 'View demo',
      path: '/medications',
    },
    {
      title: 'Appointment Scheduler',
      description: 'Book and manage consultations with one view.',
      cta: 'Check schedule',
      path: '/appointments',
    },
    {
      title: 'Provider Connection',
      description: 'Find and connect with clinicians securely.',
      cta: 'Browse providers',
      path: '/about',
    },
  ];

  const publicResources = [
    {
      title: 'Disease Hub',
      description: 'Comprehensive disease information and prevention.',
      cta: 'Explore',
      path: '/diseases',
    },
    {
      title: 'Medicine Hub',
      description: 'Dosage, side effects, and Ethiopian availability.',
      cta: 'Explore',
      path: '/medicine-hub',
    },
    {
      title: 'AI Health Assistant',
      description: 'Context-aware support across every page.',
      cta: 'Chat now',
      path: '/about-ai',
    },
    {
      title: 'About MediLink',
      description: 'Mission, services, and clinical partnerships.',
      cta: 'Learn more',
      path: '/about',
    },
    {
      title: 'Health Library',
      description: 'Articles, guides, and prevention checklists.',
      cta: 'Read',
      path: '/symptom-checker',
    },
    {
      title: 'Emergency',
      description: 'Quick emergency contacts and guidance.',
      cta: 'Open',
      path: '/emergency',
    },
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
                  Platform at a glance
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { label: 'Diseases covered', value: '150+' },
                    { label: 'AI guidance accuracy', value: '87%' },
                    { label: 'Active users', value: '12,500+' },
                    { label: 'Traditional remedies verified', value: '85' },
                  ].map((item) => (
                    <Grid item xs={6} key={item.label}>
                      <Typography variant="h4" fontWeight={700}>
                        {item.value}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {item.label}
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
                      {service.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                      {service.description}
                    </Typography>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => navigate(service.path)}
                      sx={{ alignSelf: 'flex-start', fontWeight: 600, color: 'primary.main' }}
                    >
                      {service.cta}
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
                  <Typography variant="body2">• Explore disease and medicine hubs</Typography>
                  <Typography variant="body2">• Use the AI assistant for explanations</Typography>
                  <Typography variant="body2">• Switch languages instantly (English/Amharic)</Typography>
                  <Typography variant="body2">• Access emergency instructions at any time</Typography>
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
                      {resource.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                      {resource.description}
                    </Typography>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => navigate(resource.path)}
                      sx={{ alignSelf: 'flex-start', fontWeight: 600, color: 'primary.main' }}
                    >
                      {resource.cta}
                    </Button>
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

