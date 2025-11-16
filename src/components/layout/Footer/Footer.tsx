import React from 'react';
import { Box, Typography, Link, Container } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const Footer: React.FC = () => {
  const { t: _t } = useTranslation();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        mt: 'auto',
        backgroundColor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} MediLink. All rights reserved.
          </Typography>
          <Box display="flex" gap={3}>
            <Link href="#" color="text.secondary" underline="hover" variant="body2">
              Privacy Policy
            </Link>
            <Link href="#" color="text.secondary" underline="hover" variant="body2">
              Terms of Service
            </Link>
            <Link href="#" color="text.secondary" underline="hover" variant="body2">
              Contact
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

