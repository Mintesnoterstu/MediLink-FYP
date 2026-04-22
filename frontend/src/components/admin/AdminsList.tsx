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
import { useUI } from '@/contexts/UIContext';

interface Props {
  rows: AdminRow[];
  scope: 'woreda' | 'city';
}

export const AdminsList: React.FC<Props> = ({ rows, scope }) => {
  const { language } = useUI();
  const isAmharic = language === 'am';
  const t = (en: string, am: string) => (isAmharic ? am : en);
  const locationLabel = scope === 'woreda' ? t('Woreda', 'ወረዳ') : t('City', 'ከተማ');

  return (
    <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{locationLabel}</TableCell>
            <TableCell>{t('Admin Name', 'የአስተዳዳሪ ስም')}</TableCell>
            <TableCell>{t('Email', 'ኢሜይል')}</TableCell>
            <TableCell>{t('Created', 'የተፈጠረበት')}</TableCell>
            <TableCell>{t('Status', 'ሁኔታ')}</TableCell>
            <TableCell>{t('Actions', 'እርምጃዎች')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>
                <Typography variant="body2" color="text.secondary">
                  {t('No admins found.', 'አስተዳዳሪ አልተገኘም።')}
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
                  <Chip size="small" color={row.is_active ? 'success' : 'default'} label={row.is_active ? t('Active', 'ንቁ') : t('Suspended', 'የታገደ')} />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    <Button size="small" variant="outlined">{t('Edit', 'አስተካክል')}</Button>
                    <Button size="small" variant="outlined" color="warning">{t('Suspend', 'አግድ')}</Button>
                    <Button size="small" variant="outlined" color="secondary">{t('Reset Password', 'የይለፍ ቃል ዳግም አዘጋጅ')}</Button>
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
