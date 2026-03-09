import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LanguageSelector } from '@/components/features/shared/LanguageSelector/LanguageSelector';
import { useDashboardMenu } from '@/features/patient/dashboard/context/DashboardMenuContext';
import logo from '@/assets/logo.png';

export const DashboardHeader: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const isPatient = user?.role === 'patient';
  const { openMenu } = useDashboardMenu();

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    navigate('/');
  };

  const handleNav = (path: string) => {
    navigate(path);
    handleUserMenuClose();
  };

  return (
    <AppBar
      position="sticky"
      elevation={2}
      sx={{
        background: 'linear-gradient(135deg, #1a365d 0%, #2c5282 50%, #2b6cb0 100%)',
      }}
    >
      <Toolbar sx={{ gap: { xs: 1, sm: 2 }, minHeight: { xs: 56, md: 64 }, px: { xs: 1, sm: 2 } }}>
        {/* Left: Hamburger + Logo */}
        <Box display="flex" alignItems="center" sx={{ gap: 1.5, flexShrink: 0 }}>
          {isPatient && (
            <IconButton edge="start" color="inherit" onClick={openMenu} sx={{ mr: 0.5 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Box
            onClick={() => navigate('/')}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
          >
            <Box
              component="img"
              src={logo}
              alt="MediLink logo"
              sx={{
                height: 32,
                width: 'auto',
                borderRadius: 1,
                bgcolor: 'rgba(255,255,255,0.1)',
                p: 0.5,
              }}
            />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
                MediLink
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                የጤና መረጃ
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Right: Language, Appointment, User */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, ml: 'auto', flexShrink: 0 }}>
          <LanguageSelector />

          {isAuthenticated && (
            <>
              <IconButton onClick={handleUserMenuClick} color="inherit">
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={handleUserMenuClose}
              >
                <MenuItem disabled>
                  <Box display="flex" flexDirection="column">
                    <Typography variant="subtitle2" fontWeight={600}>
                      👤 My Profile
                    </Typography>
                    {user?.name && (
                      <Typography variant="body2" color="text.secondary">
                        {user.name}
                      </Typography>
                    )}
                  </Box>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => handleNav('/dashboard')}>My Dashboard</MenuItem>
                <MenuItem onClick={() => handleNav('/symptoms')}>Health Diary</MenuItem>
                <MenuItem onClick={() => handleNav('/appointments')}>Appointments</MenuItem>
                <MenuItem onClick={() => handleNav('/dashboard/profile')}>Settings</MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
