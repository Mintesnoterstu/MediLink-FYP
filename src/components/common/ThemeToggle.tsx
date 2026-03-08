import React from 'react';
import { IconButton, IconButtonProps } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useUI } from '@/features/shared/ui/context/UIContext';

export const ThemeToggle: React.FC<IconButtonProps> = (props) => {
  const { theme, toggleTheme } = useUI();

  return (
    <IconButton color="inherit" onClick={toggleTheme} {...props}>
      {theme === 'dark' ? <Brightness7 /> : <Brightness4 />}
    </IconButton>
  );
};

