import React from 'react';
import { Box, Button, Grid, TextField } from '@mui/material';
import { useUI } from '@/contexts/UIContext';
import { CreateCityAdminPayload } from '@/features/admin/services/zonalAdminService';

const initialForm: CreateCityAdminPayload = {
  cityName: 'Jimma City',
  fullName: '',
  email: '',
  recoveryEmail: '',
  phoneNumber: '',
  officialTitle: '',
};

interface Props {
  loading?: boolean;
  onSubmit: (payload: CreateCityAdminPayload) => Promise<void>;
}

export const CreateCityForm: React.FC<Props> = ({ loading = false, onSubmit }) => {
  const { language } = useUI();
  const isAmharic = language === 'am';
  const t = (en: string, am: string) => (isAmharic ? am : en);
  const [form, setForm] = React.useState<CreateCityAdminPayload>(initialForm);

  const setField = (key: keyof CreateCityAdminPayload, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
    setForm(initialForm);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField fullWidth required label={t('City Name', 'የከተማ ስም')} value={form.cityName} disabled />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth required label={t('Admin Full Name', 'የአስተዳዳሪ ሙሉ ስም')} value={form.fullName} onChange={(e) => setField('fullName', e.target.value)} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField type="email" fullWidth required label={t('Admin Email', 'የአስተዳዳሪ ኢሜይል')} value={form.email} onChange={(e) => setField('email', e.target.value)} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            type="email"
            fullWidth
            required
            label={t('Recovery Email', 'የመልሶ ማግኛ ኢሜይል')}
            value={form.recoveryEmail}
            onChange={(e) => setField('recoveryEmail', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth required label={t('Phone Number', 'ስልክ ቁጥር')} value={form.phoneNumber} onChange={(e) => setField('phoneNumber', e.target.value)} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth required label={t('Official Title', 'የስራ መደብ')} value={form.officialTitle} onChange={(e) => setField('officialTitle', e.target.value)} />
        </Grid>
      </Grid>
      <Button sx={{ mt: 2 }} variant="contained" type="submit" disabled={loading}>
        {loading ? t('Creating...', 'በመፍጠር ላይ...') : t('Create City Admin', 'የከተማ አስተዳዳሪ ፍጠር')}
      </Button>
    </Box>
  );
};
