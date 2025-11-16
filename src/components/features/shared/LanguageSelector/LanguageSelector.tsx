import React, { useEffect } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Chip, Box } from '@mui/material';
import { Language as LanguageIcon, CheckCircle } from '@mui/icons-material';
import { useUI } from '@/contexts/UIContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', rtl: false },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', rtl: false },
  // Future languages
  // { code: 'om', name: 'Oromo', nativeName: 'Afaan Oromoo', rtl: false },
  // { code: 'ti', name: 'Tigrinya', nativeName: 'ትግርኛ', rtl: false },
];

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useUI();
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const currentLanguage = languages.find((lang) => lang.code === language) || languages[0];
  const isRTL = currentLanguage.rtl;

  useEffect(() => {
    // Apply RTL/LTR direction
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    // Update user language preference if logged in
    if (user?.language && user.language !== language) {
      // In production, this would update the user's language preference in the backend
    }
  }, [language, isRTL, user]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = async (lang: 'en' | 'am') => {
    try {
      await i18n.changeLanguage(lang);
      setLanguage(lang);
      
      // Persist language preference
      localStorage.setItem('medilink-language', lang);
      
      handleClose();
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  return (
    <>
      <Box display="flex" alignItems="center" gap={1}>
        <IconButton color="inherit" onClick={handleClick} title={currentLanguage.nativeName}>
          <LanguageIcon />
        </IconButton>
        {currentLanguage.code !== 'en' && (
          <Chip
            label={currentLanguage.code.toUpperCase()}
            size="small"
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          />
        )}
      </Box>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            selected={language === lang.code}
            onClick={() => handleLanguageChange(lang.code as 'en' | 'am')}
          >
            <ListItemIcon>
              {language === lang.code && <CheckCircle color="primary" fontSize="small" />}
            </ListItemIcon>
            <ListItemText
              primary={lang.nativeName}
              secondary={lang.name}
            />
            {lang.rtl && (
              <Chip label="RTL" size="small" sx={{ ml: 1 }} />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

