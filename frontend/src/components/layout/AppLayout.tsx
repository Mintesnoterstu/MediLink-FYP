import React, { useState } from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { useUI } from '@/contexts/UIContext';
import { useLocation } from 'react-router-dom';
import { Sidebar, Footer } from '@/components/layout';
import { UniversalHeader } from '@/components/layout/UniversalHeader/UniversalHeader';
import { DashboardHeader } from '@/components/layout/DashboardHeader/DashboardHeader';
import { DashboardMenuProvider } from '@/features/patient/dashboard/context/DashboardMenuContext';
import { darkTheme, lightTheme } from '@/features/shared/ui/theme';

export const AppLayout: React.FC<{ children: React.ReactNode; useSidebar?: boolean }> = ({
  children,
  useSidebar = true,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme: uiTheme } = useUI();
  const currentTheme = uiTheme === 'dark' ? darkTheme : lightTheme;
  const isDashboard = useLocation().pathname.startsWith('/dashboard');

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {isDashboard ? (
          <>
            <DashboardMenuProvider>
              <DashboardHeader />
              <Box sx={{ display: 'flex', flex: 1, overflow: 'auto' }}>
                <Box component="main" sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2, md: 3 }, fontSize: '1.05rem', width: '100%', minWidth: 0 }}>
                  {children}
                </Box>
              </Box>
            </DashboardMenuProvider>
          </>
        ) : (
          <>
            <UniversalHeader onMenuClick={useSidebar ? () => setSidebarOpen(true) : undefined} />
            <Box sx={{ display: 'flex', flex: 1 }}>
              {useSidebar && <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
              <Box component="main" sx={{ flexGrow: 1, p: useSidebar ? 3 : 0 }}>
                {children}
              </Box>
            </Box>
          </>
        )}
        <Footer />
      </Box>
    </ThemeProvider>
  );
};

