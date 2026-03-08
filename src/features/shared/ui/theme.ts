import { createTheme } from '@mui/material/styles';

// Brand color palette (formal medical scheme)
const brandColors = {
  brand: '#4eb6f2', // Hero/brand surfaces
  primary: '#4A90E2', // Main actions
  dark: '#2C3E50', // Navigation/footer backgrounds
  success: '#2ECC71',
  warning: '#FF6B6B',
  background: '#FFFFFF',
  backgroundAlt: '#E8F4F8',
  textPrimary: '#333333',
  textSecondary: '#666666',
  border: '#EEEEEE',
};

// Base theme configuration
const baseTheme = {
  typography: {
    fontFamily: '"Open Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, fontFamily: '"Montserrat", "Open Sans", "Roboto", "Helvetica", "Arial", sans-serif' },
    h2: { fontWeight: 700, fontFamily: '"Montserrat", "Open Sans", "Roboto", "Helvetica", "Arial", sans-serif' },
    h3: { fontWeight: 600, fontFamily: '"Montserrat", "Open Sans", "Roboto", "Helvetica", "Arial", sans-serif' },
    h4: { fontWeight: 600, fontFamily: '"Montserrat", "Open Sans", "Roboto", "Helvetica", "Arial", sans-serif' },
    h5: { fontWeight: 600, fontFamily: '"Montserrat", "Open Sans", "Roboto", "Helvetica", "Arial", sans-serif' },
    h6: { fontWeight: 600, fontFamily: '"Montserrat", "Open Sans", "Roboto", "Helvetica", "Arial", sans-serif' },
    button: { fontWeight: 600, textTransform: 'none' as const, fontFamily: '"Roboto", "Open Sans", "Helvetica", "Arial", sans-serif' },
  },
  shape: {
    borderRadius: 12,
  },
};

export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: {
      main: brandColors.primary,
      light: '#6FB0F3',
      dark: '#357ABD',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: brandColors.dark,
      light: '#3E556B',
      dark: '#1B2836',
      contrastText: '#FFFFFF',
    },
    error: {
      main: brandColors.warning,
      light: '#FF8A8A',
      dark: '#E14C4C',
    },
    warning: {
      main: '#FF9800',
      light: '#FFB74D',
      dark: '#F57C00',
    },
    info: {
      main: brandColors.brand,
      light: '#7FCDF6',
      dark: '#3B8FB9',
    },
    success: {
      main: brandColors.success,
      light: '#59D98C',
      dark: '#239B55',
    },
    background: {
      default: brandColors.background,
      paper: brandColors.backgroundAlt,
    },
    text: {
      primary: brandColors.textPrimary,
      secondary: brandColors.textSecondary,
    },
    divider: brandColors.border,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          '&:hover': {
            backgroundColor: '#357ABD',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${brandColors.border}`,
          '&:hover': {
            borderColor: brandColors.primary,
          },
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: brandColors.primary,
      light: '#6FB0F3',
      dark: '#357ABD',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: brandColors.dark,
      light: '#3E556B',
      dark: '#1B2836',
      contrastText: '#FFFFFF',
    },
    error: {
      main: brandColors.warning,
      light: '#FF8A8A',
      dark: '#E14C4C',
    },
    warning: {
      main: '#FF9800',
      light: '#FFB74D',
      dark: '#F57C00',
    },
    info: {
      main: brandColors.brand,
      light: '#7FCDF6',
      dark: '#3B8FB9',
    },
    success: {
      main: brandColors.success,
      light: '#59D98C',
      dark: '#239B55',
    },
    background: {
      default: '#0F1724',
      paper: '#1C2634',
    },
    text: {
      primary: '#F5F7FA',
      secondary: '#C5CCD6',
    },
    divider: '#2F3B4A',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          '&:hover': {
            backgroundColor: '#357ABD',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${brandColors.border}20`,
          '&:hover': {
            borderColor: brandColors.primary,
          },
        },
      },
    },
  },
});

