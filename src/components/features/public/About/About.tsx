import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Container } from '@mui/material';
import { Storage, LocalHospital, School, People, Assignment, CalendarToday } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export const About: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4eb6f2 0%, #4A90E2 60%, #2C3E50 100%)',
          color: 'white',
          py: 6,
          textAlign: 'center',
        }}
      >
        <Container>
          <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
            {t('about.title')}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            {t('about.subtitle')}
          </Typography>
        </Container>
      </Box>

      <Container sx={{ py: 6 }}>
        {/* The Problem We Solve */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom fontWeight={600} textAlign="center" mb={4}>
            {t('about.theProblem')}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Storage color="primary" fontSize="large" />
                    <Typography variant="h6" fontWeight={600}>
                      {t('about.informationFragmentation')}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('about.informationFragmentationDesc')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <People color="primary" fontSize="large" />
                    <Typography variant="h6" fontWeight={600}>
                      {t('about.healthcareAccess')}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('about.healthcareAccessDesc')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <School color="primary" fontSize="large" />
                    <Typography variant="h6" fontWeight={600}>
                      {t('about.medicalAwareness')}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('about.medicalAwarenessDesc')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Our Solutions */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom fontWeight={600} textAlign="center" mb={4}>
            {t('about.ourSolutions')}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', bgcolor: 'primary.light' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Storage color="primary" fontSize="large" />
                    <Typography variant="h6" fontWeight={600}>
                      {t('about.unifiedHealthRecords')}
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {t('about.unifiedHealthRecordsDesc')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', bgcolor: 'success.light' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <School color="success" fontSize="large" />
                    <Typography variant="h6" fontWeight={600}>
                      {t('about.educationalResources')}
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {t('about.educationalResourcesDesc')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', bgcolor: 'info.light' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <CalendarToday color="info" fontSize="large" />
                    <Typography variant="h6" fontWeight={600}>
                      {t('about.coordinationTools')}
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {t('about.coordinationToolsDesc')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* How It Works */}
        <Box>
          <Typography variant="h4" component="h2" gutterBottom fontWeight={600} textAlign="center" mb={4}>
            {t('about.howItWorks')}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <People color="primary" fontSize="large" />
                    <Typography variant="h6" fontWeight={600}>
                      {t('about.forPatients')}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('about.forPatientsDesc')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <LocalHospital color="primary" fontSize="large" />
                    <Typography variant="h6" fontWeight={600}>
                      {t('about.forDoctors')}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('about.forDoctorsDesc')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Assignment color="primary" fontSize="large" />
                    <Typography variant="h6" fontWeight={600}>
                      {t('about.forHealthcareSystem')}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('about.forHealthcareSystemDesc')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

