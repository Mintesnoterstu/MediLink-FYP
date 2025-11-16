import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 600,
  padding: '10px 24px',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

export const PrimaryButton: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <StyledButton variant="contained" color="primary" {...props}>
      {children}
    </StyledButton>
  );
};

