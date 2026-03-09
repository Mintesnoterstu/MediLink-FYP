import React from 'react';
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import { useUI } from '@/contexts/UIContext';

export const HealthSummary: React.FC = () => {
  const { language } = useUI();
  const isAmharic = language === 'am';

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        {isAmharic ? 'የጤና ማጠቃለያ' : 'Health Summary'}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
                {isAmharic ? 'የግል መረጃ' : 'Personal Information'}
              </Typography>
              <Typography variant="body2">
                {isAmharic ? 'ስም፡ አልማዝ ከበደ' : 'Name: Almaz Kebede'}
              </Typography>
              <Typography variant="body2">
                {isAmharic ? 'እድሜ፡ 35' : 'Age: 35'}
              </Typography>
              <Typography variant="body2">
                {isAmharic ? 'ጾታ፡ ሴት' : 'Gender: Female'}
              </Typography>
              <Typography variant="body2">
                {isAmharic ? 'የደም አይነት፡ O+' : 'Blood Type: O+'}
              </Typography>
              <Typography variant="body2">
                {isAmharic ? 'አለርጂዎች፡ ፔኒሲሊን' : 'Allergies: Penicillin'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
                {isAmharic ? 'የቅርብ ጊዜ የሕይወት ምልክቶች' : 'Recent Vitals'}
              </Typography>
              <Typography variant="body2">
                {isAmharic ? 'የደም ግፊት፡ 120/80 (ጃንዋሪ 10)' : 'Blood Pressure: 120/80 (Jan 10)'}
              </Typography>
              <Typography variant="body2">
                {isAmharic ? 'የልብ ምት፡ 72 bpm (ጃንዋሪ 10)' : 'Heart Rate: 72 bpm (Jan 10)'}
              </Typography>
              <Typography variant="body2">
                {isAmharic ? 'የሙቀት መጠን፡ 36.8°C (ጃንዋሪ 10)' : 'Temperature: 36.8°C (Jan 10)'}
              </Typography>
              <Typography variant="body2">
                {isAmharic ? 'ክብደት፡ 65 kg (ጃንዋሪ 10)' : 'Weight: 65 kg (Jan 10)'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
                {isAmharic ? 'ፈጣን ስታቲስቲክስ' : 'Quick Stats'}
              </Typography>
              <Typography variant="body2">
                {isAmharic ? 'ንቁ ፈቃዶች፡ 2 ሐኪሞች' : 'Active Consents: 2 doctors'}
              </Typography>
              <Typography variant="body2">
                {isAmharic ? 'የሚመጡ ቀጠሮዎች፡ ጃንዋሪ 20፣ 2026' : 'Upcoming Appointment: Jan 20, 2026'}
              </Typography>
              <Typography variant="body2">
                {isAmharic ? 'የመጨረሻ ጉብኝት፡ ጃንዋሪ 10፣ 2026' : 'Last Visit: Jan 10, 2026'}
              </Typography>
              <Typography variant="body2">
                {isAmharic ? 'በመጠባበቅ ላይ ያሉ ማጽደቆች፡ 1' : 'Pending Approvals: 1 (review needed)'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

