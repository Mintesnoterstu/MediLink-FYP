import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Divider,
  Stack,
  Chip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useUI } from '@/contexts/UIContext';

export const ProfilePage: React.FC = () => {
  const { language, theme, toggleTheme } = useUI();
  const isAmharic = language === 'am';

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        {isAmharic ? 'መገለጫ እና ቅንብሮች' : 'PROFILE & SETTINGS'}
      </Typography>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            {isAmharic ? 'የትምህርት ሁነታ' : 'Appearance'}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Brightness4 fontSize="small" />
            <FormControlLabel
              control={
                <Switch
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                  color="primary"
                />
              }
              label={isAmharic ? (theme === 'dark' ? 'ጨለማ' : 'ብርሃን') : (theme === 'dark' ? 'Dark' : 'Light')}
            />
            <Brightness7 fontSize="small" />
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            {isAmharic ? 'የግል መረጃ (የተረጋገጠ)' : 'Personal Information (Verified)'}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{isAmharic ? 'መስክ' : 'Field'}</TableCell>
                <TableCell>{isAmharic ? 'አሁን ያለው ዋጋ' : 'Current Value'}</TableCell>
                <TableCell>{isAmharic ? 'የተረጋገጠው በ' : 'Verified By'}</TableCell>
                <TableCell>{isAmharic ? 'እርምጃ' : 'Action'}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                {
                  enField: 'Full Name',
                  amField: 'ሙሉ ስም',
                  value: 'Almaz Kebede',
                  verifiedEn: 'Jimma Hospital',
                  verifiedAm: 'ጅማ ሆስፒታል',
                  actionEn: 'Request Change',
                  actionAm: 'ለውጥ ጠይቅ',
                },
                {
                  enField: 'Date of Birth',
                  amField: 'የትውልድ ቀን',
                  value: '15/04/1990',
                  verifiedEn: 'Jimma Hospital',
                  verifiedAm: 'ጅማ ሆስፒታል',
                  actionEn: 'Request Change',
                  actionAm: 'ለውጥ ጠይቅ',
                },
                {
                  enField: 'Phone Number',
                  amField: 'የስልክ ቁጥር',
                  value: '0911-234-567',
                  verifiedEn: 'Self (SMS verified)',
                  verifiedAm: 'በራስ (ኤስኤምኤስ የተረጋገጠ)',
                  actionEn: 'Update',
                  actionAm: 'አዘምን',
                },
                {
                  enField: 'Email',
                  amField: 'ኢሜይል',
                  value: 'almaz@email.com',
                  verifiedEn: 'Self (Email verified)',
                  verifiedAm: 'በራስ (ኢሜይል የተረጋገጠ)',
                  actionEn: 'Update',
                  actionAm: 'አዘምን',
                },
                {
                  enField: 'Address',
                  amField: 'አድራሻ',
                  value: 'Jimma, Kebele 01',
                  verifiedEn: 'Jimma Hospital',
                  verifiedAm: 'ጅማ ሆስፒታል',
                  actionEn: 'Request Change',
                  actionAm: 'ለውጥ ጠይቅ',
                },
              ].map((r) => (
                <TableRow key={r.enField}>
                  <TableCell>{isAmharic ? r.amField : r.enField}</TableCell>
                  <TableCell>{r.value}</TableCell>
                  <TableCell>{isAmharic ? r.verifiedAm : r.verifiedEn}</TableCell>
                  <TableCell>
                    <Button size="small">
                      {isAmharic ? r.actionAm : r.actionEn}
                    </Button>
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
            {isAmharic ? 'የድንገተኛ አደጋ መጠናኛ' : 'Emergency Contact'}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{isAmharic ? 'መስክ' : 'Field'}</TableCell>
                <TableCell>{isAmharic ? 'አሁን ያለው ዋጋ' : 'Current Value'}</TableCell>
                <TableCell>{isAmharic ? 'እርምጃ' : 'Action'}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                {
                  enField: 'Name',
                  amField: 'ስም',
                  value: 'Tekle Kebede',
                },
                {
                  enField: 'Relationship',
                  amField: 'ዝምድና',
                  value: 'Brother',
                },
                {
                  enField: 'Phone',
                  amField: 'ስልክ',
                  value: '0911-234-567',
                },
                {
                  enField: 'Alternative Phone',
                  amField: 'ተለዋጭ ስልክ',
                  value: '0912-345-678',
                },
              ].map((r) => (
                <TableRow key={r.enField}>
                  <TableCell>{isAmharic ? r.amField : r.enField}</TableCell>
                  <TableCell>{r.value}</TableCell>
                  <TableCell>
                    <Button size="small">
                      {isAmharic ? 'አዘምን' : 'Update'}
                    </Button>
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
            {isAmharic ? 'የደህንነት ቅንብሮች' : 'Security Settings'}
          </Typography>
          <Stack spacing={1}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">
                {isAmharic
                  ? 'የይለፍ ቃል — ለመጨረሻ ጊዜ የተቀየረ፡ ጃንዋሪ 10፣ 2026'
                  : 'Password — Last changed: Jan 10, 2026'}
              </Typography>
              <Button size="small">
                {isAmharic ? 'የይለፍ ቃል ቀይር' : 'Change Password'}
              </Button>
            </Box>
            <Divider />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">
                {isAmharic
                  ? 'ሁለት-ደረጃ ማረጋገጫ — ነቅቷል (ኤስኤምኤስ ኦቲፒ)'
                  : 'Two-Factor Authentication — ENABLED (SMS OTP)'}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="outlined">
                  {isAmharic ? 'አጥፋ' : 'Disable'}
                </Button>
                <Button size="small">
                  {isAmharic ? 'አዋቅር' : 'Configure'}
                </Button>
              </Stack>
            </Box>
            <Divider />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">
                {isAmharic ? 'የታመኑ መሣሪያዎች — 2 መሣሪያዎች' : 'Trusted Devices — 2 devices'}
              </Typography>
              <Button size="small">
                {isAmharic ? 'አስተዳድር' : 'Manage'}
              </Button>
            </Box>
            <Divider />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">
                {isAmharic
                  ? 'የመግቢያ ታሪክ — የመጨረሻ መግቢያ፡ ዛሬ ከጠዋቱ 9፡15'
                  : 'Login History — Last login: Today 9:15 AM'}
              </Typography>
              <Button size="small">
                {isAmharic ? 'ሙሉ ታሪክ ይመልከቱ' : 'View Full History'}
              </Button>
            </Box>
            <Divider />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">
                {isAmharic ? 'ከሁሉም መሣሪያዎች ውጣ' : 'Logout from all devices'}
              </Typography>
              <Button size="small" color="error" variant="outlined">
                {isAmharic ? 'አረጋግጥ' : 'Confirm'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            {isAmharic ? 'የድንገተኛ ቅንብሮች' : 'Emergency Settings'}
          </Typography>
          <Stack spacing={1}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">
                {isAmharic
                  ? 'የድንገተኛ መዳረሻ ሁነታ — በድንገተኛ አደጋ ጊዜ ማንኛውም ሐኪም ለ24 ሰዓት አስፈላጊ መረጃዎን እንዲያይ ይፈቅዳል።'
                  : 'Emergency Access Mode — Allows ANY doctor to see your critical information for 24 hours.'}
              </Typography>
              <Chip label={isAmharic ? 'ጠፍቷል' : 'OFF'} />
              <Button size="small" variant="contained">
                {isAmharic ? 'አንቃ' : 'ACTIVATE'}
              </Button>
            </Box>
            <Divider />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">
                {isAmharic
                  ? 'የድንገተኛ አደጋ መጠናኛ — ተክሌ ከበደ - 0911-234-567'
                  : 'Emergency Contact — Tekle Kebede - 0911-234-567'}
              </Typography>
              <Button size="small">
                {isAmharic ? 'አዘምን' : 'Update'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            {isAmharic ? 'የውሂብ እርምጃዎች' : 'Data Actions'}
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
            <Button variant="outlined">
              {isAmharic ? 'የእኔን ውሂብ አውርድ' : 'DOWNLOAD MY DATA'}
            </Button>
            <Button variant="outlined" color="error">
              {isAmharic ? 'መለያ መሰረዝ ጠይቅ' : 'REQUEST ACCOUNT DELETION'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

