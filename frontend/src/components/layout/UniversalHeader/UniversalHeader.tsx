import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Notifications,
  Menu as MenuIcon,
  Home,
  LocalHospital,
  Login,
  PersonAdd,
  Info,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { LanguageSelector } from '@/components/features/shared/LanguageSelector/LanguageSelector';
import logo from '@/assets/logo.png';

interface UniversalHeaderProps {
  onMenuClick?: () => void;
}

export const UniversalHeader: React.FC<UniversalHeaderProps> = ({
  onMenuClick,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications } = useUI();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const isDashboard = location.pathname.startsWith('/dashboard');

  const navItems = [
    { label: t('nav.home'), fallback: 'HOME', path: '/', icon: <Home /> },
    { label: t('nav.diseases'), fallback: 'DISEASE INFORMATION', path: '/diseases', icon: <LocalHospital /> },
    { label: t('nav.medicineHub'), fallback: 'MEDICINE HUB', path: '/medicine-hub', icon: <LocalHospital /> },
    { label: t('nav.about'), fallback: 'ABOUT', path: '/about', icon: <Info /> },
  ];

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

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <AppBar
      position="sticky"
      elevation={2}
      sx={{
        background: 'linear-gradient(135deg, #2C3E50 0%, #4A90E2 100%)',
      }}
    >
      <Toolbar sx={{ gap: { xs: 1, sm: 2 }, minHeight: { xs: 56, md: 64 }, px: { xs: 1, sm: 2 } }}>
        {/* Left: Logo, branding & menu */}
        <Box display="flex" alignItems="center" sx={{ gap: 1.5, flexShrink: 0 }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setMobileMenuOpen(true)}
            sx={{ mr: 0.5, display: { xs: 'block', md: onMenuClick ? 'block' : 'none' } }}
          >
            <MenuIcon />
          </IconButton>
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
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1, fontFamily: 'inherit', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                MediLink
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85, fontFamily: 'inherit' }}>
                የጤና መረጃ
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Center: Navigation (hidden on dashboard) */}
        {!isDashboard && (
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1, ml: 4 }}>
            {navItems.map((item) => {
              const label =
                !item.label || String(item.label).startsWith('nav.')
                  ? item.fallback
                  : String(item.label);
              return (
                <Button
                  key={item.path}
                  color="inherit"
                  onClick={() => handleNavClick(item.path)}
                  sx={{
                    fontFamily: 'inherit',
                    color: location.pathname === item.path ? 'white' : 'rgba(255, 255, 255, 0.9)',
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  {label}
                </Button>
              );
            })}
          </Box>
        )}

        {/* Right: Actions - kept on the right when responsive */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, ml: 'auto', flexShrink: 0 }}>
          {/* Language Selector */}
          <LanguageSelector />

          {/* Notifications */}
          {isAuthenticated && (
            <IconButton color="inherit">
              <Badge badgeContent={unreadCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          )}

          {/* Auth Buttons / User Profile Menu */}
          {!isAuthenticated ? (
            <Box display="flex" gap={1} flexWrap="nowrap">
              <Button
                color="inherit"
                startIcon={<Login />}
                onClick={() => navigate('/login')}
                sx={{ fontFamily: 'inherit', minWidth: { xs: 0, sm: 'auto' } }}
              >
                {t('auth.login')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<PersonAdd />}
                onClick={() => navigate('/register')}
                sx={{
                  fontFamily: 'inherit',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  color: 'white',
                  minWidth: { xs: 0, sm: 'auto' },
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {t('auth.register')}
              </Button>
            </Box>
          ) : (
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
                {/* My Profile header with user name */}
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
                <MenuItem
                  onClick={() => {
                    handleNavClick('/dashboard');
                    handleUserMenuClose();
                  }}
                >
                  My Dashboard
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleNavClick('/symptoms');
                    handleUserMenuClose();
                  }}
                >
                  Health Diary
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleNavClick('/dashboard');
                    handleUserMenuClose();
                  }}
                >
                  Providers
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleNavClick('/appointments');
                    handleUserMenuClose();
                  }}
                >
                  Appointments
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleNavClick('/dashboard/profile');
                    handleUserMenuClose();
                  }}
                >
                  Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ width: 250, pt: 2 }}>
          <List>
            {navItems.map((item) => (
              <ListItem
                key={item.path}
                button
                onClick={() => handleNavClick(item.path)}
                selected={location.pathname === item.path}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
          <Divider />
          {!isAuthenticated && (
            <List>
              <ListItem button onClick={() => handleNavClick('/login')}>
                <ListItemIcon><Login /></ListItemIcon>
                <ListItemText primary={t('auth.login')} />
              </ListItem>
              <ListItem button onClick={() => handleNavClick('/register')}>
                <ListItemIcon><PersonAdd /></ListItemIcon>
                <ListItemText primary={t('auth.register')} />
              </ListItem>
            </List>
          )}
        </Box>
      </Drawer>
    </AppBar>
  );
};