import React from 'react';
import { Link as MuiLink, LinkProps } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';

const StyledLink = styled(MuiLink)(() => ({
  textDecoration: 'none',
  fontWeight: 500,
  '&:hover': {
    textDecoration: 'underline',
  },
}));

interface NavLinkProps extends Omit<LinkProps, 'component' | 'href'> {
  to: string;
  children: React.ReactNode;
}

export const NavLink: React.FC<NavLinkProps> = ({ to, children, ...props }) => {
  return (
    <StyledLink component={RouterLink as any} to={to} {...(props as any)}>
      {children}
    </StyledLink>
  );
};

