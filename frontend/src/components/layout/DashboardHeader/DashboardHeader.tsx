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
import { Menu as MenuIcon, Dashboard as DashboardIcon, HelpOutline, Settings as SettingsIcon, EventAvailable } from '@mui/icons-material';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LanguageSelector } from '@/components/features/shared/LanguageSelector/LanguageSelector';
import { useDashboardMenu } from '@/features/patient/dashboard/context/DashboardMenuContext';
import logo from '@/assets/logo.png';
import { useUI } from '@/contexts/UIContext';

export const DashboardHeader: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { language } = useUI();
  const navigate = useNavigate();
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const isPatient = user?.role === 'patient';
  const { openMenu } = useDashboardMenu();
  const isAmharic = language === 'am';
  const handleDrawerOpen = () => {
    if (isPatient) {
      openMenu();
      return;
    }
    window.dispatchEvent(new CustomEvent('open-role-dashboard-menu'));
  };

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

  const role = user?.role;
  const dashboardLabel =
    role === 'admin'
      ? (isAmharic ? 'የአስተዳዳሪ ዳሽቦርድ' : 'Admin Dashboard')
      : role === 'provider'
      ? (isAmharic ? 'የባለሙያ ዳሽቦርድ' : 'My Dashboard')
      : (isAmharic ? 'የእኔ ዳሽቦርድ' : 'My Dashboard');

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
          {isAuthenticated && (
            <IconButton edge="start" color="inherit" onClick={handleDrawerOpen} sx={{ mr: 0.5 }}>
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
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, lineHeight: 1, fontSize: { xs: '0.95rem', sm: '1.25rem' } }}
              >
                MediLink
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85, display: { xs: 'none', sm: 'block' } }}>
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
              <IconButton color="inherit" onClick={() => navigate('/dashboard')} title={dashboardLabel} aria-label={dashboardLabel}>
                <DashboardIcon />
              </IconButton>
              <IconButton
                color="inherit"
                onClick={() => navigate(role === 'patient' ? '/dashboard/appointments' : '/dashboard')}
                title={isAmharic ? 'ቀጠሮዎች' : 'Appointments'}
                aria-label={isAmharic ? 'ቀጠሮዎች' : 'Appointments'}
              >
                <EventAvailable />
              </IconButton>
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
                      {isAmharic ? '👤 መለያ' : '👤 Profile'}
                    </Typography>
                    {user?.name && (
                      <Typography variant="body2" color="text.secondary">
                        {user.name}
                      </Typography>
                    )}
                    {role && (
                      <Typography variant="caption" color="text.secondary">
                        {isAmharic ? 'ሚና፡ ' : 'Role: '}
                        <strong>{role}</strong>
                      </Typography>
                    )}
                  </Box>
                </MenuItem>
                <Divider />

                <MenuItem onClick={() => handleNav('/dashboard')}>{dashboardLabel}</MenuItem>

                {role === 'provider' && (
                  <MenuItem onClick={() => handleNav('/dashboard')}>
                    {isAmharic ? 'የጊዜ ሰሌዳዬ' : 'My Schedule'}
                  </MenuItem>
                )}

                <MenuItem onClick={() => handleNav('/dashboard/profile')}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <SettingsIcon fontSize="small" />
                    <span>
                      {role === 'admin'
                        ? isAmharic
                          ? 'የስርዓት ቅንብሮች'
                          : 'System Settings'
                        : isAmharic
                        ? 'ቅንብሮች'
                        : 'Settings'}
                    </span>
                  </Box>
                </MenuItem>

                <MenuItem onClick={() => handleNav('/help')}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <HelpOutline fontSize="small" />
                    <span>{isAmharic ? 'እርዳታ' : 'Help'}</span>
                  </Box>
                </MenuItem>
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
