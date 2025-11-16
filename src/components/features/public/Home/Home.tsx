import React, { useMemo } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Chip, Container, Avatar } from '@mui/material';
import { LocalHospital, Favorite, SmartToy, MenuBook, TrendingUp, People, VerifiedUser } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PrimaryButton, EmergencyButton } from '@/components/ui';
import { PlatformStats } from '@/types';

interface HomeProps {
  platformStats?: PlatformStats;
  seasonalTips?: string[];
  communityAlerts?: Array<{ id: string; title: string; message: string; severity: 'info' | 'warning' | 'error' }>;
}

export const Home: React.FC<HomeProps> = ({
  platformStats = {
    usersHelped: 12500,
    aiAccuracy: 87,
    diseasesCovered: 150,
    remediesVerified: 85,
    activeUsers: 3200,
  },
  seasonalTips = [],
  communityAlerts = [],
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const welcomeMessage = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('home.goodMorning');
    if (hour < 18) return t('home.goodAfternoon');
    return t('home.goodEvening');
  }, [t]);

  const quickAccessItems = [
    { icon: <LocalHospital />, title: t('home.diseaseLibrary'), path: '/diseases', color: 'primary' },
    { icon: <Favorite />, title: t('home.symptomChecker'), path: '/symptom-checker', color: 'error' },
    { icon: <MenuBook />, title: t('home.traditionalMedicine'), path: '/traditional-medicine', color: 'success' },
    { icon: <SmartToy />, title: t('home.aboutAI'), path: '/about-ai', color: 'info' },
  ];

  const roleBasedFeatures = useMemo(() => {
    if (!isAuthenticated) {
      return [
        { title: t('home.patientFeatures'), description: t('home.patientFeaturesDesc'), icon: <People /> },
        { title: t('home.providerFeatures'), description: t('home.providerFeaturesDesc'), icon: <VerifiedUser /> },
      ];
    }
    return user?.role === 'patient'
      ? [{ title: t('home.yourDashboard'), description: t('home.dashboardDesc'), icon: <TrendingUp /> }]
      : [{ title: t('home.providerDashboard'), description: t('home.providerDashboardDesc'), icon: <VerifiedUser /> }];
  }, [isAuthenticated, user, t]);

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container>
          <Typography variant="h2" component="h1" gutterBottom fontWeight={700}>
            {welcomeMessage}
          </Typography>
          <Typography variant="h4" component="h2" gutterBottom>
            {t('home.welcomeToMediLink')}
          </Typography>
          <Typography variant="h6" sx={{ mt: 2, opacity: 0.9 }}>
            {t('home.tagline')}
          </Typography>
          {!isAuthenticated && (
            <Box mt={4} display="flex" gap={2} justifyContent="center">
              <PrimaryButton
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
              >
                {t('auth.register')}
              </PrimaryButton>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                {t('auth.login')}
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      <Container sx={{ py: 6 }}>
        {/* Quick Access Grid */}
        <Typography variant="h4" component="h2" gutterBottom fontWeight={600} mb={4}>
          {t('home.quickAccess')}
        </Typography>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {quickAccessItems.map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.path}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
                onClick={() => navigate(item.path)}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Avatar sx={{ bgcolor: `${item.color}.main`, width: 64, height: 64, mx: 'auto', mb: 2 }}>
                    {item.icon}
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    {item.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Live Stats */}
        <Box sx={{ bgcolor: 'background.default', borderRadius: 2, p: 4, mb: 6 }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            {t('home.platformStats')}
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h3" fontWeight={700} color="primary.main">
                  {platformStats.usersHelped.toLocaleString()}+
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('home.usersHelped')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h3" fontWeight={700} color="success.main">
                  {platformStats.aiAccuracy}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('home.aiAccuracy')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h3" fontWeight={700} color="info.main">
                  {platformStats.diseasesCovered}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('home.diseasesCovered')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h3" fontWeight={700} color="warning.main">
                  {platformStats.remediesVerified}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('home.remediesVerified')}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Emergency Quick Access */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            {t('home.emergencyAccess')}
          </Typography>
          <EmergencyButton
            size="large"
            onClick={() => navigate('/emergency')}
            sx={{ mt: 2, px: 4, py: 2 }}
          >
            {t('emergency.trigger')}
          </EmergencyButton>
        </Box>

        {/* Role-Based Preview */}
        <Typography variant="h5" gutterBottom fontWeight={600} mb={3}>
          {t('home.exploreFeatures')}
        </Typography>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {roleBasedFeatures.map((feature, idx) => (
            <Grid item xs={12} md={6} key={idx}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>{feature.icon}</Avatar>
                    <Typography variant="h6" fontWeight={600}>
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                  {!isAuthenticated && (
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/register')}
                      sx={{ mt: 2 }}
                    >
                      {t('home.getStarted')}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Seasonal Health Tips */}
        {seasonalTips.length > 0 && (
          <Box sx={{ bgcolor: 'info.light', borderRadius: 2, p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              {t('home.seasonalTips')}
            </Typography>
            {seasonalTips.map((tip, idx) => (
              <Typography key={idx} variant="body2" sx={{ mb: 1 }}>
                • {tip}
              </Typography>
            ))}
          </Box>
        )}

        {/* Community Alerts */}
        {communityAlerts.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              {t('home.communityAlerts')}
            </Typography>
            {communityAlerts.map((alert) => (
              <Card key={alert.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip
                      label={alert.severity}
                      color={alert.severity === 'error' ? 'error' : alert.severity === 'warning' ? 'warning' : 'info'}
                      size="small"
                    />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {alert.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {alert.message}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

