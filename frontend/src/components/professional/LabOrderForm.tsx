import React from 'react';
import { Grid, TextField } from '@mui/material';

interface LabOrderFormProps {
  value: Record<string, any>;
  onChange: (next: Record<string, any>) => void;
}

export const LabOrderForm: React.FC<LabOrderFormProps> = ({ value, onChange }) => {
  const set = (k: string, v: string) => onChange({ ...value, [k]: v });
  return (
    <Grid container spacing={1}>
      <Grid item xs={12} md={6}><TextField fullWidth label="Test Name" value={value.testName || ''} onChange={(e) => set('testName', e.target.value)} /></Grid>
      <Grid item xs={12} md={6}><TextField fullWidth label="Urgency" value={value.urgency || ''} onChange={(e) => set('urgency', e.target.value)} /></Grid>
      <Grid item xs={12}><TextField fullWidth multiline minRows={2} label="Lab Notes" value={value.notes || ''} onChange={(e) => set('notes', e.target.value)} /></Grid>
    </Grid>
  );
};

