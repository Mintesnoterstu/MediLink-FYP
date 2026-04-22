import React from 'react';
import { Box, Button, Grid, TextField } from '@mui/material';
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
          <TextField fullWidth required label="City Name" value={form.cityName} disabled />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth required label="Admin Full Name" value={form.fullName} onChange={(e) => setField('fullName', e.target.value)} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField type="email" fullWidth required label="Admin Email" value={form.email} onChange={(e) => setField('email', e.target.value)} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            type="email"
            fullWidth
            required
            label="Recovery Email"
            value={form.recoveryEmail}
            onChange={(e) => setField('recoveryEmail', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth required label="Phone Number" value={form.phoneNumber} onChange={(e) => setField('phoneNumber', e.target.value)} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth required label="Official Title" value={form.officialTitle} onChange={(e) => setField('officialTitle', e.target.value)} />
        </Grid>
      </Grid>
      <Button sx={{ mt: 2 }} variant="contained" type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create City Admin'}
      </Button>
    </Box>
  );
};
