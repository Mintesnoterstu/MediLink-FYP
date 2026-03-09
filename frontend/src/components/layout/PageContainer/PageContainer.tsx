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
    <Container maxWidth={maxWidth} sx={{ py: 4 }}>
      {title && (
        <Typography variant="h4" component="h1" gutterBottom fontWeight={700} mb={3}>
          {title}
        </Typography>
      )}
      {children}
    </Container>
  );
};

