import React from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { AdminRow } from '@/features/admin/services/zonalAdminService';
import { useUI } from '@/contexts/UIContext';
import { adminUsersService } from '@/features/admin/services/adminUsersService';

interface Props {
  rows: AdminRow[];
  scope: 'woreda' | 'city';
  onChanged?: () => void;
}

export const AdminsList: React.FC<Props> = ({ rows, scope, onChanged }) => {
  const { language } = useUI();
  const isAmharic = language === 'am';
  const t = (en: string, am: string) => (isAmharic ? am : en);
  const locationLabel = scope === 'woreda' ? t('Woreda', 'ወረዳ') : t('City', 'ከተማ');
  const [editing, setEditing] = React.useState<AdminRow | null>(null);
  const [fullName, setFullName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [resetPassword, setResetPassword] = React.useState<{ email: string; tempPassword: string } | null>(null);

  const openEdit = (row: AdminRow) => {
    setEditing(row);
    setFullName(row.full_name || '');
    setPhone((row as any).phone || '');
  };

  const closeEdit = () => {
    setEditing(null);
    setFullName('');
    setPhone('');
  };

  return (
    <>
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
                    <Button size="small" variant="outlined" onClick={() => openEdit(row)}>
                      {t('Edit', 'አስተካክል')}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="warning"
                      disabled={busyId === row.id}
                      onClick={async () => {
                        try {
                          setBusyId(row.id);
                          await adminUsersService.setUserStatus(row.id, false);
                          onChanged?.();
                        } finally {
                          setBusyId(null);
                        }
                      }}
                    >
                      {t('Suspend', 'አግድ')}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="secondary"
                      disabled={busyId === row.id}
                      onClick={async () => {
                        try {
                          setBusyId(row.id);
                          const r = await adminUsersService.resetPassword(row.id);
                          setResetPassword({ email: r.user.email, tempPassword: r.tempPassword });
                        } finally {
                          setBusyId(null);
                        }
                      }}
                    >
                      {t('Reset Password', 'የይለፍ ቃል ዳግም አዘጋጅ')}
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={Boolean(editing)} onClose={closeEdit} maxWidth="sm" fullWidth>
        <DialogTitle>{t('Edit admin', 'አስተዳዳሪ አስተካክል')}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t('Full name', 'ሙሉ ስም')}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            sx={{ mt: 1 }}
          />
          <TextField
            fullWidth
            label={t('Phone (optional)', 'ስልክ (አማራጭ)')}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {t('Email cannot be edited here for safety.', 'ኢሜይል እዚህ ላይ ማስተካከል አይቻልም።')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit}>{t('Cancel', 'ሰርዝ')}</Button>
          <Button
            variant="contained"
            disabled={!editing || busyId === editing?.id}
            onClick={async () => {
              if (!editing) return;
              try {
                setBusyId(editing.id);
                await adminUsersService.updateUser(editing.id, { fullName: fullName.trim(), phone: phone.trim() || null });
                closeEdit();
                onChanged?.();
              } finally {
                setBusyId(null);
              }
            }}
          >
            {t('Save', 'አስቀምጥ')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(resetPassword)} onClose={() => setResetPassword(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('Temporary password', 'ጊዜያዊ የይለፍ ቃል')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>{t('Email', 'ኢሜይል')}:</strong> {resetPassword?.email}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>{t('Temp password', 'ጊዜያዊ የይለፍ ቃል')}:</strong> {resetPassword?.tempPassword}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetPassword(null)}>{t('Close', 'ዝጋ')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
