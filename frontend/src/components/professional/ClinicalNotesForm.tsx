import React from 'react';
import { Grid, TextField } from '@mui/material';

interface ClinicalNotesFormProps {
  value: Record<string, any>;
  onChange: (next: Record<string, any>) => void;
}

export const ClinicalNotesForm: React.FC<ClinicalNotesFormProps> = ({ value, onChange }) => {
  const set = (k: string, v: string) => onChange({ ...value, [k]: v });
  return (
    <Grid container spacing={1}>
      <Grid item xs={12}><TextField fullWidth multiline minRows={2} label="Subjective" value={value.subjective || ''} onChange={(e) => set('subjective', e.target.value)} /></Grid>
      <Grid item xs={12}><TextField fullWidth multiline minRows={2} label="Objective" value={value.objective || ''} onChange={(e) => set('objective', e.target.value)} /></Grid>
      <Grid item xs={12}><TextField fullWidth multiline minRows={2} label="Assessment" value={value.assessment || ''} onChange={(e) => set('assessment', e.target.value)} /></Grid>
      <Grid item xs={12}><TextField fullWidth multiline minRows={2} label="Plan" value={value.plan || ''} onChange={(e) => set('plan', e.target.value)} /></Grid>
      <Grid item xs={12}><TextField fullWidth multiline minRows={2} label="Additional Notes" value={value.additionalNotes || ''} onChange={(e) => set('additionalNotes', e.target.value)} /></Grid>
    </Grid>
  );
};

