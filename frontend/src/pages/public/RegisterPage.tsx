import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';

export const RegisterPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { language } = useUI();
  const navigate = useNavigate();
  const isAm = language === 'am';

  if (isLoading) return <div>Loading...</div>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  // Patients cannot self-register. Registration is done at a facility by a facility admin.
  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', p: 3 }}>
      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h5" fontWeight={900} gutterBottom>
            {isAm ? 'መመዝገብ' : 'Registration'} / {isAm ? 'Registration' : 'መመዝገብ'}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {isAm
              ? 'ታካሚዎች በራሳቸው መመዝገብ አይችሉም። መመዝገብ በጤና ተቋም ውስጥ በአካል ተገኝተው መታወቂያ ማረጋገጥ በኋላ ይከናወናል።'
              : 'Patients cannot self-register. Registration happens in-person at a health facility after ID verification.'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {isAm
              ? 'እባክዎ ወደ ቅርብ ጤና ተቋም ይሂዱ ወይም ከተቋም አስተዳዳሪ ጋር ያነጋግሩ።'
              : 'Please visit your nearest facility or contact a facility admin for registration.'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button variant="contained" onClick={() => navigate('/help')}>
              {isAm ? 'እርዳታ ይመልከቱ' : 'View Help'}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/login')}>
              {isAm ? 'ግባ' : 'Login'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

