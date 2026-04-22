import React from 'react';
import {
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { AdminRow } from '@/features/admin/services/zonalAdminService';

interface Props {
  rows: AdminRow[];
  scope: 'woreda' | 'city';
}

export const AdminsList: React.FC<Props> = ({ rows, scope }) => {
  const locationLabel = scope === 'woreda' ? 'Woreda' : 'City';

  return (
    <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{locationLabel}</TableCell>
            <TableCell>Admin Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>
                <Typography variant="body2" color="text.secondary">
                  No admins found.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{scope === 'woreda' ? row.woreda_name : row.city || 'Jimma City'}</TableCell>
                <TableCell>{row.full_name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip size="small" color={row.is_active ? 'success' : 'default'} label={row.is_active ? 'Active' : 'Suspended'} />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    <Button size="small" variant="outlined">Edit</Button>
                    <Button size="small" variant="outlined" color="warning">Suspend</Button>
                    <Button size="small" variant="outlined" color="secondary">Reset Password</Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
