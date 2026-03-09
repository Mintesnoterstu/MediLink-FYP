import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 600,
  padding: '10px 24px',
  boxShadow: 'none',
  background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
  '&:hover': {
    boxShadow: theme.shadows[4],
    background: 'linear-gradient(135deg, #357ABD 0%, #2C6DAA 100%)',
  },
  '&:disabled': {
    background: theme.palette.action.disabledBackground,
  },
}));

export const PrimaryButton: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <StyledButton variant="contained" color="primary" {...props}>
      {children}
    </StyledButton>
  );
};

