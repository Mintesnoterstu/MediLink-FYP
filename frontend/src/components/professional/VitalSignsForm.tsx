import React from 'react';
import { Grid, TextField } from '@mui/material';

interface VitalSignsFormProps {
  value: Record<string, any>;
  onChange: (next: Record<string, any>) => void;
}

export const VitalSignsForm: React.FC<VitalSignsFormProps> = ({ value, onChange }) => {
  const set = (k: string, v: string) => onChange({ ...value, [k]: v });
  const weight = Number(value.weight || 0);
  const heightM = Number(value.height || 0) / 100;
  const bmi = weight > 0 && heightM > 0 ? (weight / (heightM * heightM)).toFixed(1) : '';
  return (
    <Grid container spacing={1}>
      <Grid item xs={12} md={4}><TextField fullWidth label="Blood Pressure" value={value.bloodPressure || ''} onChange={(e) => set('bloodPressure', e.target.value)} /></Grid>
      <Grid item xs={12} md={4}><TextField fullWidth label="Heart Rate (bpm)" value={value.heartRate || ''} onChange={(e) => set('heartRate', e.target.value)} /></Grid>
      <Grid item xs={12} md={4}><TextField fullWidth label="Temperature (C)" value={value.temperature || ''} onChange={(e) => set('temperature', e.target.value)} /></Grid>
      <Grid item xs={12} md={4}><TextField fullWidth label="Respiratory Rate" value={value.respiratoryRate || ''} onChange={(e) => set('respiratoryRate', e.target.value)} /></Grid>
      <Grid item xs={12} md={4}><TextField fullWidth label="Oxygen Saturation (%)" value={value.oxygenSaturation || ''} onChange={(e) => set('oxygenSaturation', e.target.value)} /></Grid>
      <Grid item xs={12} md={4}><TextField fullWidth label="Weight (kg)" value={value.weight || ''} onChange={(e) => set('weight', e.target.value)} /></Grid>
      <Grid item xs={12} md={4}><TextField fullWidth label="Height (cm)" value={value.height || ''} onChange={(e) => set('height', e.target.value)} /></Grid>
      <Grid item xs={12} md={4}><TextField fullWidth label="BMI (auto)" value={bmi} disabled /></Grid>
    </Grid>
  );
};

