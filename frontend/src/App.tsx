import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/features/auth/context/AuthContext';
import { HealthDataProvider } from '@/contexts/HealthDataContext';
import { UIProvider } from '@/features/shared/ui/context/UIContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AIProvider } from '@/features/shared/ai/context/AIContext';
import { PageContainer } from '@/components/layout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { FloatingChatBot } from '@/components/features/shared';
import { HomePage } from '@/pages/public/HomePage';
import { DiseasePage } from '@/pages/public/DiseasePage';
import { MedicinePage } from '@/pages/public/MedicinePage';
import { AboutPage } from '@/pages/public/AboutPage';
import { LoginPage } from '@/pages/public/LoginPage';
import { RegisterPage } from '@/pages/public/RegisterPage';
import { SymptomChecker as PublicSymptomChecker } from '@/components/features/public/SymptomChecker/SymptomChecker';
import { SymptomTracker } from '@/components/features/patient/SymptomTracker/SymptomTracker';
import { MedicationManager } from '@/components/features/patient/MedicationManager/MedicationManager';
import { AppointmentScheduler } from '@/components/features/patient/AppointmentScheduler/AppointmentScheduler';
import { PatientDashboard } from '@/features/patient/dashboard/PatientDashboard';
import { ProfessionalDashboard } from '@/features/professional/dashboard/ProfessionalDashboard';
import { AdminDashboard } from '@/features/admin/dashboard/AdminDashboard';
import { ChatBot } from '@/components/ChatBot';
import '@/i18n/config';

const RoleBasedDashboard: React.FC = () => {
  const { user } = useAuth();

  if (user?.role === 'provider') return <ProfessionalDashboard />;
  if (user?.role === 'admin') return <AdminDashboard />;
  return <PatientDashboard />;
};

function App() {
  return (
    <Router>
      <LanguageProvider>
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
                        <HomePage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/diseases"
                    element={
                      <PublicLayout>
                        <DiseasePage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/medicines"
                    element={
                      <PublicLayout>
                        <MedicinePage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/medicine-hub"
                    element={
                      <PublicLayout>
                        <MedicinePage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/about"
                    element={
                      <PublicLayout>
                        <AboutPage />
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
                    path="/login"
                    element={
                      <PublicLayout>
                        <LoginPage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <PublicLayout>
                        <RegisterPage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/chatbot"
                    element={
                      <PublicLayout>
                        <ChatBot />
                      </PublicLayout>
                    }
                  />

                  {/* Protected Routes */}
                  <Route
                    path="/dashboard/*"
                    element={
                      <ProtectedRoute>
                        <AppLayout useSidebar>
                          <PageContainer>
                            <RoleBasedDashboard />
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
                {/* Floating Chatbot - Available on all pages */}
                <FloatingChatBot />
              </AIProvider>
            </HealthDataProvider>
          </AuthProvider>
        </UIProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;