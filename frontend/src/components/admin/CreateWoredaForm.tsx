import React from 'react';
import { Box, Button, Grid, MenuItem, TextField } from '@mui/material';
import { CreateWoredaAdminPayload, WoredaOption } from '@/features/admin/services/zonalAdminService';

const woredaOptions: WoredaOption[] = [
  'Jimma',
  'Seka',
  'Gera',
  'Gomma',
  'Mana',
  'Limmu Kosa',
  'Kersa',
  'Dedo',
  'Omo Nada',
  'Sigimo',
];

const initialForm: CreateWoredaAdminPayload = {
  woredaName: 'Jimma',
  fullName: '',
  email: '',
  recoveryEmail: '',
  phoneNumber: '',
  officialTitle: '',
};

interface Props {
  loading?: boolean;
  onSubmit: (payload: CreateWoredaAdminPayload) => Promise<void>;
}

export const CreateWoredaForm: React.FC<Props> = ({ loading = false, onSubmit }) => {
  const [form, setForm] = React.useState<CreateWoredaAdminPayload>(initialForm);

  const setField = (key: keyof CreateWoredaAdminPayload, value: string) => {
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
          <TextField
            select
            fullWidth
            required
            label="Woreda Name"
            value={form.woredaName}
            onChange={(e) => setField('woredaName', e.target.value)}
          >
            {woredaOptions.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </TextField>
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
        {loading ? 'Creating...' : 'Create Woreda Admin'}
      </Button>
    </Box>
  );
};
