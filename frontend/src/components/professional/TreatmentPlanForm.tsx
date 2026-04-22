import React from 'react';
import { Grid, TextField } from '@mui/material';

interface TreatmentPlanFormProps {
  value: Record<string, any>;
  onChange: (next: Record<string, any>) => void;
}

export const TreatmentPlanForm: React.FC<TreatmentPlanFormProps> = ({ value, onChange }) => {
  const set = (k: string, v: string) => onChange({ ...value, [k]: v });
  return (
    <Grid container spacing={1}>
      <Grid item xs={12}><TextField fullWidth multiline minRows={2} label="Treatment Summary" value={value.summary || ''} onChange={(e) => set('summary', e.target.value)} /></Grid>
      <Grid item xs={12}><TextField fullWidth label="Procedures Performed" value={value.procedures || ''} onChange={(e) => set('procedures', e.target.value)} /></Grid>
      <Grid item xs={12} md={4}><TextField fullWidth label="Follow-up Required (Yes/No)" value={value.followUpRequired || ''} onChange={(e) => set('followUpRequired', e.target.value)} /></Grid>
      <Grid item xs={12} md={4}><TextField fullWidth type="date" InputLabelProps={{ shrink: true }} label="Follow-up Date" value={value.followUpDate || ''} onChange={(e) => set('followUpDate', e.target.value)} /></Grid>
      <Grid item xs={12} md={4}><TextField fullWidth label="Referral" value={value.referral || ''} onChange={(e) => set('referral', e.target.value)} /></Grid>
      <Grid item xs={12}><TextField fullWidth label="Referral Details" value={value.referralDetails || ''} onChange={(e) => set('referralDetails', e.target.value)} /></Grid>
      <Grid item xs={12}><TextField fullWidth multiline minRows={2} label="Patient Instructions" value={value.patientInstructions || ''} onChange={(e) => set('patientInstructions', e.target.value)} /></Grid>
      <Grid item xs={12}><TextField fullWidth multiline minRows={2} label="Emergency Instructions" value={value.emergencyInstructions || ''} onChange={(e) => set('emergencyInstructions', e.target.value)} /></Grid>
    </Grid>
  );
};

