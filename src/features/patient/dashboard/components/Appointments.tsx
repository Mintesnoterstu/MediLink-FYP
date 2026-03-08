import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useUI } from '@/contexts/UIContext';

export const Appointments: React.FC = () => {
  const { language } = useUI();
  const isAmharic = language === 'am';
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        {isAmharic ? 'ቀጠሮዎች' : 'Appointments'}
      </Typography>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            {isAmharic ? 'የሚመጡ ቀጠሮዎች' : 'Upcoming Appointments'}
          </Typography>
          <Box>
            <Typography variant="body2">
              📌 Jan 20, 2026 — 10:30 AM —{' '}
              {isAmharic ? 'ዶ/ር ታደሰ በቀለ' : 'Dr. Tadesse Bekele'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isAmharic
                ? 'ጅማ ሆስፒታል - ውጪ ታካሚ ክፍል'
                : 'Jimma Hospital — Outpatient Department'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {isAmharic ? 'ምክንያት፡ ተከታታይ ሕክምና' : 'Reason: Follow-up'}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" onClick={() => setDetailOpen(true)}>
                {isAmharic ? 'ዝርዝሮች ተመልከት' : 'View Details'}
              </Button>
              <Button size="small" variant="outlined">
                {isAmharic ? 'ቀጠሮ ቀይር' : 'Reschedule'}
              </Button>
              <Button size="small" color="error" variant="outlined">
                {isAmharic ? 'ሰርዝ' : 'Cancel'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isAmharic ? 'የቀጠሮ ዝርዝሮች' : 'Appointment Details'}</DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ pt: 1 }}>
            <Typography variant="body1">
              <strong>{isAmharic ? 'ቀን እና ሰዓት' : 'Date & Time'}:</strong> Jan 20, 2026 — 10:30 AM
            </Typography>
            <Typography variant="body1">
              <strong>{isAmharic ? 'ሐኪም' : 'Doctor'}:</strong> Dr. Tadesse Bekele
            </Typography>
            <Typography variant="body1">
              <strong>{isAmharic ? 'ቦታ' : 'Location'}:</strong> Jimma Hospital — Outpatient Department
            </Typography>
            <Typography variant="body1">
              <strong>{isAmharic ? 'ምክንያት' : 'Reason'}:</strong> {isAmharic ? 'ተከታታይ ሕክምና' : 'Follow-up'}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>{isAmharic ? 'ዝጋ' : 'Close'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

