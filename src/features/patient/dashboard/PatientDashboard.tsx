import React, { useMemo, useState } from 'react';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import { LocalHospital, Phone } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useUI } from '@/contexts/UIContext';
import { useDashboardMenu } from './context/DashboardMenuContext';
import { PatientSectionId } from './types';
import { HamburgerMenu } from './components/HamburgerMenu';
import { MyRecords } from './components/MyRecords';
import { ConsentManagement } from './components/ConsentManagement';
import { AccessHistory } from './components/AccessHistory';
import { Medications } from './components/Medications';
import { Appointments } from './components/Appointments';
import { MyDoctors } from './components/MyDoctors';
import { HealthSummary } from './components/HealthSummary';
import { Settings } from './components/Settings';

function sectionFromPath(pathname: string): PatientSectionId {
  if (pathname.includes('/dashboard/records')) return 'records';
  if (pathname.includes('/dashboard/consent')) return 'consent';
  if (pathname.includes('/dashboard/access-history')) return 'history';
  if (pathname.includes('/dashboard/medications')) return 'medications';
  if (pathname.includes('/dashboard/appointments')) return 'appointments';
  if (pathname.includes('/dashboard/doctors')) return 'doctors';
  if (pathname.includes('/dashboard/summary')) return 'summary';
  if (pathname.includes('/dashboard/profile') || pathname.includes('/dashboard/settings')) {
    return 'settings';
  }
  return 'records';
}

function pathFromSection(section: PatientSectionId): string {
  switch (section) {
    case 'records':
      return '/dashboard/records';
    case 'consent':
      return '/dashboard/consent';
    case 'history':
      return '/dashboard/access-history';
    case 'medications':
      return '/dashboard/medications';
    case 'appointments':
      return '/dashboard/appointments';
    case 'doctors':
      return '/dashboard/doctors';
    case 'summary':
      return '/dashboard/summary';
    case 'settings':
    default:
      return '/dashboard/profile';
  }
}

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { language } = useUI();
  const navigate = useNavigate();
  const location = useLocation();

  const initialSection = useMemo(() => sectionFromPath(location.pathname), [location.pathname]);
  const [activeSection, setActiveSection] = useState<PatientSectionId>(initialSection);
  const { menuOpen, closeMenu } = useDashboardMenu();

  const isAmharic = language === 'am';
  const patientName = user?.name || '[Name]';
  const healthId = 'ETH-2026-0115-AB123';

  const sectionTitle = (() => {
    switch (activeSection) {
      case 'records':
        return isAmharic ? 'የእኔ መዝገቦች' : 'My Records';
      case 'consent':
        return isAmharic ? 'ፈቃድ አስተዳደር' : 'Consent Management';
      case 'history':
        return isAmharic ? 'የመዳረሻ ታሪክ' : 'Access History';
      case 'medications':
        return isAmharic ? 'መድሀኒቶች' : 'Medications';
      case 'appointments':
        return isAmharic ? 'ቀጠሮዎች' : 'Appointments';
      case 'doctors':
        return isAmharic ? 'የእኔ ሐኪሞች' : 'My Doctors';
      case 'summary':
        return isAmharic ? 'የጤና ማጠቃለያ' : 'Health Summary';
      case 'settings':
      default:
        return isAmharic ? 'ቅንብሮች' : 'Settings';
    }
  })();

  const handleSectionChange = (section: PatientSectionId) => {
    setActiveSection(section);
    const path = pathFromSection(section);
    if (location.pathname !== path) {
      navigate(path, { replace: true });
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'records':
        return <MyRecords />;
      case 'consent':
        return <ConsentManagement />;
      case 'history':
        return <AccessHistory />;
      case 'medications':
        return <Medications />;
      case 'appointments':
        return <Appointments />;
      case 'doctors':
        return <MyDoctors />;
      case 'summary':
        return <HealthSummary />;
      case 'settings':
      default:
        return <Settings />;
    }
  };

  return (
    <Box sx={{ fontSize: '1.05rem', '& .MuiTypography-body1': { fontSize: '1.05rem' }, '& .MuiTypography-body2': { fontSize: '1rem' }, '& .MuiTypography-h5': { fontSize: '1.35rem' }, '& .MuiTypography-h6': { fontSize: '1.15rem' } }}>
      <Card sx={{ borderRadius: { xs: 2, md: 3 }, border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <CardContent sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 2, py: { xs: 2, md: 3 }, px: { xs: 2, md: 3 } }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box>
              <Typography
                variant="h6"
                fontWeight={900}
                sx={{ fontSize: { xs: '1.2rem', md: '1.4rem' } }}
              >
                {isAmharic ? 'ሜድሊንክ' : 'MediLink'}
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontSize: { xs: '0.95rem', md: '1rem' } }}
              >
                {isAmharic ? 'እንኳን ደህና መጡ፣ ' : 'Welcome, '}
                <strong>{patientName}</strong>
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.85rem', md: '0.9rem' } }}
              >
                {isAmharic ? 'የኢትዮጵያ የጤና መታወቂያ፡ ' : 'Ethiopian Health ID: '}
                <strong>{healthId}</strong>
              </Typography>
            </Box>
          </Box>
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{ fontSize: { xs: '1.1rem', md: '1.4rem' }, alignSelf: { xs: 'flex-start', md: 'center' } }}
          >
            {sectionTitle}
          </Typography>
        </CardContent>
      </Card>

      {renderContent()}

      {/* Emergency information (at bottom) */}
      <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'error.light', bgcolor: 'error.50', mt: 2 }}>
        <CardContent sx={{ py: 1.5, px: { xs: 2, md: 3 }, '&:last-child': { pb: 1.5 } }}>
          <Box display="flex" alignItems="center" flexWrap="wrap" gap={{ xs: 1, sm: 2 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <LocalHospital color="error" />
              <Typography variant="subtitle2" fontWeight={700} color="error.dark">
                {isAmharic ? 'ድንገተኛ' : 'Emergency'}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {isAmharic ? 'ድንገተኛ ለሆነ ጉዳይ ይደውሉ፡ ' : 'For emergencies call: '}
              <Button
                size="small"
                component="a"
                href="tel:907"
                startIcon={<Phone />}
                sx={{ color: 'error.dark', fontWeight: 700, textTransform: 'none', minWidth: 0, p: 0.5 }}
              >
                907
              </Button>
              {isAmharic ? ' (አምቡላንስ)' : ' (Ambulance)'}
              {' · '}
              <Button
                size="small"
                component="a"
                href="tel:911"
                sx={{ color: 'error.dark', fontWeight: 600, textTransform: 'none', minWidth: 0, p: 0.5 }}
              >
                911
              </Button>
              {isAmharic ? ' (ፖሊስ)' : ' (Police)'}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <HamburgerMenu
        activeSection={activeSection}
        isOpen={menuOpen}
        onClose={closeMenu}
        onSectionChange={handleSectionChange}
      />
    </Box>
  );
};

