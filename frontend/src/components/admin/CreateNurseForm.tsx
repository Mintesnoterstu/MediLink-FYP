import React from 'react';
import { Box, Button, Grid, MenuItem, TextField } from '@mui/material';

export interface CreateNursePayload {
  fullName: string;
  licenseNumber: string;
  licenseDocument?: string;
  department: 'Outpatient' | 'Inpatient' | 'Emergency';
  yearsExperience: number;
  email: string;
  recoveryEmail: string;
  phoneNumber: string;
  officialTitle: string;
}

const initialForm: CreateNursePayload = {
  fullName: '',
  licenseNumber: '',
  licenseDocument: '',
  department: 'Outpatient',
  yearsExperience: 1,
  email: '',
  recoveryEmail: '',
  phoneNumber: '',
  officialTitle: '',
};

interface Props {
  loading?: boolean;
  onSubmit: (payload: CreateNursePayload) => Promise<void>;
}

export const CreateNurseForm: React.FC<Props> = ({ loading = false, onSubmit }) => {
  const [form, setForm] = React.useState<CreateNursePayload>(initialForm);
  const setField = (key: keyof CreateNursePayload, value: string | number) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setField('licenseDocument', String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
    setForm(initialForm);
  };

  return (
    <Box component="form" onSubmit={submit}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}><TextField fullWidth required label="Full Name" value={form.fullName} onChange={(e) => setField('fullName', e.target.value)} /></Grid>
        <Grid item xs={12} md={6}><TextField fullWidth required label="License Number" value={form.licenseNumber} onChange={(e) => setField('licenseNumber', e.target.value)} /></Grid>
        <Grid item xs={12} md={6}>
          <Button fullWidth component="label" variant="outlined" sx={{ height: 56 }}>
            Upload License Document
            <input hidden type="file" accept=".pdf,image/*" onChange={(e) => handleFile(e.target.files?.[0])} />
          </Button>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField select fullWidth required label="Department" value={form.department} onChange={(e) => setField('department', e.target.value)}>
            <MenuItem value="Outpatient">Outpatient</MenuItem>
            <MenuItem value="Inpatient">Inpatient</MenuItem>
            <MenuItem value="Emergency">Emergency</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={6}><TextField type="number" fullWidth required label="Years of Experience" value={form.yearsExperience} onChange={(e) => setField('yearsExperience', Number(e.target.value || 0))} /></Grid>
        <Grid item xs={12} md={6}><TextField type="email" fullWidth required label="Email" value={form.email} onChange={(e) => setField('email', e.target.value)} /></Grid>
        <Grid item xs={12} md={6}><TextField type="email" fullWidth required label="Recovery Email" value={form.recoveryEmail} onChange={(e) => setField('recoveryEmail', e.target.value)} /></Grid>
        <Grid item xs={12} md={6}><TextField fullWidth required label="Phone Number" value={form.phoneNumber} onChange={(e) => setField('phoneNumber', e.target.value)} /></Grid>
        <Grid item xs={12} md={6}><TextField fullWidth required label="Official Title" value={form.officialTitle} onChange={(e) => setField('officialTitle', e.target.value)} /></Grid>
      </Grid>
      <Button sx={{ mt: 2 }} type="submit" variant="contained" disabled={loading}>{loading ? 'Creating...' : 'Create Nurse'}</Button>
    </Box>
  );
};
