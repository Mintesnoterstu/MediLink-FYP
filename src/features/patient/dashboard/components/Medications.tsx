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

export const Medications: React.FC = () => {
  const { language } = useUI();
  const isAmharic = language === 'am';
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        {isAmharic ? 'መድሀኒቶች' : 'Medications'}
      </Typography>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            {isAmharic ? 'ንቁ የታዘዙ መድሀኒቶች' : 'Active Prescriptions'}
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">
              Amoxicillin 500mg —{' '}
              {isAmharic
                ? 'በቀን ሁለት ጊዜ (ጠዋት እና ምሽት)'
                : 'Twice daily — Morning and Evening'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isAmharic
                ? 'የተመዘገበው፡ ጃንዋሪ 10፣ 2026 | እስከ፡ ጃንዋሪ 30፣ 2026'
                : 'Prescribed: Jan 10, 2026 | Until: Jan 30, 2026'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {isAmharic
                ? 'የታዘዘለት፡ ዶ/ር ታደሰ በቀለ'
                : 'Prescribed by: Dr. Tadesse Bekele'}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="outlined">
                {isAmharic ? 'ማሳሰቢያ አዘጋጅ' : 'Set Reminder'}
              </Button>
              <Button size="small" onClick={() => setDetailOpen(true)}>
                {isAmharic ? 'ዝርዝሮች ተመልከት' : 'View Details'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isAmharic ? 'የመድሀኒት ዝርዝሮች' : 'Medication Details'}</DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ pt: 1 }}>
            <Typography variant="body1">
              <strong>{isAmharic ? 'መድሀኒት' : 'Medication'}:</strong> Amoxicillin 500mg
            </Typography>
            <Typography variant="body1">
              <strong>{isAmharic ? 'መጠን' : 'Dosage'}:</strong> {isAmharic ? 'በቀን ሁለት ጊዜ' : 'Twice daily (Morning and Evening)'}
            </Typography>
            <Typography variant="body1">
              <strong>{isAmharic ? 'የታዘዘለት' : 'Prescribed by'}:</strong> Dr. Tadesse Bekele
            </Typography>
            <Typography variant="body1">
              <strong>{isAmharic ? 'መጀመሪያ' : 'From'}:</strong> Jan 10, 2026
            </Typography>
            <Typography variant="body1">
              <strong>{isAmharic ? 'እስከ' : 'Until'}:</strong> Jan 30, 2026
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {isAmharic
                ? 'ይህ መድሀኒት ለባክቴሪያ ኢንፌክሽን የታዘዘ ነው።'
                : 'This medication was prescribed for bacterial infection.'}
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

