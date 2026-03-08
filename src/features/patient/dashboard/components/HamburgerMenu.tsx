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
  Stack,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import { useUI } from '@/contexts/UIContext';
import { useAuth } from '@/contexts/AuthContext';
import { PatientSectionId } from '../types';
import { useNavigate } from 'react-router-dom';

interface HamburgerMenuProps {
  activeSection: PatientSectionId;
  isOpen: boolean;
  onClose: () => void;
  onSectionChange: (section: PatientSectionId) => void;
}

const SECTION_CONFIG: Array<{
  id: PatientSectionId;
  icon: string;
  labelEn: string;
  labelAm: string;
}> = [
  { id: 'records', icon: '📋', labelEn: 'My Records', labelAm: 'የእኔ መዝገቦች' },
  { id: 'consent', icon: '🔐', labelEn: 'Consent Management', labelAm: 'ፈቃድ አስተዳደር' },
  { id: 'history', icon: '👁️', labelEn: 'Access History', labelAm: 'የመዳረሻ ታሪክ' },
  { id: 'medications', icon: '💊', labelEn: 'Medications', labelAm: 'መድሀኒቶች' },
  { id: 'appointments', icon: '📅', labelEn: 'Appointments', labelAm: 'ቀጠሮዎች' },
  { id: 'doctors', icon: '🏥', labelEn: 'My Doctors', labelAm: 'የእኔ ሐኪሞች' },
  { id: 'summary', icon: '⚕️', labelEn: 'Health Summary', labelAm: 'የጤና ማጠቃለያ' },
  { id: 'settings', icon: '⚙️', labelEn: 'Settings', labelAm: 'ቅንብሮች' },
];

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  activeSection,
  isOpen,
  onClose,
  onSectionChange,
}) => {
  const { language } = useUI();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAmharic = language === 'am';

  const handleSectionClick = (id: PatientSectionId) => {
    onSectionChange(id);
    onClose();
  };

  const name = user?.name || 'Guest';
  const healthId = 'ETH-2026-0115-AB123';

  return (
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '80%', sm: 360 }, p: 2, display: 'flex', flexDirection: 'column' },
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="subtitle1" fontWeight={700}>
          {isAmharic ? 'የታካሚ ዳሽቦርድ ምናሌ' : 'Patient Dashboard Menu'}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 1 }} />

      <List sx={{ flexGrow: 1 }}>
        <ListItemButton
          onClick={() => {
            navigate('/');
            onClose();
          }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <span aria-hidden="true">🏠</span>
          </ListItemIcon>
          <ListItemText primary={isAmharic ? 'ዋና ገጽ' : 'Home'} />
        </ListItemButton>

        <Divider sx={{ my: 1 }} />

        {SECTION_CONFIG.map((item) => (
          <ListItemButton
            key={item.id}
            selected={activeSection === item.id}
            onClick={() => handleSectionClick(item.id)}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <span aria-hidden="true">{item.icon}</span>
            </ListItemIcon>
            <ListItemText primary={isAmharic ? item.labelAm : item.labelEn} />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ my: 1 }} />

      <Box>
        <Box mb={1}>
          <Typography variant="body2" fontWeight={700}>
            {name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {isAmharic ? 'መታወቂያ፡ ' : 'ID: '}
            {healthId}
          </Typography>
        </Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Button
            size="small"
            startIcon={<LogoutIcon fontSize="small" />}
            onClick={logout}
            color="error"
          >
            {isAmharic ? 'ውጣ' : 'Logout'}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

