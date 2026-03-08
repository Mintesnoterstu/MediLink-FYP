import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Box,
  Container,
  Grid,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  Avatar,
  Badge,
  CssBaseline
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DescriptionIcon from '@mui/icons-material/Description';
import SecurityIcon from '@mui/icons-material/Security';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';

// Import Feature Components
import { HealthOverview } from './components/HealthOverview';
import { MedicationTracker } from './components/MedicationTracker';
import { Appointments } from './components/Appointments';
import { SymptomTracker } from './components/SymptomTracker';
import { HealthGoals } from './components/HealthGoals';
import { CareTeam } from './components/CareTeam';
import { MedicalRecords } from './components/MedicalRecords';
import { NotificationsPanel } from './components/NotificationsPanel';
import { QuickActions } from './components/QuickActions';
import { PrivacySettings } from './components/PrivacySettings';

import './Dashboard.css';

const DRAWER_WIDTH = 280;

interface Section {
  id: string;
  label: string;
  icon: React.ReactNode;
}

// Patient dashboard is intentionally simplified to align with the
// "4 sections only" design: Overview, My Records, Consent, Access History.
const sections: Section[] = [
  { id: 'overview', label: 'Overview', icon: <DashboardIcon /> },
  { id: 'records', label: 'My Records', icon: <DescriptionIcon /> },
  { id: 'consent', label: 'Consent Management', icon: <SecurityIcon /> },
  { id: 'access-history', label: 'Access History', icon: <AssessmentIcon /> },
];

const Dashboard: React.FC = () => {
  useLanguage();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('overview');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#2C3E50', color: '#FFFFFF' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          sx={{
            bgcolor: '#4eb6f2',
            width: 40,
            height: 40
          }}
        >
          <LocalHospitalIcon />
        </Avatar>
        <Typography variant="h6" fontWeight={700} color="#4eb6f2">
          MedL
        </Typography>
      </Box>

      <List sx={{ px: 2, flexGrow: 1 }}>
        {sections.map((section) => (
          <ListItem
            button
            key={section.id}
            selected={activeSection === section.id}
            onClick={() => handleSectionChange(section.id)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              color: '#FFFFFF',
              '&.Mui-selected': {
                backgroundColor: '#4eb6f2',
                color: '#FFFFFF',
                '&:hover': {
                  backgroundColor: '#3ea4e0',
                },
                '& .MuiListItemIcon-root': {
                  color: '#FFFFFF',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
              {section.icon}
            </ListItemIcon>
            <ListItemText
              primary={section.label}
              primaryTypographyProps={{ fontWeight: activeSection === section.id ? 600 : 400 }}
            />
          </ListItem>
        ))}
        <ListItem
          button
          onClick={() => navigate('/')}
          sx={{
            borderRadius: 2,
            mt: 2,
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: '#4eb6f2' }}>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText
            primary="Back to Home"
            primaryTypographyProps={{ fontWeight: 600 }}
          />
        </ListItem>
      </List>

      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Avatar src="/path-to-user.jpg">JP</Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              John Patient
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: #12345678
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <Grid container spacing={2}>
            {/* Top Stats Row */}
            <Grid item xs={12}>
              <HealthOverview />
            </Grid>

            {/* Main Dashboard Grid */}
            <Grid item xs={12} lg={8}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <MedicationTracker />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Appointments />
                  </Grid>
                </Grid>
                <HealthGoals />
              </Box>
            </Grid>

            {/* Right Sidebar Widgets */}
            <Grid item xs={12} lg={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <NotificationsPanel />
                <QuickActions />
                <SymptomTracker />
                <CareTeam />
              </Box>
            </Grid>
          </Grid>
        );

      case 'records':
        // "My Records" – patient can view but not edit clinical data
        return <MedicalRecords />;

      case 'consent':
        // Reuse PrivacySettings to represent consent management for now
        return <PrivacySettings />;

      case 'access-history':
        // Access history placeholder – uses notifications-style card for now
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Access History
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This section will list who viewed your records, when, and what they accessed.
            </Typography>
            <NotificationsPanel />
          </Box>
        );

      default:
        return (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h5" color="text.secondary">
              {activeSection} section coming soon...
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />

      {/* App Bar for Mobile */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          background: 'linear-gradient(135deg, #4eb6f2 0%, #4A90E2 60%, #2C3E50 100%)',
          color: '#FFFFFF',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {sections.find(s => s.id === activeSection)?.label || 'Dashboard'}
          </Typography>
          <IconButton color="inherit">
            <SearchIcon />
          </IconButton>
          <IconButton color="inherit">
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: `1px solid ${theme.palette.divider}` },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: { xs: 8, md: 0 },
          background: 'linear-gradient(135deg, #f8fbfd 0%, #E8F4F8 50%, #dceef7 100%)',
          minHeight: '100vh',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(78, 182, 242, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(74, 144, 226, 0.06) 0%, transparent 50%)',
            pointerEvents: 'none',
            zIndex: 0
          }
        }}
      >
        {/* Toolbar Spacer for Desktop (if Appbar wasn't fixed there) - but here we used Fixed AppBar on mobile only, 
            so for desktop we might need a spacer if we added a header. 
            Currently desktop sidebar is side-by-side. 
            However, we added a fixed AppBar for Tablet/Desktop as well above. 
            So we need a Toolbar spacer.
        */}
        <Toolbar />

        <Container maxWidth="xl" sx={{ mt: 1, mb: 2, position: 'relative', zIndex: 1 }}>
          {renderContent()}
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;