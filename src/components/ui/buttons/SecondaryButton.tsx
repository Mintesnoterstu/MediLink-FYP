import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(Button)(() => ({
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 600,
  padding: '10px 24px',
  borderWidth: 2,
  '&:hover': {
    borderWidth: 2,
  },
}));

export const SecondaryButton: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <StyledButton variant="outlined" color="primary" {...props}>
      {children}
    </StyledButton>
  );
};

