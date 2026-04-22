import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useUI } from '@/contexts/UIContext';

interface Props {
  rows: any[];
}

export const PatientsList: React.FC<Props> = ({ rows }) => {
  const { language } = useUI();
  const isAmharic = language === 'am';
  return (
    <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{isAmharic ? 'ስም' : 'Name'}</TableCell>
            <TableCell>{isAmharic ? 'የኢትዮጵያ የጤና መታወቂያ' : 'Ethiopian Health ID'}</TableCell>
            <TableCell>{isAmharic ? 'ስልክ' : 'Phone'}</TableCell>
            <TableCell>{isAmharic ? 'ጾታ' : 'Gender'}</TableCell>
            <TableCell>{isAmharic ? 'የተመዘገበበት' : 'Registered'}</TableCell>
          </TableRow>
        </TableHead>
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
};
