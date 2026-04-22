import React from 'react';
import { Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

export interface FacilityAdminRow {
  id: string;
  full_name: string;
  email: string;
  facility_name?: string;
  official_title?: string;
  is_active: boolean;
  created_at: string;
}

interface Props {
  rows: FacilityAdminRow[];
}

export const FacilityAdminsList: React.FC<Props> = ({ rows }) => (
  <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider' }}>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Facility</TableCell>
          <TableCell>Admin Name</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Title</TableCell>
          <TableCell>Created</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.facility_name || '-'}</TableCell>
            <TableCell>{row.full_name}</TableCell>
            <TableCell>{row.email}</TableCell>
            <TableCell>{row.official_title || '-'}</TableCell>
            <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
            <TableCell>
              <Chip size="small" color={row.is_active ? 'success' : 'default'} label={row.is_active ? 'Active' : 'Suspended'} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);
