import {
    Box,
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Switch,
    useTheme,
    Button,
    Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SecurityIcon from '@mui/icons-material/Security';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

const PrivacyCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
    '&:hover': {
        boxShadow: theme.shadows[4],
    },
}));

interface AccessSetting {
    id: string;
    name: string;
    role: string;
    accessLevel: 'full' | 'limited' | 'none';
    type: 'provider' | 'family' | 'emergency';
}

const accessSettings: AccessSetting[] = [
    {
        id: 'prov1',
        name: 'Dr. Alem Mulugeta',
        role: 'Primary Care Physician',
        accessLevel: 'full',
        type: 'provider',
    },
    {
        id: 'prov2',
        name: 'Dr. Sara Abebe',
        role: 'Dentist',
        accessLevel: 'limited',
        type: 'provider',
    },
    {
        id: 'fam1',
        name: 'Family Member',
        role: 'Emergency Contact',
        accessLevel: 'limited',
        type: 'family',
    },
    {
        id: 'emer1',
        name: 'Emergency Services',
        role: 'First Responders',
        accessLevel: 'none',
        type: 'emergency',
    },
];

const getAccessIcon = (type: string) => {
    switch (type) {
        case 'provider':
            return <LocalHospitalIcon />;
        case 'family':
            return <FamilyRestroomIcon />;
        case 'emergency':
            return <MedicalServicesIcon />;
        default:
            return <SecurityIcon />;
    }
};

const getAccessColor = (level: string) => {
    switch (level) {
        case 'full':
            return 'success';
        case 'limited':
            return 'warning';
        case 'none':
            return 'error';
        default:
            return 'default';
    }
};

export const PrivacySettings = () => {
    const theme = useTheme();

    return (
        <PrivacyCard>
            <CardContent sx={{ flexGrow: 1, p: 0 }}>
                <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight={600}>
                            Data Sharing & Privacy
                        </Typography>
                        <SecurityIcon color="primary" />
                    </Box>
                </Box>

                <List disablePadding>
                    {accessSettings.map((setting) => (
                        <ListItem key={setting.id} divider>
                            <Box sx={{ mr: 2, color: theme.palette.text.secondary }}>
                                {getAccessIcon(setting.type)}
                            </Box>
                            <ListItemText
                                primary={setting.name}
                                secondary={setting.role}
                            />
                            <ListItemSecondaryAction>
                                <Chip
                                    label={setting.accessLevel === 'full' ? 'Full Access' : setting.accessLevel === 'limited' ? 'Limited' : 'No Access'}
                                    color={getAccessColor(setting.accessLevel) as any}
                                    size="small"
                                    variant={setting.accessLevel === 'none' ? 'outlined' : 'filled'}
                                    sx={{ minWidth: 80 }}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>

                <Box p={2}>
                    <Typography variant="subtitle2" gutterBottom>
                        Global Settings
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" color="text.secondary">
                            Allow Emergency Access
                        </Typography>
                        <Switch defaultChecked size="small" />
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                            Share Anonymized Data for Research
                        </Typography>
                        <Switch size="small" />
                    </Box>

                    <Button
                        fullWidth
                        variant="outlined"
                        sx={{ mt: 2, textTransform: 'none' }}
                    >
                        Manage Detailed Permissions
                    </Button>
                </Box>
            </CardContent>
        </PrivacyCard>
    );
};

export default PrivacySettings;
