import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

export interface FacilityRow {
  id: string;
  name: string;
  type: string;
  license_number: string;
  contact_phone?: string;
  contact_email?: string;
  created_at?: string;
  facility_admin_name?: string;
}

interface Props {
  rows: FacilityRow[];
}

export const FacilitiesList: React.FC<Props> = ({ rows }) => (
  <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider' }}>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Facility</TableCell>
          <TableCell>Type</TableCell>
          <TableCell>License</TableCell>
          <TableCell>Phone</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Admin</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.type}</TableCell>
            <TableCell>{row.license_number}</TableCell>
            <TableCell>{row.contact_phone || '-'}</TableCell>
            <TableCell>{row.contact_email || '-'}</TableCell>
            <TableCell>{row.facility_admin_name || '-'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);
