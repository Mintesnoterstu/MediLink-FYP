import React, { useState, useMemo } from 'react';
import { Box, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Edit, Delete, Add, Search } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { HealthCard, PrimaryButton } from '@/components/ui';
import { User, UserRole } from '@/types';

interface UserManagementProps {
  users?: User[];
  onUserUpdate?: (user: User) => Promise<void>;
  onUserDelete?: (userId: string) => Promise<void>;
  onUserCreate?: (user: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
  onUserStatusChange?: (userId: string, active: boolean) => Promise<void>;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users = [],
  onUserUpdate,
  onUserDelete,
  onUserCreate,
  onUserStatusChange: _onUserStatusChange,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'patient',
    phone: '',
    language: 'en',
  });

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    
    const query = searchQuery.toLowerCase();
    return users.filter((user) => {
      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query) ||
        (user.phone && user.phone.includes(query))
      );
    });
  }, [users, searchQuery]);

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData(user);
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'patient',
        phone: '',
        language: 'en',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        await onUserUpdate?.({ ...editingUser, ...formData } as User);
      } else {
        await onUserCreate?.(formData as Omit<User, 'id' | 'createdAt'>);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm(t('admin.confirmDeleteUser'))) {
      try {
        await onUserDelete?.(userId);
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'provider':
        return 'info';
      case 'patient':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <HealthCard
        title={t('admin.userManagement')}
        action={
          <Button
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            variant="outlined"
            size="small"
          >
            {t('admin.addUser')}
          </Button>
        }
      >
        <TextField
          fullWidth
          placeholder={t('admin.searchUsers')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ mb: 2 }}
        />

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('admin.name')}</TableCell>
                <TableCell>{t('admin.email')}</TableCell>
                <TableCell>{t('admin.role')}</TableCell>
                <TableCell>{t('admin.phone')}</TableCell>
                <TableCell>{t('admin.language')}</TableCell>
                <TableCell>{t('admin.createdAt')}</TableCell>
                <TableCell align="right">{t('admin.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" py={2}>
                      {t('admin.noUsers')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip label={user.role} size="small" color={getRoleColor(user.role)} />
                    </TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>
                      <Chip label={user.language.toUpperCase()} size="small" />
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(user)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(user.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </HealthCard>

      {/* User Edit/Create Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? t('admin.editUser') : t('admin.addUser')}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t('admin.name')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label={t('admin.email')}
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            margin="normal"
            required
            disabled={!!editingUser}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>{t('admin.role')}</InputLabel>
            <Select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              label={t('admin.role')}
            >
              <MenuItem value="patient">{t('admin.patient')}</MenuItem>
              <MenuItem value="provider">{t('admin.provider')}</MenuItem>
              <MenuItem value="admin">{t('admin.admin')}</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label={t('admin.phone')}
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>{t('admin.language')}</InputLabel>
            <Select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value as 'en' | 'am' })}
              label={t('admin.language')}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="am">አማርኛ</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
          <PrimaryButton onClick={handleSubmit}>
            {t('common.save')}
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
