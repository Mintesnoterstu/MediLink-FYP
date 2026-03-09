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
          py: 4,
          textAlign: 'center',
        }}
      >
        <Container>
          <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
            {t('symptomChecker.title')}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            {t('symptomChecker.subtitle')}
          </Typography>
        </Container>
      </Box>

      <Container sx={{ py: 4 }}>
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

