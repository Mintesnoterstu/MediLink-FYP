import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Badge, TextField, InputAdornment, Menu, MenuItem, Avatar, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Notifications, Menu as MenuIcon, Search, LocalHospital as EmergencyIcon, Brightness4, Brightness7, Home, LocalHospital, Favorite, MenuBook, SmartToy, Login, PersonAdd, Info } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { LanguageSelector } from '@/components/features/shared/LanguageSelector/LanguageSelector';

interface UniversalHeaderProps {
  onMenuClick?: () => void;
  showSearch?: boolean;
  showQuickSymptomCheck?: boolean;
}

export const UniversalHeader: React.FC<UniversalHeaderProps> = ({
  onMenuClick,
  showSearch = true,
  showQuickSymptomCheck = true,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, theme, toggleTheme } = useUI();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    { label: t('nav.home'), path: '/', icon: <Home /> },
    { label: t('nav.diseases'), path: '/diseases', icon: <LocalHospital /> },
    { label: t('nav.symptoms'), path: '/symptom-checker', icon: <Favorite /> },
    { label: t('nav.traditional'), path: '/medicine-hub', icon: <MenuBook /> },
    { label: t('nav.ai'), path: '/about-ai', icon: <SmartToy /> },
    { label: t('nav.about'), path: '/about', icon: <Info /> },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
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

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <AppBar position="sticky" elevation={2}>
      <Toolbar sx={{ gap: 2 }}>
        {/* Left: Logo and Menu */}
        <IconButton
          edge="start"
          color="inherit"
          onClick={() => setMobileMenuOpen(true)}
          sx={{ mr: 1, display: { xs: 'block', md: onMenuClick ? 'block' : 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: 700, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          MediLink
        </Typography>

        {/* Center: Navigation and Search */}
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1, ml: 4 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              onClick={() => handleNavClick(item.path)}
              sx={{
                color: location.pathname === item.path ? 'primary.light' : 'inherit',
                fontWeight: location.pathname === item.path ? 600 : 400,
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* Search Bar */}
        {showSearch && (
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: { md: 0.5 }, maxWidth: 400 }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder={t('nav.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 1,
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              }}
            />
          </Box>
        )}

        {/* Right: Actions */}
        <Box display="flex" alignItems="center" gap={1}>
          {/* Quick Symptom Check (Collapsible) */}
          {showQuickSymptomCheck && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate('/symptom-checker')}
              sx={{
                display: { xs: 'none', lg: 'flex' },
                borderColor: 'rgba(255, 255, 255, 0.5)',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {t('nav.quickSymptomCheck')}
            </Button>
          )}

          {/* Language Selector */}
          <LanguageSelector />

          {/* Theme Toggle */}
          <IconButton color="inherit" onClick={toggleTheme}>
            {theme === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          {/* Emergency Button */}
          <IconButton
            color="error"
            onClick={() => navigate('/emergency')}
            sx={{
              bgcolor: 'rgba(255, 0, 0, 0.2)',
              '&:hover': { bgcolor: 'rgba(255, 0, 0, 0.3)' },
            }}
          >
            <EmergencyIcon />
          </IconButton>

          {/* Notifications */}
          {isAuthenticated && (
            <IconButton color="inherit">
              <Badge badgeContent={unreadCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          )}

          {/* Auth Buttons / User Menu */}
          {!isAuthenticated ? (
            <Box display="flex" gap={1}>
              <Button
                color="inherit"
                startIcon={<Login />}
                onClick={() => navigate('/login')}
              >
                {t('auth.login')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<PersonAdd />}
                onClick={() => navigate('/register')}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  color: 'white',
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
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={handleUserMenuClose}
              >
                <MenuItem onClick={() => { handleNavClick('/dashboard'); handleUserMenuClose(); }}>
                  {t('nav.dashboard')}
                </MenuItem>
                <MenuItem onClick={() => { handleNavClick('/profile'); handleUserMenuClose(); }}>
                  {t('nav.profile')}
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  {t('auth.logout')}
                </MenuItem>
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

