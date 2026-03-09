import React, { useMemo } from 'react';
import { Grid, Box, Typography, Card, CardContent, List, ListItem, ListItemText, Chip } from '@mui/material';
import { TrendingUp, People, LocalHospital, Assessment, SmartToy } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { HealthCard } from '@/components/ui';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface SystemAnalyticsProps {
  totalUsers?: number;
  totalPatients?: number;
  totalProviders?: number;
  totalAppointments?: number;
  aiUsageStats?: Array<{ date: string; requests: number; confidence: number }>;
  userGrowthData?: Array<{ month: string; users: number }>;
  appointmentStats?: Array<{ type: string; count: number }>;
  symptomFrequency?: Array<{ symptom: string; count: number }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const SystemAnalytics: React.FC<SystemAnalyticsProps> = ({
  totalUsers = 0,
  totalPatients = 0,
  totalProviders = 0,
  totalAppointments = 0,
  aiUsageStats = [],
  userGrowthData = [],
  appointmentStats = [],
  symptomFrequency = [],
}) => {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    return aiUsageStats.map((stat) => ({
      date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      requests: stat.requests,
      confidence: (stat.confidence * 100).toFixed(1),
    }));
  }, [aiUsageStats]);

  const userGrowthChartData = useMemo(() => {
    return userGrowthData.map((data) => ({
      month: data.month,
      users: data.users,
    }));
  }, [userGrowthData]);

  const appointmentChartData = useMemo(() => {
    return appointmentStats.map((stat) => ({
      name: stat.type,
      value: stat.count,
    }));
  }, [appointmentStats]);

  const symptomChartData = useMemo(() => {
    return symptomFrequency.slice(0, 5).map((item) => ({
      name: item.symptom,
      value: item.count,
    }));
  }, [symptomFrequency]);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight={700} mb={3}>
        {t('admin.systemAnalytics')}
      </Typography>

      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {totalUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('admin.totalUsers')}
                  </Typography>
                </Box>
                <People color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {totalPatients}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('admin.totalPatients')}
                  </Typography>
                </Box>
                <LocalHospital color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {totalProviders}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('admin.totalProviders')}
                  </Typography>
                </Box>
                <Assessment color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {totalAppointments}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('admin.totalAppointments')}
                  </Typography>
                </Box>
                <TrendingUp color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* AI Usage Statistics */}
        {chartData.length > 0 && (
          <Grid item xs={12} md={6}>
            <HealthCard title={t('admin.aiUsageStats')} icon={<SmartToy color="primary" />}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="requests" fill="#8884d8" name={t('admin.aiRequests')} />
                </BarChart>
              </ResponsiveContainer>
            </HealthCard>
          </Grid>
        )}

        {/* User Growth */}
        {userGrowthChartData.length > 0 && (
          <Grid item xs={12} md={6}>
            <HealthCard title={t('admin.userGrowth')} icon={<TrendingUp color="primary" />}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowthChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} name={t('admin.users')} />
                </LineChart>
              </ResponsiveContainer>
            </HealthCard>
          </Grid>
        )}

        {/* Appointment Types Distribution */}
        {appointmentChartData.length > 0 && (
          <Grid item xs={12} md={6}>
            <HealthCard title={t('admin.appointmentTypes')} icon={<Assessment color="primary" />}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={appointmentChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {appointmentChartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </HealthCard>
          </Grid>
        )}

        {/* Top Symptoms */}
        {symptomChartData.length > 0 && (
          <Grid item xs={12} md={6}>
            <HealthCard title={t('admin.topSymptoms')} icon={<LocalHospital color="primary" />}>
              <List>
                {symptomFrequency.slice(0, 10).map((item, idx) => (
                  <ListItem key={idx}>
                    <ListItemText
                      primary={item.symptom}
                      secondary={`${item.count} ${t('admin.occurrences')}`}
                    />
                    <Chip label={`#${idx + 1}`} size="small" color="primary" />
                  </ListItem>
                ))}
              </List>
            </HealthCard>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
