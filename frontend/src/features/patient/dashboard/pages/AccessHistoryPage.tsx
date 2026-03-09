import React from 'react';
import { Box, Typography, Card, CardContent, Table, TableHead, TableRow, TableCell, TableBody, Stack, Button, Chip } from '@mui/material';
import { useUI } from '@/contexts/UIContext';

export const AccessHistoryPage: React.FC = () => {
  const { language } = useUI();
  const isAmharic = language === 'am';

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        {isAmharic ? 'የመዳረሻ ታሪክ' : 'ACCESS HISTORY'}
      </Typography>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            {isAmharic ? 'የመዳረሻ መዝገብ' : 'Access Log'}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{isAmharic ? 'ቀን እና ሰዓት' : 'Date & Time'}</TableCell>
                <TableCell>{isAmharic ? 'የተደረሰበት ሰው' : 'Accessed By'}</TableCell>
                <TableCell>{isAmharic ? 'ሚና' : 'Role'}</TableCell>
                <TableCell>{isAmharic ? 'ተቋም' : 'Facility'}</TableCell>
                <TableCell>{isAmharic ? 'የተደረሰበት መረጃ' : 'Data Accessed'}</TableCell>
                <TableCell>{isAmharic ? 'ድርጊት' : 'Action'}</TableCell>
                <TableCell>{isAmharic ? 'ሁኔታ' : 'Status'}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                [
                  'Today, 10:30 AM',
                  'ዛሬ፣ ከጠዋቱ 10፡30',
                  'Dr. Tadesse Bekele / ዶ/ር ታደሰ በቀለ',
                  'Physician / ሐኪም',
                  'Jimma Hospital / ጅማ ሆስፒታል',
                  'Allergies / አለርጂዎች',
                  'View / ተመልክቷል',
                  'Active Consent / ንቁ ፈቃድ',
                ],
                [
                  'Today, 10:30 AM',
                  'ዛሬ፣ ከጠዋቱ 10፡30',
                  'Dr. Tadesse Bekele / ዶ/ር ታደሰ በቀለ',
                  'Physician / ሐኪም',
                  'Jimma Hospital / ጅማ ሆስፒታል',
                  'Medications / መድሀኒቶች',
                  'View / ተመልክቷል',
                  'Active Consent / ንቁ ፈቃድ',
                ],
                [
                  'Yesterday, 2:30 PM',
                  'ትናንት፣ ከሰዓት 2፡30',
                  'Dr. Abebech Mohammed / ዶ/ር አበበች መሐመድ',
                  'Physician / ሐኪም',
                  'Bishoftu Health Center / ቢሾፍቱ ጤና ጣቢያ',
                  'Allergies / አለርጂዎች',
                  'View / ተመልክቷል',
                  'Active Consent / ንቁ ፈቃድ',
                ],
                [
                  'Jan 14, 2026, 3:45 PM',
                  'ጃንዋሪ 14፣ 2026፣ ከሰዓት 3፡45',
                  'Dr. Biruk Alemu / ዶ/ር ብሩክ አለሙ',
                  'Physician / ሐኪም',
                  'Jimma Hospital / ጅማ ሆስፒታል',
                  'Full Record / ሙሉ መዝገብ',
                  'Attempted (No Consent) / ሞክሯል (ፈቃድ የለም)',
                  'DENIED - No Consent / ተከልክሏል - ፈቃድ የለም',
                ],
                [
                  'Jan 10, 2026, 9:30 AM',
                  'ጃንዋሪ 10፣ 2026፣ ከጠዋቱ 9፡30',
                  'You / እርስዎ',
                  'Patient / ታካሚ',
                  '-',
                  'Your Dashboard / የእርስዎ ዳሽቦርድ',
                  'Login / ገብተዋል',
                  'Successful / ተሳክቷል',
                ],
              ].map((r) => (
                <TableRow key={r[0] + r[2] + r[5]}>
                  <TableCell>{isAmharic ? r[1] : r[0]}</TableCell>
                  <TableCell>{r[2]}</TableCell>
                  <TableCell>{isAmharic ? r[3].split('/')[1] : r[3].split('/')[0]}</TableCell>
                  <TableCell>{isAmharic ? r[4].split('/')[1] : r[4].split('/')[0]}</TableCell>
                  <TableCell>{isAmharic ? r[5].split('/')[1] : r[5].split('/')[0]}</TableCell>
                  <TableCell>{isAmharic ? r[6].split('/')[1] : r[6].split('/')[0]}</TableCell>
                  <TableCell>{isAmharic ? r[7].split('/')[1] : r[7].split('/')[0]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            {isAmharic ? 'ማጣሪያዎች' : 'Filters'}
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} flexWrap="wrap">
            <Chip label={isAmharic ? 'ያለፉት 7 ቀናት' : 'Last 7 Days'} />
            <Chip label={isAmharic ? 'ያለፉት 30 ቀናት' : 'Last 30 Days'} />
            <Chip label={isAmharic ? 'ብጁ ክልል' : 'Custom Range'} />
            <Chip label={isAmharic ? 'ሁሉም' : 'All'} />
            <Chip label={isAmharic ? 'እይታ/መጨመር/ማርትዕ/መከልከል' : 'View/Add/Edit/Denied'} />
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button variant="contained">
              {isAmharic ? 'ማጣሪያዎችን ተግብር' : 'APPLY FILTERS'}
            </Button>
            <Button variant="outlined">
              {isAmharic ? 'ዳግም ጀምር' : 'RESET'}
            </Button>
            <Button variant="outlined">
              {isAmharic ? 'መዝገብ ወደ ውጭ ላክ' : 'EXPORT LOG'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

