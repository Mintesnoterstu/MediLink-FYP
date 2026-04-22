import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

interface Props {
  rows: any[];
}

export const PatientsList: React.FC<Props> = ({ rows }) => (
  <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider' }}>
    <Table size="small">
      <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Ethiopian Health ID</TableCell><TableCell>Phone</TableCell><TableCell>Gender</TableCell><TableCell>Registered</TableCell></TableRow></TableHead>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.id}>
            <TableCell>{r.full_name}</TableCell>
            <TableCell>{r.ethiopian_health_id}</TableCell>
            <TableCell>{r.phone || '-'}</TableCell>
            <TableCell>{r.gender}</TableCell>
            <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);
