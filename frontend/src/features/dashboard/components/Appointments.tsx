import { useState, ChangeEvent, FormEvent, SyntheticEvent } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  Avatar,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tabs,
  Tab,
  Badge,
  SelectChangeEvent,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import EventNoteIcon from '@mui/icons-material/EventNote';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { format, addDays, isToday, isTomorrow, isPast, isFuture } from 'date-fns';

const AppointmentCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const AppointmentItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(2),
  '&:not(:last-child)': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  '&.today': {
    borderLeft: `4px solid ${theme.palette.success.main}`,
  },
  '&.upcoming': {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
  },
  '&.past': {
    borderLeft: `4px solid ${theme.palette.grey[400]}`,
  },
}));

interface StatusChipProps {
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
}

const StatusChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'status',
})<StatusChipProps>(({ theme, status }) => ({
  textTransform: 'capitalize',
  ...(status === 'confirmed' && {
    backgroundColor: theme.palette.success.light + '33',
    color: theme.palette.success.dark,
  }),
  ...(status === 'pending' && {
    backgroundColor: theme.palette.warning.light + '33',
    color: theme.palette.warning.dark,
  }),
  ...(status === 'cancelled' && {
    backgroundColor: theme.palette.error.light + '33',
    color: theme.palette.error.dark,
    textDecoration: 'line-through',
  }),
  ...(status === 'completed' && {
    backgroundColor: theme.palette.info.light + '33',
    color: theme.palette.info.dark,
  }),
}));

interface AppointmentForm {
  title: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  address: string;
  type: string;
  notes: string;
}

interface Appointment extends AppointmentForm {
  id: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
}

const appointments: Appointment[] = [
  {
    id: 'appt1',
    title: 'Cardiology Follow-up',
    doctor: 'Dr. Alem Mulugeta',
    specialty: 'Cardiology',
    date: addDays(new Date(), 1).toISOString().split('T')[0],
    time: '10:00',
    duration: '30',
    location: 'St. Paul\'s Hospital',
    address: '123 Medical Center Dr, Addis Ababa',
    status: 'confirmed',
    type: 'follow-up',
    notes: 'Bring recent test results',
  },
  {
    id: 'appt2',
    title: 'Lab Work - Annual Checkup',
    doctor: 'Lab Technician',
    specialty: 'Laboratory',
    date: addDays(new Date(), 10).toISOString().split('T')[0],
    time: '14:30',
    duration: '60',
    location: 'Central Lab',
    address: '456 Health St, Addis Ababa',
    status: 'confirmed',
    type: 'lab',
    notes: 'Fasting required for 12 hours',
  },
  {
    id: 'appt3',
    title: 'Dental Cleaning',
    doctor: 'Dr. Sara Abebe',
    specialty: 'Dentistry',
    date: addDays(new Date(), 14).toISOString().split('T')[0],
    time: '09:00',
    duration: '45',
    location: 'Dental Care Clinic',
    address: '789 Smile Ave, Addis Ababa',
    status: 'pending',
    type: 'cleaning',
    notes: 'Bring insurance card',
  },
  {
    id: 'appt4',
    title: 'Physical Therapy',
    doctor: 'Dr. Michael Johnson',
    specialty: 'Physical Therapy',
    date: addDays(new Date(), -2).toISOString().split('T')[0],
    time: '11:00',
    duration: '45',
    location: 'Rehab Center',
    address: '321 Recovery Rd, Addis Ababa',
    status: 'completed',
    type: 'therapy',
    notes: 'Follow-up exercises assigned',
  },
];

const appointmentTypes = [
  { value: 'checkup', label: 'Check-up' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'lab', label: 'Lab Work' },
  { value: 'procedure', label: 'Procedure' },
  { value: 'therapy', label: 'Therapy' },
  { value: 'cleaning', label: 'Dental Cleaning' },
  { value: 'other', label: 'Other' },
];

const getAppointmentStatus = (dateString: string): 'today' | 'tomorrow' | 'past' | 'upcoming' => {
  const appointmentDate = new Date(dateString);

  if (isToday(appointmentDate)) return 'today';
  if (isTomorrow(appointmentDate)) return 'tomorrow';
  if (isPast(appointmentDate)) return 'past';
  return 'upcoming';
};

const getStatusLabel = (status: 'confirmed' | 'pending' | 'cancelled' | 'completed'): string => {
  switch (status) {
    case 'confirmed':
      return 'Confirmed';
    case 'pending':
      return 'Pending';
    case 'cancelled':
      return 'Cancelled';
    case 'completed':
      return 'Completed';
    default:
      return 'Scheduled';
  }
};

export const Appointments = () => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [tabValue, setTabValue] = useState<number>(0);
  const [formData, setFormData] = useState<AppointmentForm>({
    title: '',
    doctor: '',
    specialty: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: '30',
    location: '',
    address: '',
    type: 'checkup',
    notes: '',
  });

  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      title: '',
      doctor: '',
      specialty: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      duration: '30',
      location: '',
      address: '',
      type: 'checkup',
      notes: '',
    });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('Appointment data:', formData);
    handleCloseDialog();
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const formatDuration = (duration: string) => {
    const minutes = parseInt(duration);
    if (minutes < 60) return `${minutes} min`;
    if (minutes === 60) return '1 hour';
    return `${minutes / 60} hours`;
  };

  const filteredAppointments = appointments.filter(appt => {
    const apptDate = new Date(appt.date);

    if (tabValue === 0) return isToday(apptDate);
    if (tabValue === 1) return isFuture(apptDate) || isToday(apptDate);
    if (tabValue === 2) return isPast(apptDate) && !isToday(apptDate);
    return true;
  });

  const upcomingCount = appointments.filter(appt =>
    isFuture(new Date(appt.date)) || isToday(new Date(appt.date))
  ).length;

  const pastCount = appointments.filter(appt =>
    isPast(new Date(appt.date)) && !isToday(new Date(appt.date))
  ).length;

  const todayCount = appointments.filter(appt =>
    isToday(new Date(appt.date))
  ).length;

  return (
    <AppointmentCard>
      <CardContent sx={{ flexGrow: 1, p: 0 }}>
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6" fontWeight={600}>
              Appointments
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              sx={{ textTransform: 'none' }}
            >
              New Appointment
            </Button>
          </Box>

          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ minHeight: 'auto', '& .MuiTab-root': { minHeight: 48 } }}
          >
            <Tab
              label={
                <Badge badgeContent={todayCount} color="primary" sx={{ mr: 1 }}>
                  <span>Today</span>
                </Badge>
              }
            />
            <Tab
              label={
                <Badge badgeContent={upcomingCount} color="primary" sx={{ mr: 1 }}>
                  <span>Upcoming</span>
                </Badge>
              }
            />
            <Tab
              label={
                <Badge badgeContent={pastCount} color="primary" sx={{ mr: 1 }}>
                  <span>Past</span>
                </Badge>
              }
            />
            <Tab label="All" />
          </Tabs>
        </Box>

        {filteredAppointments.length > 0 ? (
          <List disablePadding>
            {filteredAppointments.map((appt) => {
              const status = getAppointmentStatus(appt.date);
              const isPastAppt = status === 'past';

              return (
                <AppointmentItem
                  key={appt.id}
                  className={status}
                  sx={{
                    '&.today': {
                      backgroundColor: theme.palette.success.light + '0a',
                    },
                    '&.upcoming': {
                      backgroundColor: theme.palette.info.light + '0a',
                    },
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ bgcolor: theme.palette.primary.light, width: 40, height: 40, mr: 2 }}>
                          <LocalHospitalIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={500}>
                            {appt.title}
                          </Typography>
                          <Box display="flex" alignItems="center" flexWrap="wrap">
                            <Box display="flex" alignItems="center" mr={2}>
                              <PersonIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                              <Typography variant="body2" color="text.secondary">
                                {appt.doctor}
                              </Typography>
                              {appt.specialty && (
                                <Chip
                                  label={appt.specialty}
                                  size="small"
                                  sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                      <Box textAlign="right">
                        <StatusChip
                          label={getStatusLabel(appt.status)}
                          size="small"
                          status={appt.status}
                          sx={{ mb: 0.5 }}
                        />
                        <Typography variant="caption" display="block" color="text.secondary">
                          {format(new Date(appt.date), 'MMM d, yyyy')}
                        </Typography>
                      </Box>
                    </Box>

                    <Grid container spacing={2} sx={{ mt: 0.5, ml: 6 }}>
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <AccessTimeIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                          <Typography variant="body2">
                            {formatTime(appt.time)} • {formatDuration(appt.duration)}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                          <LocationOnIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                          <Box>
                            <Typography variant="body2">{appt.location}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {appt.address}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        {appt.notes && (
                          <Box
                            sx={{
                              p: 1,
                              backgroundColor: theme.palette.background.paper,
                              borderRadius: 1,
                              borderLeft: `3px solid ${theme.palette.primary.main}`,
                            }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              Notes:
                            </Typography>
                            <Typography variant="body2">{appt.notes}</Typography>
                          </Box>
                        )}
                      </Grid>
                    </Grid>

                    <Box display="flex" justifyContent="flex-end" mt={1}>
                      {!isPastAppt ? (
                        <>
                          <Button size="small" sx={{ mr: 1, textTransform: 'none' }}>
                            Reschedule
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            sx={{ textTransform: 'none' }}
                          >
                            Join Now
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ textTransform: 'none' }}
                        >
                          View Details
                        </Button>
                      )}
                    </Box>
                  </Box>
                </AppointmentItem>
              );
            })}
          </List>
        ) : (
          <Box textAlign="center" py={4}>
            <EventNoteIcon color="disabled" fontSize="large" />
            <Typography color="textSecondary" mt={1}>
              No {tabValue === 0 ? 'today' : tabValue === 1 ? 'upcoming' : tabValue === 2 ? 'past' : ''} appointments found
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              sx={{ mt: 2, textTransform: 'none' }}
            >
              Schedule an Appointment
            </Button>
          </Box>
        )}
      </CardContent>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Schedule New Appointment</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Appointment Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Annual Check-up, Consultation"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleSelectChange}
                    label="Type"
                    required
                  >
                    {appointmentTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Doctor's Name"
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Specialty"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleInputChange}
                  placeholder="e.g., Cardiology, Dermatology"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box display="flex" gap={2}>
                  <TextField
                    fullWidth
                    label="Time"
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                  <FormControl fullWidth>
                    <InputLabel>Duration</InputLabel>
                    <Select
                      name="duration"
                      value={formData.duration}
                      onChange={handleSelectChange}
                      label="Duration"
                      required
                    >
                      <MenuItem value="15">15 min</MenuItem>
                      <MenuItem value="30">30 min</MenuItem>
                      <MenuItem value="45">45 min</MenuItem>
                      <MenuItem value="60">1 hour</MenuItem>
                      <MenuItem value="90">1.5 hours</MenuItem>
                      <MenuItem value="120">2 hours</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Hospital Name, Clinic Name"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Full address of the location"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any special instructions or notes for the appointment"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleCloseDialog} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!formData.title || !formData.doctor || !formData.date || !formData.time}
            >
              Schedule Appointment
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </AppointmentCard>
  );
};

export default Appointments;