import React from 'react';
import { Box, Card, CardContent, Typography, Stack, Button } from '@mui/material';
import { useUI } from '@/contexts/UIContext';

export const MyDoctors: React.FC = () => {
  const { language } = useUI();
  const isAmharic = language === 'am';

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        {isAmharic ? 'የእኔ ሐኪሞች' : 'My Doctors'}
      </Typography>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            {isAmharic ? 'ንቁ ፈቃድ ያላቸው ሐኪሞች' : 'Doctors with Active Consent'}
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">
              {isAmharic ? 'ዶ/ር ታደሰ በቀለ' : 'Dr. Tadesse Bekele'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isAmharic
                ? 'ጅማ ሆስፒታል - ጄኔራል ፕራክቲሽነር'
                : 'Jimma Hospital — General Practitioner'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isAmharic
                ? 'የፈቃድ ወሰን፡ ሙሉ ታሪክ | የሚያበቃበት፡ ፌብሩዋሪ 10፣ 2026'
                : 'Consent: Full History | Expires: Feb 10, 2026'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {isAmharic
                ? 'የመጨረሻ መዳረሻ፡ ዛሬ 10፡30 ጠዋት'
                : 'Last Access: Today 10:30 AM'}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small">
                {isAmharic ? 'የመዳረሻ መዝገብ ተመልከት' : 'View Access Log'}
              </Button>
              <Button size="small" variant="outlined" color="error">
                {isAmharic ? 'ሻርቅ' : 'Revoke'}
              </Button>
              <Button size="small" variant="outlined">
                {isAmharic ? 'አግኙ' : 'Contact'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

