import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Badge } from '@mui/material';
import { Notifications, AccountCircle, Menu as MenuIcon } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '@/components/features/shared/LanguageSelector/LanguageSelector';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { notifications } = useUI();
  const { t: _t } = useTranslation();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppBar 
      position="sticky" 
      elevation={2}
      sx={{
        background: 'linear-gradient(135deg, #25C0D3 0%, #537C89 100%)',
      }}
    >
      <Toolbar>
        {onMenuClick && (
          <IconButton edge="start" color="inherit" onClick={onMenuClick} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
          MediLink
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <LanguageSelector />
          <IconButton color="inherit">
            <Badge badgeContent={unreadCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          <IconButton color="inherit">
            <AccountCircle />
          </IconButton>
          {user && (
            <Typography variant="body2" sx={{ ml: 1 }}>
              {user.name}
            </Typography>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

