import { useState } from 'react';

import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  useTheme,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import { format } from 'date-fns';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  status: 'taken' | 'due' | 'soon' | 'upcoming' | 'missed';
  instructions: string;
  lastTaken: string | null;
  nextDose: string;
  type?: string;
}

interface StatusChipProps {
  status: 'taken' | 'due' | 'soon' | 'upcoming' | 'missed';
}

const MedicationCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const MedicationHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const MedicationTime = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5, 2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(1, 2, 2, 2),
  '& svg': {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
}));

const MedicationItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  '&:not(:last-child)': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const StatusChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'status',
})<StatusChipProps>(({ theme, status }) => ({
  textTransform: 'capitalize',
  ...(status === 'taken' && {
    backgroundColor: `${theme.palette.success.light}33`,
    color: theme.palette.success.dark,
  }),
  ...(status === 'due' && {
    backgroundColor: `${theme.palette.warning.light}33`,
    color: theme.palette.warning.dark,
  }),
  ...(status === 'soon' && {
    backgroundColor: `${theme.palette.info.light}33`,
    color: theme.palette.info.dark,
  }),
  ...(status === 'missed' && {
    backgroundColor: `${theme.palette.error.light}33`,
    color: theme.palette.error.dark,
  }),
  ...(status === 'upcoming' && {
    backgroundColor: `${theme.palette.grey[300]}33`,
    color: theme.palette.grey[700],
  }),
}));

const medications: Medication[] = [
  {
    id: 'metformin',
    name: 'Metformin',
    dosage: '500mg',
    time: '08:00 AM',
    status: 'taken',
    instructions: 'Take with food',
    lastTaken: '08:05 AM',
    nextDose: '08:00 AM',
  },
  {
    id: 'lisinopril',
    name: 'Lisinopril',
    dosage: '10mg',
    time: '12:00 PM',
    status: 'due',
    instructions: 'Take with water',
    lastTaken: null,
    nextDose: '12:00 PM',
  },
  {
    id: 'atorvastatin',
    name: 'Atorvastatin',
    dosage: '20mg',
    time: '06:00 PM',
    status: 'soon',
    instructions: 'Take at bedtime',
    lastTaken: null,
    nextDose: '06:00 PM',
  },
  {
    id: 'aspirin',
    name: 'Aspirin',
    dosage: '81mg',
    time: '09:00 PM',
    status: 'upcoming',
    instructions: 'Take with water',
    lastTaken: null,
    nextDose: '09:00 PM',
  },
];

const getStatusLabel = (status: Medication['status']): string => {
  switch (status) {
    case 'taken':
      return 'Taken';
    case 'due':
      return 'Due Now';
    case 'soon':
      return 'Coming Up';
    case 'missed':
      return 'Missed';
    case 'upcoming':
      return 'Upcoming';
    default:
      return 'Unknown';
  }
};

export const MedicationTracker = () => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, medication: Medication) => {
    setAnchorEl(event.currentTarget);
    setSelectedMed(medication);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMed(null);
  };

  const handleAction = (action: string) => {
    console.log(`${action} medication:`, selectedMed?.id);
    handleMenuClose();
  };

  return (
    <MedicationCard>
      <MedicationHeader>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Today's Medications
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </Typography>
        </Box>
        <Button
          size="small"
          startIcon={<AddIcon />}
          sx={{ textTransform: 'none' }}
        >
          Add Medication
        </Button>
      </MedicationHeader>

      <MedicationTime>
        <AccessTimeIcon />
        <Typography variant="subtitle2">
          {medications.filter(m => m.status === 'taken').length} of {medications.length} medications taken today
        </Typography>
      </MedicationTime>

      <List disablePadding>
        {medications.map((medication) => (
          <MedicationItem key={medication.id}>
            <ListItemIcon>
              <Avatar sx={{ bgcolor: theme.palette.primary.light, width: 40, height: 40 }}>
                {'💊'}
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle1" fontWeight={500}>
                    {medication.name} <span style={{ opacity: 0.7 }}>{medication.dosage}</span>
                  </Typography>
                  <StatusChip
                    label={getStatusLabel(medication.status)}
                    size="small"
                    status={medication.status}
                  />
                </Box>
              }
              secondary={
                <>
                  <Box display="flex" alignItems="center" mt={0.5}>
                    <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                    <Typography variant="body2" component="span" color="text.secondary">
                      {medication.time}
                    </Typography>
                    <Box component="span" mx={1}>•</Box>
                    <Typography variant="body2" component="span" color="text.secondary">
                      {medication.instructions}
                    </Typography>
                  </Box>
                  {medication.lastTaken && (
                    <Typography variant="caption" display="block" color="success.main" sx={{ mt: 0.5 }}>
                      <CheckCircleOutlineIcon fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      Taken at {medication.lastTaken}
                    </Typography>
                  )}
                </>
              }
            />
            <Box>
              <IconButton
                size="small"
                onClick={(e) => handleMenuClick(e, medication)}
                aria-label="medication actions"
              >
                <MoreVertIcon />
              </IconButton>
            </Box>
          </MedicationItem>
        ))}
      </List>

      <Box p={2} sx={{ mt: 'auto' }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<NotificationsNoneIcon />}
          sx={{ textTransform: 'none', mt: 1 }}
        >
          Set Medication Reminders
        </Button>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleAction('view')}>View Details</MenuItem>
        <MenuItem onClick={() => handleAction('edit')}>Edit Medication</MenuItem>
        <MenuItem onClick={() => handleAction('log')}>Log Dose</MenuItem>
        <Divider />
        <MenuItem
          onClick={() => handleAction('snooze')}
          disabled={!selectedMed || !['due', 'soon', 'upcoming'].includes(selectedMed.status)}
        >
          Snooze Reminder
        </MenuItem>
        <MenuItem
          onClick={() => handleAction('skip')}
          disabled={!selectedMed || !['due', 'soon', 'upcoming'].includes(selectedMed.status)}
        >
          Skip Dose
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleAction('delete')} sx={{ color: theme.palette.error.main }}>
          Remove Medication
        </MenuItem>
      </Menu>
    </MedicationCard>
  );
};

export default MedicationTracker;