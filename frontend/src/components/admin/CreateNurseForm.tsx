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
  const bi = (en: string, am: string) => `${en} / ${am}`;
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
        <Grid item xs={12} md={6}><TextField fullWidth required label={bi('Full Name', 'ሙሉ ስም')} value={form.fullName} onChange={(e) => setField('fullName', e.target.value)} /></Grid>
        <Grid item xs={12} md={6}><TextField fullWidth required label={bi('License Number', 'የፈቃድ ቁጥር')} value={form.licenseNumber} onChange={(e) => setField('licenseNumber', e.target.value)} /></Grid>
        <Grid item xs={12} md={6}>
          <Button fullWidth component="label" variant="outlined" sx={{ height: 56 }}>
            {bi('Upload License Document', 'የፈቃድ ሰነድ ይጫኑ')}
            <input hidden type="file" accept=".pdf,image/*" onChange={(e) => handleFile(e.target.files?.[0])} />
          </Button>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField select fullWidth required label={bi('Department', 'ዲፓርትመንት')} value={form.department} onChange={(e) => setField('department', e.target.value)}>
            <MenuItem value="Outpatient">Outpatient</MenuItem>
            <MenuItem value="Inpatient">Inpatient</MenuItem>
            <MenuItem value="Emergency">Emergency</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={6}><TextField type="number" fullWidth required label={bi('Years of Experience', 'የስራ ልምድ ዓመታት')} value={form.yearsExperience} onChange={(e) => setField('yearsExperience', Number(e.target.value || 0))} /></Grid>
        <Grid item xs={12} md={6}><TextField type="email" fullWidth required label={bi('Email', 'ኢሜይል')} value={form.email} onChange={(e) => setField('email', e.target.value)} /></Grid>
        <Grid item xs={12} md={6}><TextField type="email" fullWidth required label={bi('Recovery Email', 'የመልሶ ማግኛ ኢሜይል')} value={form.recoveryEmail} onChange={(e) => setField('recoveryEmail', e.target.value)} /></Grid>
        <Grid item xs={12} md={6}><TextField fullWidth required label={bi('Phone Number', 'ስልክ ቁጥር')} value={form.phoneNumber} onChange={(e) => setField('phoneNumber', e.target.value)} /></Grid>
        <Grid item xs={12} md={6}><TextField fullWidth required label={bi('Official Title', 'የስራ መደብ')} value={form.officialTitle} onChange={(e) => setField('officialTitle', e.target.value)} /></Grid>
      </Grid>
      <Button sx={{ mt: 2 }} type="submit" variant="contained" disabled={loading}>{loading ? bi('Creating...', 'በመፍጠር ላይ...') : bi('Create Nurse', 'ነርስ ፍጠር')}</Button>
    </Box>
  );
};
