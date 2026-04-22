import React from 'react';
import { Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useUI } from '@/contexts/UIContext';

interface Props {
  rows: any[];
}

export const NursesList: React.FC<Props> = ({ rows }) => {
  const { language } = useUI();
  const isAmharic = language === 'am';
  return (
    <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{isAmharic ? 'ስም' : 'Name'}</TableCell>
            <TableCell>{isAmharic ? 'ኢሜይል' : 'Email'}</TableCell>
            <TableCell>{isAmharic ? 'ዲፓርትመንት' : 'Department'}</TableCell>
            <TableCell>{isAmharic ? 'ሁኔታ' : 'Status'}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.full_name}</TableCell>
              <TableCell>{r.email}</TableCell>
              <TableCell>{r.department}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  color={r.is_active ? 'success' : 'default'}
                  label={r.is_active ? (isAmharic ? 'ንቁ' : 'Active') : isAmharic ? 'የታገደ' : 'Suspended'}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
