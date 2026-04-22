import React from 'react';
import { Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

interface Props {
  rows: any[];
}

export const DoctorsList: React.FC<Props> = ({ rows }) => (
  <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider' }}>
    <Table size="small">
      <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Specialization</TableCell><TableCell>Department</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.id}>
            <TableCell>{r.full_name}</TableCell>
            <TableCell>{r.email}</TableCell>
            <TableCell>{r.specialization}</TableCell>
            <TableCell>{r.department}</TableCell>
            <TableCell><Chip size="small" color={r.is_active ? 'success' : 'default'} label={r.is_active ? 'Active' : 'Suspended'} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);
