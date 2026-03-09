import React from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { useUI } from '@/contexts/UIContext';
import { UniversalHeader } from '@/components/layout/UniversalHeader/UniversalHeader';
import { Footer } from '@/components/layout';
import { darkTheme, lightTheme } from '@/features/shared/ui/theme';

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme: uiTheme } = useUI();
  const currentTheme = uiTheme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <UniversalHeader />
        <Box component="main" sx={{ flexGrow: 1 }}>
          {children}
        </Box>
        <Footer />
      </Box>
    </ThemeProvider>
  );
};

