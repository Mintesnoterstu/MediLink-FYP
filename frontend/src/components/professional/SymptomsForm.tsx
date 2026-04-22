import React from 'react';
import { Grid, TextField } from '@mui/material';

interface SymptomsFormProps {
  value: Record<string, any>;
  onChange: (next: Record<string, any>) => void;
}

export const SymptomsForm: React.FC<SymptomsFormProps> = ({ value, onChange }) => {
  const set = (k: string, v: string) => onChange({ ...value, [k]: v });
  return (
    <Grid container spacing={1}>
      <Grid item xs={12}><TextField fullWidth multiline minRows={2} label="Chief Complaint" value={value.chiefComplaint || ''} onChange={(e) => set('chiefComplaint', e.target.value)} /></Grid>
      <Grid item xs={12}><TextField fullWidth label="Presenting Symptoms (comma separated)" value={value.presentingSymptoms || ''} onChange={(e) => set('presentingSymptoms', e.target.value)} /></Grid>
      <Grid item xs={12} md={6}><TextField fullWidth label="Symptom Duration" value={value.duration || ''} onChange={(e) => set('duration', e.target.value)} /></Grid>
      <Grid item xs={12} md={6}><TextField fullWidth label="Severity (Mild/Moderate/Severe)" value={value.severity || ''} onChange={(e) => set('severity', e.target.value)} /></Grid>
      <Grid item xs={12}><TextField fullWidth multiline minRows={2} label="Other Symptoms" value={value.otherSymptoms || ''} onChange={(e) => set('otherSymptoms', e.target.value)} /></Grid>
    </Grid>
  );
};

