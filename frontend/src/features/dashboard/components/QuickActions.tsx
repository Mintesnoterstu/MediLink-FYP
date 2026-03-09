import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    Button,
    useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SOSIcon from '@mui/icons-material/Sos';

const QuickActionsCard = styled(Card)(({ theme }) => ({
    height: '100%',
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
}));

const ActionButton = styled(Button)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(2),
    height: '100%',
    width: '100%',
    textTransform: 'none',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.text.primary,
    transition: 'all 0.2s',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[2],
    },
    '& .MuiSvgIcon-root': {
        fontSize: '2rem',
        marginBottom: theme.spacing(1),
        color: theme.palette.primary.main,
    },
}));

interface QuickAction {
    id: string;
    label: string;
    icon: React.ReactNode;
    color?: 'primary' | 'error' | 'warning' | 'info' | 'success';
}

const actions: QuickAction[] = [
    { id: 'log-symptom', label: 'Log Symptom', icon: <EditIcon /> },
    { id: 'log-med', label: 'Log Medication', icon: <LocalPharmacyIcon /> },
    { id: 'log-vitals', label: 'Log Vitals', icon: <MonitorHeartIcon /> },
    { id: 'schedule', label: 'Schedule Appt', icon: <CalendarTodayIcon /> },
    { id: 'activity', label: 'Log Activity', icon: <DirectionsRunIcon /> },
    { id: 'nutrition', label: 'Log Nutrition', icon: <RestaurantIcon /> },
    { id: 'reports', label: 'View Reports', icon: <AssessmentIcon /> },
    { id: 'emergency', label: 'Emergency', icon: <SOSIcon color="error" />, color: 'error' },
];

export const QuickActions = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const handleActionClick = (actionId: string) => {
        switch (actionId) {
            case 'log-symptom':
                navigate('/symptoms');
                break;
            case 'log-med':
                navigate('/medications');
                break;
            case 'log-vitals':
                // Navigate to vitals section within dashboard or dedicated page
                navigate('/dashboard'); // Could be enhanced to scroll to vitals section
                break;
            case 'schedule':
                navigate('/appointments');
                break;
            case 'activity':
                // Navigate to activity/fitness tracking page
                navigate('/dashboard');
                break;
            case 'nutrition':
                // Navigate to nutrition tracking page
                navigate('/dashboard');
                break;
            case 'reports':
                // Navigate to reports/analytics page
                navigate('/dashboard');
                break;
            case 'emergency':
                window.location.href = 'tel:907';
                break;
            default:
                console.log('Unknown action:', actionId);
        }
    };

    return (
        <QuickActionsCard>
            <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                    Quick Actions
                </Typography>
                <Grid container spacing={2}>
                    {actions.map((action) => (
                        <Grid item xs={6} sm={3} md={6} lg={3} key={action.id}>
                            <ActionButton
                                onClick={() => handleActionClick(action.id)}
                                sx={{
                                    ...(action.color === 'error' && {
                                        borderColor: theme.palette.error.light,
                                        color: theme.palette.error.main,
                                        backgroundColor: `${theme.palette.error.light}11`,
                                        '&:hover': {
                                            backgroundColor: `${theme.palette.error.light}22`,
                                        },
                                    }),
                                }}
                            >
                                {action.icon}
                                <Typography variant="body2" fontWeight={500} align="center">
                                    {action.label}
                                </Typography>
                            </ActionButton>
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </QuickActionsCard>
    );
};

export default QuickActions;
