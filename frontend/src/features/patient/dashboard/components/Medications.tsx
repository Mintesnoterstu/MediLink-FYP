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

export const Medications: React.FC = () => {
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
        const res = await apiClient.get('/patient/medications');
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
        {isAmharic ? 'መድሀኒቶች' : 'Medications'}
      </Typography>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            {isAmharic ? 'ንቁ የታዘዙ መድሀኒቶች' : 'Active Prescriptions'}
          </Typography>
          {loading && <Typography variant="body2">Loading...</Typography>}
          {!loading && rows.length === 0 && <Typography variant="body2">No prescriptions found.</Typography>}
          {rows.map((m) => (
            <Box sx={{ mb: 2 }} key={m.id}>
              <Typography variant="body2">
                {m.name || '-'} — {m.frequency || '-'} {m.dosage ? `(${m.dosage})` : ''}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {m.start_date ? `From: ${new Date(m.start_date).toLocaleDateString()} ` : ''}
                {m.end_date ? `| Until: ${new Date(m.end_date).toLocaleDateString()}` : ''}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Prescribed by: {m.prescribed_by_name || '-'} | Facility: {m.facility_name || '-'}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" onClick={() => { setSelected(m); setDetailOpen(true); }}>
                  {isAmharic ? 'ዝርዝሮች ተመልከት' : 'View Details'}
                </Button>
              </Stack>
            </Box>
          ))}
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isAmharic ? 'የመድሀኒት ዝርዝሮች' : 'Medication Details'}</DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ pt: 1 }}>
            <Typography variant="body1">
              <strong>{isAmharic ? 'መድሀኒት' : 'Medication'}:</strong> {selected?.name || '-'}
            </Typography>
            <Typography variant="body1">
              <strong>{isAmharic ? 'መጠን' : 'Dosage'}:</strong> {selected?.dosage || '-'}
            </Typography>
            <Typography variant="body1">
              <strong>{isAmharic ? 'የታዘዘለት' : 'Prescribed by'}:</strong> {selected?.prescribed_by_name || '-'}
            </Typography>
            <Typography variant="body1">
              <strong>{isAmharic ? 'መጀመሪያ' : 'From'}:</strong> {selected?.start_date ? new Date(selected.start_date).toLocaleDateString() : '-'}
            </Typography>
            <Typography variant="body1">
              <strong>{isAmharic ? 'እስከ' : 'Until'}:</strong> {selected?.end_date ? new Date(selected.end_date).toLocaleDateString() : '-'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {selected?.notes || '-'}
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

