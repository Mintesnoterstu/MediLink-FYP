import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { HealthDataProvider } from '@/contexts/HealthDataContext';
import { UIProvider, useUI } from '@/contexts/UIContext';
import { AIProvider } from '@/contexts/AIContext';
import { Sidebar, Footer, PageContainer } from '@/components/layout';
import { UniversalHeader } from '@/components/layout/UniversalHeader/UniversalHeader';
import { LoginForm } from '@/components/features/auth/LoginForm/LoginForm';
import { Registration } from '@/components/features/auth/Registration/Registration';
import { HealthDashboard } from '@/components/features/patient/HealthDashboard/HealthDashboard';
import { SymptomTracker } from '@/components/features/patient/SymptomTracker/SymptomTracker';
import { MedicationManager } from '@/components/features/patient/MedicationManager/MedicationManager';
import { AppointmentScheduler } from '@/components/features/patient/AppointmentScheduler/AppointmentScheduler';
import { Home } from '@/components/features/public/Home/Home';
import { DiseaseLibrary } from '@/components/features/public/DiseaseLibrary/DiseaseLibrary';
import { TraditionalMedicine } from '@/components/features/public/TraditionalMedicine/TraditionalMedicine';
import { AboutAI } from '@/components/features/public/AboutAI/AboutAI';
import { SymptomChecker as PublicSymptomChecker } from '@/components/features/public/SymptomChecker/SymptomChecker';
import { MedicineHub } from '@/components/features/public/MedicineHub/MedicineHub';
import { About } from '@/components/features/public/About/About';
import '@/i18n/config';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppLayout: React.FC<{ children: React.ReactNode; useSidebar?: boolean }> = ({ children, useSidebar = true }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme: uiTheme } = useUI();

  const currentTheme = createTheme({
    ...theme,
    palette: {
      ...theme.palette,
      mode: uiTheme,
    },
  });

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <UniversalHeader onMenuClick={useSidebar ? () => setSidebarOpen(true) : undefined} />
        <Box sx={{ display: 'flex', flex: 1 }}>
          {useSidebar && <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
          <Box component="main" sx={{ flexGrow: 1, p: useSidebar ? 3 : 0 }}>
            {children}
          </Box>
        </Box>
        <Footer />
      </Box>
    </ThemeProvider>
  );
};

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme: uiTheme } = useUI();

  const currentTheme = createTheme({
    ...theme,
    palette: {
      ...theme.palette,
      mode: uiTheme,
    },
  });

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

function App() {
  return (
    <Router>
      <UIProvider>
        <AuthProvider>
          <HealthDataProvider>
            <AIProvider>
              <Routes>
                {/* Public Routes */}
                <Route
                  path="/"
                  element={
                    <PublicLayout>
                      <Home />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/diseases"
                  element={
                    <PublicLayout>
                      <DiseaseLibrary />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/symptom-checker"
                  element={
                    <PublicLayout>
                      <PublicSymptomChecker />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/health-assessment"
                  element={
                    <PublicLayout>
                      <PublicSymptomChecker />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/traditional-medicine"
                  element={
                    <PublicLayout>
                      <TraditionalMedicine />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/medicine-hub"
                  element={
                    <PublicLayout>
                      <MedicineHub />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/about-ai"
                  element={
                    <PublicLayout>
                      <AboutAI />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/about"
                  element={
                    <PublicLayout>
                      <About />
                    </PublicLayout>
                  }
                />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<Registration />} />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <PageContainer>
                          <HealthDashboard />
                        </PageContainer>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/symptoms"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <PageContainer>
                          <SymptomTracker />
                        </PageContainer>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/medications"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <PageContainer>
                          <MedicationManager />
                        </PageContainer>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/appointments"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <PageContainer>
                          <AppointmentScheduler />
                        </PageContainer>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </AIProvider>
          </HealthDataProvider>
        </AuthProvider>
      </UIProvider>
    </Router>
  );
}

export default App;

