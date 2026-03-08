import React from 'react';
import {
  Box,
  Typography,
  Link,
  Container,
  Grid,
  IconButton,
  Stack,
  Chip,
} from '@mui/material';
import {
  Facebook,
  Telegram,
  YouTube,
  LinkedIn,
  LocalHospital,
  Shield,
  Lock,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '@/components/features/shared/LanguageSelector/LanguageSelector';

export const Footer: React.FC = () => {
  const { t: _t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        pt: 6,
        pb: 3,
        background: 'linear-gradient(135deg, #0F1724 0%, #1F2933 60%, #111827 100%)',
        color: 'rgba(255,255,255,0.9)',
        borderTop: '1px solid rgba(148, 163, 184, 0.4)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Quick Links
            </Typography>
            <Stack spacing={0.5}>
              <Link href="/" color="inherit" underline="hover" variant="body2">
                Home
              </Link>
              <Link href="/diseases" color="inherit" underline="hover" variant="body2">
                Disease Information
              </Link>
              <Link href="/medicine-hub" color="inherit" underline="hover" variant="body2">
                Medicine Hub
              </Link>
              <Link href="/about" color="inherit" underline="hover" variant="body2">
                About Us
              </Link>
            </Stack>
          </Grid>

          {/* Important Information */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Important Information
            </Typography>
            <Stack spacing={0.5}>
              <Link href="#" color="inherit" underline="hover" variant="body2">
                Privacy Policy
              </Link>
              <Link href="#" color="inherit" underline="hover" variant="body2">
                Terms of Service
              </Link>
              <Link href="#" color="inherit" underline="hover" variant="body2">
                Medical Disclaimer
              </Link>
              <Link href="#" color="inherit" underline="hover" variant="body2">
                Accessibility Statement
              </Link>
            </Stack>
          </Grid>

          {/* Contact & University */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Contact
            </Typography>
            <Stack spacing={0.5} mb={2}>
              <Typography variant="body2">Email: support@medilink.et</Typography>
              <Typography variant="body2">Emergency Hotline: 907</Typography>
              <Typography variant="body2">Addis Ababa, Ethiopia</Typography>
            </Stack>
            <Typography variant="subtitle2" fontWeight={700}>
              University Affiliation
            </Typography>
            <Typography variant="body2">A [University Name] Initiative</Typography>
          </Grid>

          {/* Social, Apps & Certifications */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Connect
            </Typography>
            <Box display="flex" gap={1}>
              <IconButton size="small" color="inherit">
                <Facebook fontSize="small" />
              </IconButton>
              <IconButton size="small" color="inherit">
                <Telegram fontSize="small" />
              </IconButton>
              <IconButton size="small" color="inherit">
                <YouTube fontSize="small" />
              </IconButton>
              <IconButton size="small" color="inherit">
                <LinkedIn fontSize="small" />
              </IconButton>
            </Box>

            <Box mt={2}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Mobile Apps
              </Typography>
              <Stack spacing={1}>
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 1,
                    bgcolor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(148, 163, 184, 0.6)',
                    fontSize: 12,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <LocalHospital fontSize="small" />
                  Google Play (coming)
                </Box>
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 1,
                    bgcolor: 'transparent',
                    border: '1px dashed rgba(148, 163, 184, 0.6)',
                    fontSize: 12,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    opacity: 0.7,
                  }}
                >
                  <LocalHospital fontSize="small" />
                  App Store (soon)
                </Box>
              </Stack>
            </Box>

            <Box mt={2}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Certifications
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  size="small"
                  icon={<LocalHospital />}
                  label="MoH Partnership"
                  sx={{ bgcolor: 'rgba(34,197,94,0.12)', color: '#BBF7D0' }}
                />
                <Chip
                  size="small"
                  icon={<Shield />}
                  label="Data Protection"
                  sx={{ bgcolor: 'rgba(59,130,246,0.15)', color: '#BFDBFE' }}
                />
                <Chip
                  size="small"
                  icon={<Lock />}
                  label="SSL Secure"
                  sx={{ bgcolor: 'rgba(148,163,184,0.25)', color: '#E5E7EB' }}
                />
              </Stack>
            </Box>
          </Grid>
        </Grid>

        {/* Bottom bar */}
        <Box
          mt={4}
          pt={2}
          borderTop="1px solid rgba(148, 163, 184, 0.4)"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={2}
        >
          <Box>
            <Typography variant="caption" display="block">
              © {year} MediLink Ethiopia. All rights reserved.
            </Typography>
            <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
              For educational purposes only. Always consult a licensed healthcare professional.
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Typography variant="caption">Language:</Typography>
            <LanguageSelector />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

