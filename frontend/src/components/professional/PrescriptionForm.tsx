import React from 'react';
import { Grid, TextField } from '@mui/material';

interface PrescriptionFormProps {
  value: Record<string, any>;
  onChange: (next: Record<string, any>) => void;
}

export const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ value, onChange }) => {
  const set = (k: string, v: string) => onChange({ ...value, [k]: v });
  return (
    <Grid container spacing={1}>
      <Grid item xs={12} md={6}><TextField fullWidth label="Medication Name" value={value.medicationName || ''} onChange={(e) => set('medicationName', e.target.value)} /></Grid>
      <Grid item xs={12} md={6}><TextField fullWidth label="Dosage" value={value.dosage || ''} onChange={(e) => set('dosage', e.target.value)} /></Grid>
      <Grid item xs={12} md={6}><TextField fullWidth label="Frequency" value={value.frequency || ''} onChange={(e) => set('frequency', e.target.value)} /></Grid>
      <Grid item xs={12} md={6}><TextField fullWidth label="Route" value={value.route || ''} onChange={(e) => set('route', e.target.value)} /></Grid>
      <Grid item xs={12} md={6}><TextField fullWidth label="Duration" value={value.duration || ''} onChange={(e) => set('duration', e.target.value)} /></Grid>
      <Grid item xs={12} md={3}><TextField fullWidth label="Quantity" value={value.quantity || ''} onChange={(e) => set('quantity', e.target.value)} /></Grid>
      <Grid item xs={12} md={3}><TextField fullWidth label="Refills" value={value.refills || ''} onChange={(e) => set('refills', e.target.value)} /></Grid>
      <Grid item xs={12}><TextField fullWidth multiline minRows={2} label="Instructions" value={value.instructions || ''} onChange={(e) => set('instructions', e.target.value)} /></Grid>
    </Grid>
  );
};

