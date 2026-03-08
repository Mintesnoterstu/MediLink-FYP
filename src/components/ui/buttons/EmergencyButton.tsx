import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { LocalHospital } from '@mui/icons-material';

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 700,
  padding: '12px 24px',
  backgroundColor: theme.palette.error.main,
  color: theme.palette.error.contrastText,
  animation: 'pulse 2s infinite',
  '@keyframes pulse': {
    '0%': {
      boxShadow: `0 0 0 0 ${theme.palette.error.main}40`,
    },
    '70%': {
      boxShadow: `0 0 0 10px ${theme.palette.error.main}00`,
    },
    '100%': {
      boxShadow: `0 0 0 0 ${theme.palette.error.main}00`,
    },
  },
  '&:hover': {
    backgroundColor: theme.palette.error.dark,
  },
}));

export const EmergencyButton: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <StyledButton variant="contained" startIcon={<LocalHospital />} {...props}>
      {children ?? 'Emergency'}
    </StyledButton>
  );
};

