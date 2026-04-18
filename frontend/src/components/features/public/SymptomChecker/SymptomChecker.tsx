import React from 'react';
import { Box, Typography, Container, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SymptomTracker } from '@/components/features/patient/SymptomTracker/SymptomTracker';
import { PrimaryButton } from '@/components/ui';

export const SymptomChecker: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <Box>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          py: { xs: 3, sm: 4 },
          px: { xs: 1.5, sm: 2 },
          textAlign: 'center',
        }}
      >
        <Container sx={{ px: { xs: 1, sm: 2 } }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            fontWeight={700}
            sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.75rem' }, lineHeight: 1.2 }}
          >
            {t('symptomChecker.title')}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            {t('symptomChecker.subtitle')}
          </Typography>
        </Container>
      </Box>

      <Container sx={{ py: { xs: 3, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        {!isAuthenticated && (
          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography variant="body2">
              {t('symptomChecker.guestMode')}
            </Typography>
            <Box mt={2}>
              <PrimaryButton
                variant="outlined"
                onClick={() => navigate('/register')}
                size="small"
              >
                {t('symptomChecker.registerForHistory')}
              </PrimaryButton>
            </Box>
          </Alert>
        )}

        <SymptomTracker />
      </Container>
    </Box>
  );
};

