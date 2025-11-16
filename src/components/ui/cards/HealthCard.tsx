import React, { ReactNode } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-2px)',
  },
}));

interface HealthCardProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
}

export const HealthCard: React.FC<HealthCardProps> = ({ title, children, icon, action }) => {
  return (
    <StyledCard>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            {icon && <Box>{icon}</Box>}
            <Typography variant="h6" component="h3" fontWeight={600}>
              {title}
            </Typography>
          </Box>
          {action && <Box>{action}</Box>}
        </Box>
        {children}
      </CardContent>
    </StyledCard>
  );
};

