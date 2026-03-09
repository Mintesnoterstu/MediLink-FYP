import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useUI } from '@/contexts/UIContext';

export const DashboardHome: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language } = useUI();

  const isAmharic = language === 'am';

  const patientName = user?.name || '[Patient Name]';
  const healthId = 'ETH-2026-0115-AB123';

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        {isAmharic ? 'ዋና ገጽ' : 'DASHBOARD HOME'}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
                {isAmharic ? 'የእንኳን ደህና መጣት ካርድ' : 'Welcome Card'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 0.5 }}>
                {isAmharic ? 'እንኳን ደህና መጡ፣ ' : 'Welcome back, '}
                <strong>{patientName}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {isAmharic ? 'የኢትዮጵያ የጤና መታወቂያ፡ ' : 'Ethiopian Health ID: '}
                <strong>{healthId}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {isAmharic ? 'አባል የሆኑት፡ ጃንዋሪ 15፣ 2026' : 'Member since: January 15, 2026'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isAmharic ? 'የመጨረሻ መግቢያ፡ ዛሬ ከጠዋቱ 9፡15' : 'Last login: Today at 9:15 AM'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
                {isAmharic ? 'ፈጣን ስታቲስቲክስ' : 'Quick Stats'}
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{isAmharic ? 'መለኪያ' : 'Metric'}</TableCell>
                    <TableCell>{isAmharic ? 'ዋጋ' : 'Value'}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{isAmharic ? 'ንቁ ፈቃዶች' : 'Active Consents'}</TableCell>
                    <TableCell>
                      {isAmharic ? '2 ሐኪሞች መረጃዎን ማየት ይችላሉ' : '2 doctors can see your data'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      {isAmharic ? 'በመጠባበቅ ላይ ያሉ ማጽደቆች' : 'Pending Approvals'}
                    </TableCell>
                    <TableCell>
                      {isAmharic ? '1 ለውጥ ግምገማዎን ይፈልጋል' : '1 change needs your review'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>{isAmharic ? 'የቅርብ ጊዜ እይታዎች' : 'Recent Views'}</TableCell>
                    <TableCell>
                      {isAmharic ? 'በዚህ ሳምንት 3 እይታዎች' : '3 views this week'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>{isAmharic ? 'ቀጣይ ቀጠሮ' : 'Next Appointment'}</TableCell>
                    <TableCell>
                      {isAmharic
                        ? 'ጃንዋሪ 20፣ 2026 ከዶ/ር ታደሰ ጋር'
                        : 'Jan 20, 2026 with Dr. Tadesse'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
                {isAmharic ? 'ማንቂያዎች እና ማሳወቂያዎች' : 'Alerts & Notifications'}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                  <Typography variant="body2">
                    {isAmharic
                      ? '🔔 ዶ/ር ታደሰ የሕክምና መዝገብዎን አዘምነዋል'
                      : '🔔 Dr. Tadesse updated your medical record'}
                  </Typography>
                  <Button size="small" onClick={() => navigate('/dashboard/records')}>
                    {isAmharic ? 'ለውጦችን ይመልከቱ' : 'Review Changes'}
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                  <Typography variant="body2">
                    {isAmharic
                      ? '⏰ የመድሀኒት ማስታወሻ፡ አሞክሲሲሊን ከምሽቱ 8 ሰዓት'
                      : '⏰ Medication reminder: Amoxicillin at 8 PM'}
                  </Typography>
                  <Chip
                    size="small"
                    label={isAmharic ? 'የወሰድኩ ምልክት ያድርጉ' : 'Mark as Taken'}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                  <Typography variant="body2">
                    {isAmharic
                      ? '📅 ነገ ከዶ/ር አበበች ጋር ቀጠሮ አለዎት'
                      : '📅 Appointment tomorrow with Dr. Abebech'}
                  </Typography>
                  <Button size="small" onClick={() => navigate('/appointments')}>
                    {isAmharic ? 'ዝርዝሮችን ይመልከቱ' : 'View Details'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
                {isAmharic ? 'የቅርብ ጊዜ እንቅስቃሴ' : 'Recent Activity'}
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{isAmharic ? 'ሰዓት' : 'Time'}</TableCell>
                    <TableCell>{isAmharic ? 'እንቅስቃሴ' : 'Activity'}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{isAmharic ? 'ዛሬ፣ ከጠዋቱ 10፡30' : 'Today, 10:30 AM'}</TableCell>
                    <TableCell>
                      {isAmharic
                        ? 'ዶ/ር ታደሰ የአለርጂ መረጃዎን ተመልክተዋል'
                        : 'Dr. Tadesse viewed your Allergies'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>{isAmharic ? 'ዛሬ፣ ከጠዋቱ 9፡15' : 'Today, 9:15 AM'}</TableCell>
                    <TableCell>{isAmharic ? 'እርስዎ ገብተዋል' : 'You logged in'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>{isAmharic ? 'ትናንት፣ ከሰዓት 2፡30' : 'Yesterday, 2:30 PM'}</TableCell>
                    <TableCell>
                      {isAmharic
                        ? 'ዶ/ር አበበች የመድሀኒት መረጃዎን ተመልክተዋል'
                        : 'Dr. Abebech viewed your Medications'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>{isAmharic ? 'ጃንዋሪ 15፣ 2026' : 'Jan 15, 2026'}</TableCell>
                    <TableCell>
                      {isAmharic
                        ? 'ለዶ/ር ታደሰ ፈቃድ ሰጥተዋል'
                        : 'You granted consent to Dr. Tadesse'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
                {isAmharic ? 'ፈጣን እርምጃዎች' : 'Quick Actions'}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Button variant="contained" onClick={() => navigate('/dashboard/consent')}>
                  {isAmharic ? 'አዲስ ፈቃድ ይስጡ' : 'Grant New Consent'}
                </Button>
                <Button variant="outlined" onClick={() => navigate('/dashboard/records')}>
                  {isAmharic ? 'እርማት ይጠይቁ' : 'Request Correction'}
                </Button>
                <Button variant="outlined" onClick={() => navigate('/dashboard/records')}>
                  {isAmharic ? 'ሙሉ መዝገቦችን ይመልከቱ' : 'View Full Records'}
                </Button>
                <Button variant="outlined" onClick={() => navigate('/dashboard/profile')}>
                  {isAmharic ? 'የድንገተኛ ቅንብሮች' : 'Emergency Settings'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

