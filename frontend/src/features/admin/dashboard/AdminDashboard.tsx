import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Chip,
} from '@mui/material';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useUI } from '@/contexts/UIContext';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { language } = useUI();

  const isAmharic = language === 'am';

  const adminName = user?.name || (isAmharic ? 'ዶ/ር ተስፋዬ አየለ' : 'Dr. Tesfaye Ayele');
  const facilityName = isAmharic ? 'ጅማ ሆስፒታል' : 'Jimma Hospital';

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800} gutterBottom>
          {isAmharic
            ? 'የታካሚ ምዝገባ - የተቋም አስተዳዳሪ ብቻ'
            : 'PATIENT REGISTRATION - FACILITY ADMIN ONLY'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isAmharic ? 'ገብተዋል፡ ' : 'Logged in as: '}
          <strong>{adminName}</strong>{' '}
          {isAmharic ? 'በ' : 'at '}
          <strong>{facilityName}</strong>
        </Typography>
      </Box>

      {/* Important notice */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'warning.light',
          bgcolor: 'warning.50',
        }}
      >
        <CardContent>
          <Typography variant="subtitle1" fontWeight={800} gutterBottom>
            {isAmharic ? '⚠️ በአካል መገኘት ያስፈልጋል' : '⚠️ IN-PERSON REGISTRATION REQUIRED'}
          </Typography>
          <Typography variant="body2">
            {isAmharic
              ? 'ታካሚው ከዋናው መታወቂያ ሰነድ ጋር መገኘት አለበት።'
              : 'Patient must be present with original ID document.'}
          </Typography>
          <Typography variant="body2">
            {isAmharic
              ? 'ከመቀጠልዎ በፊት ማንነትን ያረጋግጡ።'
              : 'Verify identity before proceeding.'}
          </Typography>
          <Typography variant="body2">
            {isAmharic
              ? 'የመታወቂያ ሰነዱን ይቃኙ ወይም ፎቶ ያንሱ።'
              : 'Scan or photograph the ID document.'}
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Registration form */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={800} gutterBottom>
                {isAmharic ? 'የታካሚ ምዝገባ ቅጽ' : 'Patient Registration Form'}
              </Typography>

              {/* Section 1: Patient Information */}
              <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 2, mb: 1 }}>
                {isAmharic ? 'የታካሚ መረጃ' : 'Patient Information'}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={isAmharic ? 'ሙሉ ስም' : 'Full Name'}
                    placeholder={
                      isAmharic ? 'የታካሚውን ሙሉ ስም ያስገቡ' : "Enter patient's full name"
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    type="date"
                    label={isAmharic ? 'የትውልድ ቀን' : 'Date of Birth'}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth required>
                    <InputLabel>{isAmharic ? 'ጾታ' : 'Gender'}</InputLabel>
                    <Select label={isAmharic ? 'ጾታ' : 'Gender'} defaultValue="">
                      <MenuItem value="male">
                        {isAmharic ? 'ወንድ' : 'Male'}
                      </MenuItem>
                      <MenuItem value="female">
                        {isAmharic ? 'ሴት' : 'Female'}
                      </MenuItem>
                      <MenuItem value="other">
                        {isAmharic ? 'ሌላ' : 'Other'}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={isAmharic ? 'የቀበሌ መታወቂያ ቁጥር' : 'Kebele ID Number'}
                    placeholder={
                      isAmharic
                        ? 'የቀበሌ መታወቂያ ቁጥር ያስገቡ'
                        : 'Enter Kebele ID number'
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Button variant="outlined" fullWidth sx={{ height: '100%' }}>
                    {isAmharic ? '📎 ፊት/ኋላ ስቀል' : '📎 UPLOAD FRONT/BACK'}
                  </Button>
                </Grid>
              </Grid>

              {/* Section 2: Contact Information */}
              <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 3, mb: 1 }}>
                {isAmharic ? 'የመገናኛ መረጃ' : 'Contact Information'}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      label={isAmharic ? 'የስልክ ቁጥር' : 'Phone Number'}
                      placeholder="0911-234-567"
                      required
                    />
                    <Button variant="outlined">
                      {isAmharic ? 'ስልክ አረጋግጥ' : 'VERIFY PHONE'}
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="email"
                    label={isAmharic ? 'ኢሜይል' : 'Email'}
                    placeholder="patient@email.com"
                  />
                </Grid>
              </Grid>

              {/* Section 3: Location Information */}
              <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 3, mb: 1 }}>
                {isAmharic ? 'የአካባቢ መረጃ' : 'Location Information'}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label={isAmharic ? 'ክልል' : 'Region'}
                    value={isAmharic ? 'ኦሮሚያ' : 'Oromia'}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label={isAmharic ? 'ዞን' : 'Zone'}
                    value={isAmharic ? 'ጅማ' : 'Jimma'}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth required>
                    <InputLabel>{isAmharic ? 'ወረዳ' : 'Woreda'}</InputLabel>
                    <Select label={isAmharic ? 'ወረዳ' : 'Woreda'} defaultValue="">
                      <MenuItem value="jimma">{isAmharic ? 'ጅማ' : 'Jimma'}</MenuItem>
                      <MenuItem value="seka">{isAmharic ? 'ሰካ' : 'Seka'}</MenuItem>
                      <MenuItem value="gera">{isAmharic ? 'ጌራ' : 'Gera'}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label={isAmharic ? 'ቀበሌ' : 'Kebele'}
                    placeholder={
                      isAmharic
                        ? 'የቀበሌ ቁጥር/ስም ያስገቡ'
                        : 'Enter kebele number/name'
                    }
                    required
                  />
                </Grid>
              </Grid>

              {/* Section 4: Emergency Contact */}
              <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 3, mb: 1 }}>
                {isAmharic ? 'የድንገተኛ አደጋ መጠናኛ' : 'Emergency Contact'}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={isAmharic ? 'ስም' : 'Name'}
                    placeholder={isAmharic ? 'ሙሉ ስም' : 'Full name'}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={isAmharic ? 'ስልክ' : 'Phone'}
                    placeholder="0912-345-678"
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={isAmharic ? 'ዝምድና' : 'Relation'}
                    placeholder={
                      isAmharic
                        ? 'ለምሳሌ፡ ወንድም፣ እህት፣ እናት'
                        : 'e.g., Brother, Sister, Mother'
                    }
                    required
                  />
                </Grid>
              </Grid>

              {/* Duplicate check + form buttons */}
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                  justifyContent: 'space-between',
                  mt: 3,
                }}
              >
                <Button variant="outlined">
                  {isAmharic ? '🔍 ተደጋጋሚነት አረጋግጥ' : '🔍 CHECK FOR DUPLICATES'}
                </Button>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" color="inherit">
                    {isAmharic ? '❌ ሰርዝ' : '❌ CANCEL'}
                  </Button>
                  <Button variant="contained" color="primary">
                    {isAmharic ? '✅ ታካሚ መዝግብ' : '✅ REGISTER PATIENT'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Side panel: confirmation + recent registrations */}
        <Grid item xs={12} lg={4}>
          {/* Mock confirmation card */}
          <Card
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'success.light',
              mb: 3,
            }}
          >
            <CardContent>
              <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                {isAmharic
                  ? '✅ ታካሚ በተሳካ ሁኔታ ተመዝግቧል'
                  : '✅ PATIENT REGISTERED SUCCESSFULLY'}
              </Typography>
              <Typography variant="body2">
                {isAmharic
                  ? 'የኢትዮጵያ የጤና መታወቂያ፡ ETH-2026-0315-AB123'
                  : 'Ethiopian Health ID: ETH-2026-0315-AB123'}
              </Typography>
              <Typography variant="body2">
                {isAmharic
                  ? 'የታካሚ ስም፡ አልማዝ ከበደ'
                  : 'Patient Name: Almaz Kebede'}
              </Typography>
              <Typography variant="body2">
                {isAmharic
                  ? 'የመዘገበው፡ ዶ/ር ተስፋዬ አየለ'
                  : 'Registered By: Dr. Tesfaye Ayele'}
              </Typography>
              <Typography variant="body2">
                {isAmharic ? 'ተቋም፡ ጅማ ሆስፒታል' : 'Facility: Jimma Hospital'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {isAmharic
                  ? 'ቀን/ሰዓት፡ 2026-03-15 10:30:00'
                  : 'Date/Time: 2026-03-15 10:30:00'}
              </Typography>

              <Chip
                size="small"
                color="primary"
                label={
                  isAmharic
                    ? 'ኤስኤምኤስ ከመግቢያ መረጃ ጋር ተልኳል'
                    : 'SMS sent with login credentials'
                }
                sx={{ mb: 1 }}
              />

              <Typography variant="body2">
                {isAmharic
                  ? 'ታካሚው መግባት የሚችልበት፡ portal.medilink.et'
                  : 'Patient can log in at: portal.medilink.et'}
              </Typography>
              <Typography variant="body2">
                {isAmharic
                  ? 'ጊዜያዊ የይለፍ ቃል፡ Temp@123456 (መጀመሪያ ጊዜ ማስተካከል አለበት)'
                  : 'Temporary password: Temp@123456 (must change on first login)'}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                <Button size="small" variant="outlined">
                  {isAmharic
                    ? '🖨️ የጤና መታወቂያ ካርድ አትም'
                    : '🖨️ PRINT HEALTH ID CARD'}
                </Button>
                <Button size="small" variant="outlined">
                  {isAmharic
                    ? '👤 የታካሚ መገለጫ ተመልከት'
                    : '👤 VIEW PATIENT PROFILE'}
                </Button>
                <Button size="small" variant="contained">
                  {isAmharic
                    ? '📋 አዲስ ታካሚ መዝግብ'
                    : '📋 REGISTER NEW PATIENT'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Recent registrations table */}
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                {isAmharic ? 'የቅርብ ጊዜ ምዝገባዎች' : 'Recent Registrations'}
              </Typography>
              <Table component={Paper} size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{isAmharic ? 'ሰዓት' : 'Time'} </TableCell>
                    <TableCell>{isAmharic ? 'ስም' : 'Name'}</TableCell>
                    <TableCell>
                      {isAmharic ? 'የኢትዮጵያ የጤና መታወቂያ' : 'Ethiopian Health ID'}
                    </TableCell>
                    <TableCell>{isAmharic ? 'የመዘገበው' : 'Registered By'}</TableCell>
                    <TableCell>{isAmharic ? 'አትም' : 'Print'}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>10:30</TableCell>
                    <TableCell>
                      {isAmharic ? 'አልማዝ ከበደ' : 'Almaz Kebede'}
                    </TableCell>
                    <TableCell>ETH-2026-0315-AB123</TableCell>
                    <TableCell>
                      {isAmharic ? 'ዶ/ር ተስፋዬ አየለ' : 'Dr. Tesfaye Ayele'}
                    </TableCell>
                    <TableCell>🖨️</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>09:15</TableCell>
                    <TableCell>
                      {isAmharic ? 'ተክሌ ኃይሉ' : 'Tekle Hailu'}
                    </TableCell>
                    <TableCell>ETH-2026-0315-CD456</TableCell>
                    <TableCell>
                      {isAmharic ? 'ዶ/ር ተስፋዬ አየለ' : 'Dr. Tesfaye Ayele'}
                    </TableCell>
                    <TableCell>🖨️</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};


