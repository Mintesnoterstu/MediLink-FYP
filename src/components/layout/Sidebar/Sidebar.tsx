import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Toolbar } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  Dashboard,
  LocalHospital,
  Medication,
  CalendarToday,
  Person,
  Settings,
  ExitToApp,
} from '@mui/icons-material';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  drawerWidth?: number;
}

const drawerWidth = 280;

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const patientMenuItems = [
    { text: t('dashboard.title'), icon: <Dashboard />, path: '/dashboard' },
    { text: t('symptoms.title'), icon: <LocalHospital />, path: '/symptoms' },
    { text: t('medications.title'), icon: <Medication />, path: '/medications' },
    { text: t('appointments.title'), icon: <CalendarToday />, path: '/appointments' },
    { text: t('common.profile'), icon: <Person />, path: '/profile' },
  ];

  const providerMenuItems = [
    { text: t('dashboard.title'), icon: <Dashboard />, path: '/provider/dashboard' },
    { text: 'Patients', icon: <Person />, path: '/provider/patients' },
    { text: 'Records', icon: <LocalHospital />, path: '/provider/records' },
  ];

  const menuItems = user?.role === 'patient' ? patientMenuItems : providerMenuItems;

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider sx={{ my: 1 }} />
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavigation('/settings')}>
            <ListItemIcon>
              <Settings />
            </ListItemIcon>
            <ListItemText primary={t('common.settings')} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText primary={t('auth.logout')} />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

