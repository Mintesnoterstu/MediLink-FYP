import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  useTheme,
  Grid,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import MessageIcon from '@mui/icons-material/Message';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import StarIcon from '@mui/icons-material/Star';

const CareTeamCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const ProviderItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(2),
  '&:not(:last-child)': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  alignItems: 'flex-start',
}));

interface Provider {
  id: string;
  name: string;
  role: string;
  specialty: string;
  institution: string;
  lastVisit: string;
  nextAppointment: string | null;
  image: string | null;
  isPrimary: boolean;
}

const providers: Provider[] = [
  {
    id: 'dr-alem',
    name: 'Dr. Alem Mulugeta',
    role: 'Doctor',
    specialty: 'Cardiology',
    institution: "St. Paul's Hospital",
    lastVisit: 'Sept 15, 2024',
    nextAppointment: 'Tomorrow, 10 AM',
    image: null,
    isPrimary: true,
  },
  {
    id: 'dr-sara',
    name: 'Dr. Sara Abebe',
    role: 'Doctor',
    specialty: 'Dentistry',
    institution: 'Dental Care Clinic',
    lastVisit: 'June 20, 2024',
    nextAppointment: 'Nov 5, 9 AM',
    image: null,
    isPrimary: false,
  },
  {
    id: 'dr-tesfaye',
    name: 'Dr. Tesfaye',
    role: 'Doctor',
    specialty: 'Endocrinologist',
    institution: 'Black Lion Hospital',
    lastVisit: 'Aug 10, 2024',
    nextAppointment: null,
    image: null,
    isPrimary: false,
  },
  {
    id: 'lab-tech',
    name: 'Lab Technician',
    role: 'Technician',
    specialty: 'Blood Work',
    institution: 'Central Lab',
    lastVisit: 'Sept 15, 2024',
    nextAppointment: 'Oct 25, 2:30 PM',
    image: null,
    isPrimary: false,
  },
];

export const CareTeam = () => {
  const theme = useTheme();

  return (
    <CareTeamCard>
      <CardContent sx={{ flexGrow: 1, p: 0 }}>
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={600}>
              Your Care Team
            </Typography>
            <Chip
              label={`${providers.length} providers`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        </Box>

        <List disablePadding>
          {providers.map((provider) => (
            <ProviderItem key={provider.id}>
              <ListItemAvatar>
                <Avatar
                  sx={{
                    width: 50,
                    height: 50,
                    mr: 2,
                    bgcolor: provider.isPrimary ? theme.palette.primary.main : theme.palette.grey[400]
                  }}
                  src={provider.image || undefined}
                >
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {provider.name}
                    </Typography>
                    {provider.isPrimary && (
                      <Chip
                        icon={<StarIcon sx={{ fontSize: '1rem !important' }} />}
                        label="Primary"
                        size="small"
                        color="warning"
                        sx={{ height: 20, '& .MuiChip-label': { px: 1 } }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box mt={0.5}>
                    <Typography variant="body2" color="text.primary" gutterBottom>
                      {provider.specialty} | {provider.institution}
                    </Typography>

                    <Grid container spacing={1} sx={{ mt: 1, mb: 2 }}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Last Visit
                        </Typography>
                        <Typography variant="body2">
                          {provider.lastVisit}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Next Appointment
                        </Typography>
                        <Typography variant="body2" color={provider.nextAppointment ? 'primary.main' : 'text.primary'}>
                          {provider.nextAppointment || 'Not scheduled'}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<MessageIcon />}
                        sx={{ textTransform: 'none' }}
                      >
                        Message
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<UploadFileIcon />}
                        sx={{ textTransform: 'none' }}
                      >
                        Share Data
                      </Button>
                      {!provider.nextAppointment && (
                        <Button
                          variant="text"
                          size="small"
                          startIcon={<CalendarTodayIcon />}
                          sx={{ textTransform: 'none' }}
                        >
                          Book Appt
                        </Button>
                      )}
                    </Box>
                  </Box>
                }
              />
            </ProviderItem>
          ))}
        </List>
      </CardContent>
    </CareTeamCard>
  );
};

export default CareTeam;
