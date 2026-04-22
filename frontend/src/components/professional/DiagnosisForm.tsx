import React from 'react';
import { Grid, TextField } from '@mui/material';

interface DiagnosisFormProps {
  value: Record<string, any>;
  onChange: (next: Record<string, any>) => void;
}

export const DiagnosisForm: React.FC<DiagnosisFormProps> = ({ value, onChange }) => {
  const set = (k: string, v: string) => onChange({ ...value, [k]: v });
  return (
    <Grid container spacing={1}>
      <Grid item xs={12}><TextField fullWidth label="Primary Diagnosis" value={value.primaryDiagnosis || ''} onChange={(e) => set('primaryDiagnosis', e.target.value)} /></Grid>
      <Grid item xs={12}><TextField fullWidth label="Secondary Diagnoses" value={value.secondaryDiagnoses || ''} onChange={(e) => set('secondaryDiagnoses', e.target.value)} /></Grid>
      <Grid item xs={12}><TextField fullWidth label="Differential Diagnoses" value={value.differentialDiagnoses || ''} onChange={(e) => set('differentialDiagnoses', e.target.value)} /></Grid>
      <Grid item xs={12}><TextField fullWidth multiline minRows={2} label="Diagnosis Notes" value={value.notes || ''} onChange={(e) => set('notes', e.target.value)} /></Grid>
      <Grid item xs={12} md={6}><TextField fullWidth label="ICD-11 Code" value={value.icd11Code || ''} onChange={(e) => set('icd11Code', e.target.value)} /></Grid>
    </Grid>
  );
};

