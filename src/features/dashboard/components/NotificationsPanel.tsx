import {
    Box,
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    useTheme,
    Chip,
    Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import WarningIcon from '@mui/icons-material/Warning';
import EventIcon from '@mui/icons-material/Event';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MedicationIcon from '@mui/icons-material/Medication';

const NotificationsCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
    '&:hover': {
        boxShadow: theme.shadows[4],
    },
}));

const NotificationItem = styled(ListItem, {
    shouldForwardProp: (prop) => prop !== 'priority',
})<{ priority: 'high' | 'medium' | 'low' }>(({ theme, priority }) => ({
    padding: theme.spacing(1.5, 2),
    borderLeft: `4px solid ${priority === 'high' ? theme.palette.error.main :
        priority === 'medium' ? theme.palette.warning.main :
            theme.palette.info.main
        }`,
    backgroundColor:
        priority === 'high' ? `${theme.palette.error.light}11` :
            priority === 'medium' ? `${theme.palette.warning.light}11` :
                'transparent',
    '&:not(:last-child)': {
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
}));

interface Notification {
    id: string;
    type: 'medication' | 'appointment' | 'tip' | 'report';
    title: string;
    message: string;
    time: string;
    priority: 'high' | 'medium' | 'low';
    actions: string[];
}

const notifications: Notification[] = [
    {
        id: 'notif1',
        type: 'medication',
        title: 'Medication Reminder',
        message: 'Lisinopril is due in 30 minutes (10mg tablet)',
        time: 'Due now',
        priority: 'high',
        actions: ['Take Now', 'Snooze'],
    },
    {
        id: 'notif2',
        type: 'appointment',
        title: 'Appointment Tomorrow',
        message: 'Cardiology follow-up at 10:00 AM. Bring insurance card.',
        time: 'Due tomorrow',
        priority: 'medium',
        actions: ['Confirm', 'Reschedule'],
    },
    {
        id: 'notif3',
        type: 'tip',
        title: 'Health Tip',
        message: 'Drinking water before meals aids digestion.',
        time: 'Daily tip',
        priority: 'low',
        actions: ['Got it'],
    },
    {
        id: 'notif4',
        type: 'report',
        title: 'Weekly Report Ready',
        message: 'Your weekly health summary is available.',
        time: 'Just now',
        priority: 'low',
        actions: ['View Report'],
    },
];

const getNotificationIcon = (type: string, priority: string) => {
    if (priority === 'high') return <WarningIcon color="error" />;

    switch (type) {
        case 'medication':
            return <MedicationIcon color="warning" />;
        case 'appointment':
            return <EventIcon color="info" />;
        case 'tip':
            return <LightbulbIcon color="success" />;
        case 'report':
            return <AssessmentIcon color="primary" />;
        default:
            return <LightbulbIcon />;
    }
};

export const NotificationsPanel = () => {
    const theme = useTheme();

    return (
        <NotificationsCard>
            <CardContent sx={{ flexGrow: 1, p: 0 }}>
                <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight={600}>
                            Notifications
                        </Typography>
                        <Chip
                            label={`${notifications.length} New`}
                            size="small"
                            color="error"
                            variant="filled"
                        />
                    </Box>
                </Box>

                <List disablePadding>
                    {notifications.map((notification) => (
                        <NotificationItem key={notification.id} priority={notification.priority}>
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                {getNotificationIcon(notification.type, notification.priority)}
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            {notification.title}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {notification.time}
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Box mt={0.5}>
                                        <Typography variant="body2" color="text.primary" gutterBottom>
                                            {notification.message}
                                        </Typography>
                                        <Box display="flex" gap={1} mt={1}>
                                            {notification.actions.map((action, index) => (
                                                <Button
                                                    key={index}
                                                    size="small"
                                                    variant={index === 0 ? "contained" : "outlined"}
                                                    color={notification.priority === 'high' ? 'error' : 'primary'}
                                                    sx={{
                                                        fontSize: '0.7rem',
                                                        padding: '2px 8px',
                                                        minWidth: 'auto',
                                                        textTransform: 'none'
                                                    }}
                                                >
                                                    {action}
                                                </Button>
                                            ))}
                                        </Box>
                                    </Box>
                                }
                            />
                        </NotificationItem>
                    ))}
                </List>
            </CardContent>
        </NotificationsCard>
    );
};

export default NotificationsPanel;
