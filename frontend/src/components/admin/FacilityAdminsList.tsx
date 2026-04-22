import React from 'react';
import { Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useUI } from '@/contexts/UIContext';

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

export const FacilityAdminsList: React.FC<Props> = ({ rows }) => {
  const { language } = useUI();
  const isAmharic = language === 'am';
  return (
    <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{isAmharic ? 'ተቋም' : 'Facility'}</TableCell>
            <TableCell>{isAmharic ? 'የአስተዳዳሪ ስም' : 'Admin Name'}</TableCell>
            <TableCell>{isAmharic ? 'ኢሜይል' : 'Email'}</TableCell>
            <TableCell>{isAmharic ? 'መደብ' : 'Title'}</TableCell>
            <TableCell>{isAmharic ? 'የተፈጠረበት' : 'Created'}</TableCell>
            <TableCell>{isAmharic ? 'ሁኔታ' : 'Status'}</TableCell>
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
                <Chip
                  size="small"
                  color={row.is_active ? 'success' : 'default'}
                  label={row.is_active ? (isAmharic ? 'ንቁ' : 'Active') : isAmharic ? 'የታገደ' : 'Suspended'}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
