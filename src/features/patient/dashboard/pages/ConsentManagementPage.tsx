import React from 'react';
import {
  Box,
  Typography,
  Alert,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  RadioGroup,
  Radio,
  Divider,
} from '@mui/material';
import { useUI } from '@/contexts/UIContext';

export const ConsentManagementPage: React.FC = () => {
  const { language } = useUI();
  const isAmharic = language === 'am';

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        {isAmharic ? 'ፈቃድ አስተዳደር' : 'CONSENT MANAGEMENT'}
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        {isAmharic
          ? '🔐 ይህ በጣም አስፈላጊው ክፍል ነው - መረጃዎን ማን እንደሚያይ እርስዎ ይቆጣጠራሉ'
          : '🔐 THIS IS THE MOST IMPORTANT SECTION - YOU CONTROL WHO SEES YOUR DATA'}
      </Alert>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            {isAmharic ? 'ንቁ ፈቃዶች' : 'Active Consents'}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{isAmharic ? 'ሐኪም' : 'Doctor'}</TableCell>
                <TableCell>{isAmharic ? 'ተቋም' : 'Facility'}</TableCell>
                <TableCell>{isAmharic ? 'የተሰጠበት ቀን' : 'Granted'}</TableCell>
                <TableCell>{isAmharic ? 'የሚያበቃበት ቀን' : 'Expires'}</TableCell>
                <TableCell>{isAmharic ? 'ወሰን' : 'Scope'}</TableCell>
                <TableCell>{isAmharic ? 'ሁኔታ' : 'Status'}</TableCell>
                <TableCell>{isAmharic ? 'እርምጃዎች' : 'Actions'}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                [
                  'Dr. Tadesse Bekele / ዶ/ር ታደሰ በቀለ',
                  'Jimma Hospital / ጅማ ሆስፒታል',
                  'Jan 10, 2026',
                  'Feb 10, 2026',
                  'Full History, Allergies, Medications',
                  'Active / ንቁ',
                ],
                [
                  'Dr. Abebech Mohammed / ዶ/ር አበበች መሐመድ',
                  'Bishoftu Health Center / ቢሾፍቱ ጤና ጣቢያ',
                  'Jan 5, 2026',
                  'Ongoing',
                  'Allergies Only',
                  'Active / ንቁ',
                ],
              ].map((c) => (
                <TableRow key={c[0]}>
                  <TableCell>{isAmharic ? c[0].split('/')[1] : c[0].split('/')[0]}</TableCell>
                  <TableCell>{isAmharic ? c[1].split('/')[1] : c[1].split('/')[0]}</TableCell>
                  <TableCell>{isAmharic ? 'ጃንዋሪ 10፣ 2026' : c[2]}</TableCell>
                  <TableCell>{isAmharic ? 'ፌብሩዋሪ 10፣ 2026' : c[3]}</TableCell>
                  <TableCell>
                    {isAmharic
                      ? 'ሙሉ ታሪክ፣ አለርጂዎች፣ መድሀኒቶች'
                      : 'Full History, Allergies, Medications'}
                  </TableCell>
                  <TableCell>{isAmharic ? 'ንቁ' : 'Active'}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" color="error" variant="outlined">
                        {isAmharic ? 'ሻርቅ' : 'REVOKE'}
                      </Button>
                      <Button size="small">
                        {isAmharic ? 'የመዳረሻ መዝገብ ይመልከቱ' : 'View Access Log'}
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            {isAmharic
              ? 'በመጠባበቅ ላይ ያሉ የፈቃድ ጥያቄዎች'
              : 'Pending Consent Requests'}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{isAmharic ? 'ሐኪም' : 'Doctor'}</TableCell>
                <TableCell>{isAmharic ? 'ተቋም' : 'Facility'}</TableCell>
                <TableCell>{isAmharic ? 'የተጠየቀበት ቀን' : 'Request Date'}</TableCell>
                <TableCell>{isAmharic ? 'ምክንያት' : 'Reason'}</TableCell>
                <TableCell>{isAmharic ? 'እርምጃዎች' : 'Actions'}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  {isAmharic
                    ? 'ዶ/ር ብሩክ አለሙ'
                    : 'Dr. Biruk Alemu'}
                </TableCell>
                <TableCell>{isAmharic ? 'ጅማ ሆስፒታል' : 'Jimma Hospital'}</TableCell>
                <TableCell>{isAmharic ? 'ጃንዋሪ 15፣ 2026' : 'Jan 15, 2026'}</TableCell>
                <TableCell>
                  {isAmharic ? 'ተከታታይ ሕክምና' : 'Follow-up treatment'}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="contained" color="success">
                      {isAmharic ? 'ፍቀድ' : 'APPROVE'}
                    </Button>
                    <Button size="small" variant="outlined" color="error">
                      {isAmharic ? 'ከልክል' : 'DENY'}
                    </Button>
                    <Button size="small">
                      {isAmharic ? 'ጥያቄውን ይመልከቱ' : 'VIEW REQUEST'}
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            {isAmharic ? 'አዲስ ፈቃድ መስጠት' : 'Grant New Consent'}
          </Typography>

          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>
                {isAmharic ? 'ሐኪም ይፈልጉ' : 'Search for Doctor'}
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  placeholder={
                    isAmharic
                      ? 'የሐኪም ስም / ተቋም / ፈቃድ ቁጥር'
                      : 'Doctor name / facility / license number'
                  }
                />
                <Button variant="contained">
                  {isAmharic ? 'ፈልግ' : 'SEARCH'}
                </Button>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                {isAmharic
                  ? 'ለማጋራት የሚፈልጉትን መረጃ ይምረጡ'
                  : 'Select Data to Share'}
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} flexWrap="wrap">
                {[
                  isAmharic ? 'ሙሉ የሕክምና ታሪክ' : 'Full Medical History',
                  isAmharic ? 'የአሁኑ መድሀኒቶች' : 'Current Medications',
                  isAmharic ? 'አለርጂዎች' : 'Allergies',
                  isAmharic ? 'የላብራቶሪ ውጤቶች' : 'Lab Results',
                  isAmharic ? 'የድንገተኛ መጠናኛ ብቻ' : 'Emergency Contact Only',
                ].map((label) => (
                  <FormControlLabel key={label} control={<Checkbox />} label={label} />
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={700}>
                Select Duration / የጊዜ ገደብ ይምረጡ
              </Typography>
              <RadioGroup defaultValue="30">
                <FormControlLabel value="24h" control={<Radio />} label="One Visit (24 hours)" />
                <FormControlLabel value="30" control={<Radio />} label="30 Days" />
                <FormControlLabel value="90" control={<Radio />} label="90 Days" />
                <FormControlLabel value="ongoing" control={<Radio />} label="Ongoing (until revoked)" />
              </RadioGroup>
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={700}>
                Reason for Access / የመዳረሻ ምክንያት
              </Typography>
              <TextField fullWidth placeholder="(Doctor-provided reason will appear here)" />
            </Box>

            <Box>
              <Button variant="contained" color="primary">
                GRANT CONSENT
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

