import type { Theme } from '@mui/material/styles';
import { Box, Card, CardContent, Typography, Grid, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';



const MetricCard = styled(Card)(({ theme }: { theme: Theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const MetricTitle = styled(Typography)(({ theme }: { theme: Theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  fontWeight: 500,
}));

const MetricValue = styled(Typography)(({ theme }: { theme: Theme }) => ({
  fontSize: '1.75rem',
  fontWeight: 600,
  marginBottom: theme.spacing(0.5),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

interface MetricStatusProps {
  status?: 'good' | 'warning' | 'critical';
}

const MetricStatus = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'status',
})<MetricStatusProps>(({ theme, status = 'good' }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: `${theme.spacing(0.25)} ${theme.spacing(1)}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor:
    status === 'good' ? `${theme.palette.success.light}33` :
      status === 'warning' ? `${theme.palette.warning.light}33` :
        `${theme.palette.error.light}33`,
  color:
    status === 'good' ? theme.palette.success.dark :
      status === 'warning' ? theme.palette.warning.dark :
        theme.palette.error.dark,
  fontSize: '0.75rem',
  fontWeight: 500,
  '& svg': {
    fontSize: '1rem',
    marginRight: theme.spacing(0.5),
  },
}));

const ChartContainer = styled(Box)(({ theme }: { theme: Theme }) => ({
  height: 250,
  marginTop: theme.spacing(2),
  '& .recharts-cartesian-grid-horizontal line': {
    stroke: theme.palette.divider,
    strokeDasharray: '3 3',
  },
  '& .recharts-cartesian-axis-tick text': {
    fill: theme.palette.text.secondary,
    fontSize: '0.75rem',
  },
}));

interface HistoryData {
  day: string;
  value: number;
}

interface MetricData {
  id: string;
  title: string;
  icon: string;
  value: string;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  statusText: string;
  trend: 'up' | 'down' | 'stable';
  history: HistoryData[];
}

interface TrendIconProps {
  trend: 'up' | 'down' | 'stable';
}

const TrendIcon = ({ trend }: TrendIconProps) => {
  switch (trend) {
    case 'up':
      return <TrendingUpIcon fontSize="small" color="success" />;
    case 'down':
      return <TrendingDownIcon fontSize="small" color="error" />;
    default:
      return <TrendingFlatIcon fontSize="small" color="disabled" />;
  }
};

const metrics: MetricData[] = [
  {
    id: 'heart-rate',
    title: 'Heart Rate',
    icon: '🫀',
    value: '72',
    unit: 'BPM',
    status: 'good',
    statusText: 'Normal',
    trend: 'stable',
    history: [
      { day: 'Mon', value: 75 },
      { day: 'Tue', value: 72 },
      { day: 'Wed', value: 74 },
      { day: 'Thu', value: 71 },
      { day: 'Fri', value: 72 },
      { day: 'Sat', value: 70 },
      { day: 'Sun', value: 72 },
    ],
  },
  {
    id: 'blood-pressure',
    title: 'Blood Pressure',
    icon: '🩸',
    value: '120/80',
    unit: 'mmHg',
    status: 'good',
    statusText: 'Optimal',
    trend: 'down',
    history: [
      { day: 'Mon', value: 125 },
      { day: 'Tue', value: 122 },
      { day: 'Wed', value: 123 },
      { day: 'Thu', value: 120 },
      { day: 'Fri', value: 118 },
      { day: 'Sat', value: 120 },
      { day: 'Sun', value: 120 },
    ],
  },
  {
    id: 'blood-sugar',
    title: 'Blood Sugar',
    icon: '🧪',
    value: '95',
    unit: 'mg/dL',
    status: 'good',
    statusText: 'Normal',
    trend: 'stable',
    history: [
      { day: 'Mon', value: 92 },
      { day: 'Tue', value: 98 },
      { day: 'Wed', value: 95 },
      { day: 'Thu', value: 97 },
      { day: 'Fri', value: 94 },
      { day: 'Sat', value: 96 },
      { day: 'Sun', value: 95 },
    ],
  },
  {
    id: 'oxygen',
    title: 'Oxygen',
    icon: '💨',
    value: '98',
    unit: '%',
    status: 'good',
    statusText: 'Normal',
    trend: 'up',
    history: [
      { day: 'Mon', value: 97 },
      { day: 'Tue', value: 97 },
      { day: 'Wed', value: 98 },
      { day: 'Thu', value: 97 },
      { day: 'Fri', value: 98 },
      { day: 'Sat', value: 98 },
      { day: 'Sun', value: 98 },
    ],
  },
];

export const HealthMetrics = () => {
  const theme = useTheme();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Health Metrics
        </Typography>
        <Box>
          <FmdGoodIcon color="action" fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
          <Typography variant="caption" color="textSecondary">
            Last updated: Today, 9:30 AM
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {metrics.map((metric) => (
          <Grid item xs={12} sm={6} key={metric.id}>
            <MetricCard>
              <CardContent>
                <MetricTitle>
                  <span>{metric.icon}</span>
                  {metric.title}
                </MetricTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <MetricValue>
                      {metric.value} <span style={{ fontSize: '1rem', opacity: 0.7 }}>{metric.unit}</span>
                      <TrendIcon trend={metric.trend} />
                    </MetricValue>
                    <MetricStatus status={metric.status}>
                      {metric.statusText}
                    </MetricStatus>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Today
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {metric.value} {metric.unit}
                    </Typography>
                  </Box>
                </Box>

                <ChartContainer>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metric.history}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tickMargin={8}
                      />
                      <YAxis
                        domain={['auto', 'auto']}
                        axisLine={false}
                        tickLine={false}
                        tickMargin={8}
                        width={30}
                        tickFormatter={(value) => `${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: theme.shape.borderRadius,
                          padding: theme.spacing(1),
                        }}
                        labelStyle={{
                          color: theme.palette.text.primary,
                          fontWeight: 500,
                        }}
                        formatter={(value) => [`${value} ${metric.unit}`, metric.title]}
                        labelFormatter={(label) => `Day: ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={theme.palette.primary.main}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </MetricCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default HealthMetrics;