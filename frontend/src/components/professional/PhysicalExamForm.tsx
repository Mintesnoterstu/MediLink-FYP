import React from 'react';
import { Grid, TextField } from '@mui/material';

interface PhysicalExamFormProps {
  value: Record<string, any>;
  onChange: (next: Record<string, any>) => void;
}

export const PhysicalExamForm: React.FC<PhysicalExamFormProps> = ({ value, onChange }) => {
  const set = (k: string, v: string) => onChange({ ...value, [k]: v });
  return (
    <Grid container spacing={1}>
      <Grid item xs={12} md={6}><TextField fullWidth label="General Appearance" value={value.generalAppearance || ''} onChange={(e) => set('generalAppearance', e.target.value)} /></Grid>
      <Grid item xs={12} md={6}><TextField fullWidth label="Cardiovascular" value={value.cardiovascular || ''} onChange={(e) => set('cardiovascular', e.target.value)} /></Grid>
      <Grid item xs={12} md={6}><TextField fullWidth label="Respiratory" value={value.respiratory || ''} onChange={(e) => set('respiratory', e.target.value)} /></Grid>
      <Grid item xs={12} md={6}><TextField fullWidth label="Abdominal" value={value.abdominal || ''} onChange={(e) => set('abdominal', e.target.value)} /></Grid>
      <Grid item xs={12} md={6}><TextField fullWidth label="Neurological" value={value.neurological || ''} onChange={(e) => set('neurological', e.target.value)} /></Grid>
      <Grid item xs={12} md={6}><TextField fullWidth label="Musculoskeletal" value={value.musculoskeletal || ''} onChange={(e) => set('musculoskeletal', e.target.value)} /></Grid>
      <Grid item xs={12} md={6}><TextField fullWidth label="Skin" value={value.skin || ''} onChange={(e) => set('skin', e.target.value)} /></Grid>
      <Grid item xs={12}><TextField fullWidth multiline minRows={2} label="Other Findings" value={value.otherFindings || ''} onChange={(e) => set('otherFindings', e.target.value)} /></Grid>
    </Grid>
  );
};

