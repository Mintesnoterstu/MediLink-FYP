import React, { ReactNode } from 'react';
import { Container, Typography } from '@mui/material';

interface PageContainerProps {
  title?: string;
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  children,
  maxWidth = 'lg',
}) => {
  return (
    <Container
      maxWidth={maxWidth}
      sx={{
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 2, sm: 3 },
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    >
      {title && (
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          fontWeight={700}
          mb={3}
          sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}
        >
          {title}
        </Typography>
      )}
      {children}
    </Container>
  );
};

