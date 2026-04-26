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
import { apiClient } from '@/services/apiClient';

export const Appointments: React.FC = () => {
  const { language } = useUI();
  const isAmharic = language === 'am';
  const [detailOpen, setDetailOpen] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/patient/appointments');
        setRows(Array.isArray(res.data) ? res.data : []);
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = window.setInterval(load, 10000);
    return () => window.clearInterval(interval);
  }, []);

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
          {loading && <Typography variant="body2">Loading...</Typography>}
          {!loading && rows.length === 0 && <Typography variant="body2">No appointments found.</Typography>}
          {rows.map((a) => (
            <Box key={a.id} sx={{ mb: 2 }}>
              <Typography variant="body2">
                📌 {a.appointment_date ? new Date(a.appointment_date).toLocaleString() : '-'} — {a.doctor_name || '-'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {a.facility_name || '-'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Reason: {a.reason || '-'} | Status: {a.status || '-'}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" onClick={() => { setSelected(a); setDetailOpen(true); }}>
                  {isAmharic ? 'ዝርዝሮች ተመልከት' : 'View Details'}
                </Button>
              </Stack>
            </Box>
          ))}
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isAmharic ? 'የቀጠሮ ዝርዝሮች' : 'Appointment Details'}</DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ pt: 1 }}>
            <Typography variant="body1">
              <strong>{isAmharic ? 'ቀን እና ሰዓት' : 'Date & Time'}:</strong> {selected?.appointment_date ? new Date(selected.appointment_date).toLocaleString() : '-'}
            </Typography>
            <Typography variant="body1">
              <strong>{isAmharic ? 'ሐኪም' : 'Doctor'}:</strong> {selected?.doctor_name || '-'}
            </Typography>
            <Typography variant="body1">
              <strong>{isAmharic ? 'ቦታ' : 'Location'}:</strong> {selected?.facility_name || '-'}
            </Typography>
            <Typography variant="body1">
              <strong>{isAmharic ? 'ምክንያት' : 'Reason'}:</strong> {selected?.reason || '-'}
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

