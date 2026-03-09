import React, { ReactNode } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  background: `linear-gradient(135deg, rgba(37, 192, 211, 0.1) 0%, rgba(83, 124, 137, 0.1) 100%)`,
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
    borderColor: theme.palette.primary.main,
  },
}));

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  icon,
  trend,
  trendValue,
}) => {
  return (
    <StyledCard>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          {icon && <Box>{icon}</Box>}
        </Box>
        <Box display="flex" alignItems="baseline" gap={0.5}>
          <Typography variant="h4" component="div" fontWeight={700} sx={{ color: 'primary.main' }}>
            {value}
          </Typography>
          {unit && (
            <Typography variant="body2" color="text.secondary">
              {unit}
            </Typography>
          )}
        </Box>
        {trend && trendValue && (
          <Typography
            variant="caption"
            color={trend === 'up' ? 'success.main' : trend === 'down' ? 'error.main' : 'text.secondary'}
            mt={1}
            display="block"
          >
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </Typography>
        )}
      </CardContent>
    </StyledCard>
  );
};

