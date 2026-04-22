import React from 'react';
import { Card, CardContent, Grid, Typography } from '@mui/material';

interface Props {
  stats: {
    totalFacilities: number;
    totalProfessionals: number;
    totalPatients: number;
  };
}

export const StatisticsCards: React.FC<Props> = ({ stats }) => (
  <Grid container spacing={2}>
    <Grid item xs={12} md={4}>
      <Card><CardContent><Typography variant="caption">Total Facilities</Typography><Typography variant="h5">{stats.totalFacilities}</Typography></CardContent></Card>
    </Grid>
    <Grid item xs={12} md={4}>
      <Card><CardContent><Typography variant="caption">Total Professionals</Typography><Typography variant="h5">{stats.totalProfessionals}</Typography></CardContent></Card>
    </Grid>
    <Grid item xs={12} md={4}>
      <Card><CardContent><Typography variant="caption">Total Patients</Typography><Typography variant="h5">{stats.totalPatients.toLocaleString()}+</Typography></CardContent></Card>
    </Grid>
  </Grid>
);
