import React from 'react';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
  Home,
  ManageAccounts,
  BarChart,
  Assignment,
  Settings,
  HelpOutline,
  Logout as LogoutIcon,
  LocalHospital,
  Groups,
  PersonAdd,
} from '@mui/icons-material';
import { useUI } from '@/contexts/UIContext';

export type AdminHamburgerVariant = 'zonal' | 'woreda_city' | 'facility';

export type AdminHamburgerAction =
  | 'dashboard'
  | 'admin_management'
  | 'facility_management'
  | 'doctor_management'
  | 'nurse_management'
  | 'patient_registration'
  | 'statistics'
  | 'audit'
  | 'settings'
  | 'help'
  | 'logout';

type MenuEntry = {
  action: AdminHamburgerAction;
  icon: React.ReactNode;
  labelEn: string;
  labelAm: string;
};

const ZONAL_ITEMS: MenuEntry[] = [
  { action: 'dashboard', icon: <Home />, labelEn: 'Dashboard', labelAm: 'ዳሽቦርድ' },
  { action: 'admin_management', icon: <ManageAccounts />, labelEn: 'Admin Management', labelAm: 'የአስተዳዳሪ አስተዳደር' },
  { action: 'statistics', icon: <BarChart />, labelEn: 'Statistics', labelAm: 'ስታቲስቲክስ' },
  { action: 'audit', icon: <Assignment />, labelEn: 'Audit Logs', labelAm: 'የኦዲት መዝገብ' },
  { action: 'settings', icon: <Settings />, labelEn: 'Settings', labelAm: 'ቅንብሮች' },
  { action: 'help', icon: <HelpOutline />, labelEn: 'Help', labelAm: 'እርዳታ' },
  { action: 'logout', icon: <LogoutIcon />, labelEn: 'Logout', labelAm: 'ውጣ' },
];

const WOREDA_CITY_ITEMS: MenuEntry[] = [
  { action: 'dashboard', icon: <Home />, labelEn: 'Dashboard', labelAm: 'ዳሽቦርድ' },
  { action: 'facility_management', icon: <LocalHospital />, labelEn: 'Facility Management', labelAm: 'የተቋም አስተዳደር' },
  { action: 'statistics', icon: <BarChart />, labelEn: 'Statistics', labelAm: 'ስታቲስቲክስ' },
  { action: 'audit', icon: <Assignment />, labelEn: 'Audit Logs', labelAm: 'የኦዲት መዝገብ' },
  { action: 'settings', icon: <Settings />, labelEn: 'Settings', labelAm: 'ቅንብሮች' },
  { action: 'help', icon: <HelpOutline />, labelEn: 'Help', labelAm: 'እርዳታ' },
  { action: 'logout', icon: <LogoutIcon />, labelEn: 'Logout', labelAm: 'ውጣ' },
];

const FACILITY_ITEMS: MenuEntry[] = [
  { action: 'dashboard', icon: <Home />, labelEn: 'Dashboard', labelAm: 'ዳሽቦርድ' },
  { action: 'doctor_management', icon: <Groups />, labelEn: 'Doctor Management', labelAm: 'የሐኪም አስተዳደር' },
  { action: 'nurse_management', icon: <Groups />, labelEn: 'Nurse Management', labelAm: 'የነርስ አስተዳደር' },
  { action: 'patient_registration', icon: <PersonAdd />, labelEn: 'Patient Registration', labelAm: 'የታካሚ ምዝገባ' },
  { action: 'statistics', icon: <BarChart />, labelEn: 'Statistics', labelAm: 'ስታቲስቲክስ' },
  { action: 'audit', icon: <Assignment />, labelEn: 'Audit Logs', labelAm: 'የኦዲት መዝገብ' },
  { action: 'settings', icon: <Settings />, labelEn: 'Settings', labelAm: 'ቅንብሮች' },
  { action: 'help', icon: <HelpOutline />, labelEn: 'Help', labelAm: 'እርዳታ' },
  { action: 'logout', icon: <LogoutIcon />, labelEn: 'Logout', labelAm: 'ውጣ' },
];

function itemsForVariant(variant: AdminHamburgerVariant): MenuEntry[] {
  switch (variant) {
    case 'zonal':
      return ZONAL_ITEMS;
    case 'woreda_city':
      return WOREDA_CITY_ITEMS;
    case 'facility':
      return FACILITY_ITEMS;
    default:
      return ZONAL_ITEMS;
  }
}

interface AdminHamburgerMenuProps {
  variant: AdminHamburgerVariant;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (action: AdminHamburgerAction) => void;
  userName?: string;
  roleLabel: string;
}

export const AdminHamburgerMenu: React.FC<AdminHamburgerMenuProps> = ({
  variant,
  isOpen,
  onClose,
  onSelect,
  userName,
  roleLabel,
}) => {
  const { language } = useUI();
  const isAmharic = language === 'am';
  const items = itemsForVariant(variant);

  const handleClick = (action: AdminHamburgerAction) => {
    onSelect(action);
    onClose();
  };

  return (
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '85%', sm: 320 },
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#2C3E50',
          color: 'common.white',
        },
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="subtitle1" fontWeight={700}>
          {isAmharic ? 'የአስተዳዳሪ ምናሌ' : 'Admin Menu'}
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: 'common.white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 1 }} />

      <Box mb={1}>
        <Typography variant="body2" fontWeight={700}>
          {userName || '—'}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.85 }}>
          {roleLabel}
        </Typography>
      </Box>

      <List sx={{ flexGrow: 1, py: 0 }}>
        {items.map((item) => (
          <ListItemButton
            key={item.action}
            onClick={() => handleClick(item.action)}
            sx={{
              py: 1.1,
              borderRadius: 1,
              mb: 0.25,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
            }}
          >
            <ListItemIcon sx={{ color: 'common.white', minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={isAmharic ? item.labelAm : item.labelEn} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
};
