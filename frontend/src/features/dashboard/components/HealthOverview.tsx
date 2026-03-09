import { useState } from 'react';

import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';


interface StatChangeProps {
  positive: boolean;
}

const StatTitle = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  fontWeight: 500,
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 600,
  marginBottom: theme.spacing(1),
  color: theme.palette.text.primary,
}));

const StatChange = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'positive',
})<StatChangeProps>(({ theme, positive }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: positive
    ? `${theme.palette.success.light}33`
    : `${theme.palette.error.light}33`,
  color: positive ? theme.palette.success.dark : theme.palette.error.dark,
  fontSize: '0.75rem',
  fontWeight: 500,
  '& svg': {
    fontSize: '1rem',
    marginRight: theme.spacing(0.5),
  },
}));

const StatAction = styled(Button)(({ theme }) => ({
  marginTop: 'auto',
  textTransform: 'none',
  fontWeight: 500,
  padding: 0,
  '&:hover': {
    backgroundColor: 'transparent',
    textDecoration: 'underline',
  },
  '& .MuiSvgIcon-root': {
    transition: 'transform 0.2s',
    fontSize: '1rem',
    marginLeft: theme.spacing(0.5),
  },
  '&:hover .MuiSvgIcon-root': {
    transform: 'translateX(2px)',
  },
}));

interface Stat {
  id: string;
  title: string;
  value: string | number;
  change?: { value: number; positive: boolean } | null;
  icon: React.ReactNode;
  action: string;
}

const stats: Stat[] = [
  {
    id: 'symptoms',
    title: 'Active Symptoms',
    value: '3',
    change: { value: 15, positive: false },
    icon: <LocalHospitalIcon fontSize="small" />,
    action: 'Manage',
  },
  {
    id: 'medications',
    title: 'Active Medications',
    value: '5',
    change: null,
    icon: <LocalHospitalIcon fontSize="small" />,
    action: 'Schedule',
  },
  {
    id: 'appointments',
    title: 'Upcoming Appointments',
    value: '2',
    change: null,
    icon: <NotificationsActiveIcon fontSize="small" />,
    action: 'View All',
  },
  {
    id: 'alerts',
    title: 'Alerts',
    value: '1',
    change: { value: 1, positive: false },
    icon: <NotificationsActiveIcon fontSize="small" />,
    action: 'Review',
  },
];

export const HealthOverview = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Health Overview
        </Typography>
        <Box>
          <Button
            size="small"
            sx={{
              textTransform: 'none',
              mr: 1,
              fontWeight: timeRange === 'today' ? 600 : 400
            }}
            onClick={() => setTimeRange('today')}
          >
            Today
          </Button>
          <Button
            size="small"
            sx={{
              textTransform: 'none',
              mr: 1,
              fontWeight: timeRange === 'week' ? 600 : 400
            }}
            onClick={() => setTimeRange('week')}
          >
            This Week
          </Button>
          <Button
            size="small"
            sx={{
              textTransform: 'none',
              fontWeight: timeRange === 'month' ? 600 : 400
            }}
            onClick={() => setTimeRange('month')}
          >
            This Month
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <StatTitle>
                  {stat.icon}
                  {stat.title}
                </StatTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <StatValue>{stat.value}</StatValue>
                  {stat.change && (
                    <Box sx={{ ml: 'auto' }}>
                      <StatChange positive={stat.change.positive}>
                        <TrendingUpIcon />
                        {Math.abs(stat.change.value)}%
                      </StatChange>
                    </Box>
                  )}
                </Box>
                <StatAction
                  endIcon={<ArrowForwardIcon fontSize="small" />}
                  sx={{
                    color: theme.palette.primary.main,
                    alignSelf: 'flex-start',
                    mt: 'auto',
                  }}
                >
                  {stat.action}
                </StatAction>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default HealthOverview;