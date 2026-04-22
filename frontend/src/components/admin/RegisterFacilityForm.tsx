import React from 'react';
import { Box, Button, Grid, MenuItem, TextField } from '@mui/material';

export interface RegisterFacilityPayload {
  facilityName: string;
  facilityType: 'Hospital' | 'Health Center' | 'Clinic';
  licenseNumber: string;
  licenseDocument?: string;
  facilityAddress: string;
  facilityPhone: string;
  facilityEmail: string;
}

const initialForm: RegisterFacilityPayload = {
  facilityName: '',
  facilityType: 'Hospital',
  licenseNumber: '',
  licenseDocument: '',
  facilityAddress: '',
  facilityPhone: '',
  facilityEmail: '',
};

interface Props {
  loading?: boolean;
  onSubmit: (payload: RegisterFacilityPayload) => Promise<void>;
}

export const RegisterFacilityForm: React.FC<Props> = ({ loading = false, onSubmit }) => {
  const [form, setForm] = React.useState<RegisterFacilityPayload>(initialForm);

  const setField = (key: keyof RegisterFacilityPayload, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = async (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setField('licenseDocument', String(reader.result || ''));
    reader.readAsDataURL(file);
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
          <TextField fullWidth required label="Facility Name" value={form.facilityName} onChange={(e) => setField('facilityName', e.target.value)} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField select fullWidth required label="Facility Type" value={form.facilityType} onChange={(e) => setField('facilityType', e.target.value)}>
            <MenuItem value="Hospital">Hospital</MenuItem>
            <MenuItem value="Health Center">Health Center</MenuItem>
            <MenuItem value="Clinic">Clinic</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth required label="License Number" value={form.licenseNumber} onChange={(e) => setField('licenseNumber', e.target.value)} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Button component="label" variant="outlined" fullWidth sx={{ height: 56 }}>
            Upload License Document
            <input type="file" hidden accept=".pdf,image/*" onChange={(e) => handleFileChange(e.target.files?.[0])} />
          </Button>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth required label="Facility Address" value={form.facilityAddress} onChange={(e) => setField('facilityAddress', e.target.value)} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth required label="Facility Phone" value={form.facilityPhone} onChange={(e) => setField('facilityPhone', e.target.value)} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField type="email" fullWidth required label="Facility Email" value={form.facilityEmail} onChange={(e) => setField('facilityEmail', e.target.value)} />
        </Grid>
      </Grid>
      <Button sx={{ mt: 2 }} variant="contained" type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register Facility'}
      </Button>
    </Box>
  );
};
