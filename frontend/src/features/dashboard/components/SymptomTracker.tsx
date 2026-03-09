import { useState, ChangeEvent, FormEvent } from 'react';
import {
  Box,
  Card,
  CardContent,
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
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
  SelectChangeEvent,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EventNoteIcon from '@mui/icons-material/EventNote';
import MoodBadIcon from '@mui/icons-material/MoodBad';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import { format, subDays } from 'date-fns';

const SymptomCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const SeverityMeter = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: theme.spacing(1),
  '& > *': {
    marginRight: theme.spacing(0.5),
  },
}));

const SeverityLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(1),
  display: 'flex',
  justifyContent: 'space-between',
}));

const SymptomItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  '&:not(:last-child)': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const FrequencyChip = styled(Chip)(() => ({
  fontSize: '0.7rem',
  height: 20,
  '& .MuiChip-label': {
    padding: '0 6px',
  },
}));

interface Symptom {
  id: string;
  name: string;
  severity: number;
  frequency: string;
  startDate: Date;
  notes: string;
  triggers: string[];
  status: 'active' | 'resolved';
}

interface FormData {
  name: string;
  severity: number;
  frequency: string;
  startDate: Date;
  notes: string;
  triggers: string[];
  customTrigger: string;
}

const symptoms: Symptom[] = [
  {
    id: 'headache',
    name: 'Headache',
    severity: 4,
    frequency: '2-3 times/day',
    startDate: subDays(new Date(), 2),
    notes: 'Worsens in the afternoon',
    triggers: ['Stress', 'Lack of sleep'],
    status: 'active',
  },
  {
    id: 'fatigue',
    name: 'Fatigue',
    severity: 3,
    frequency: 'Daily',
    startDate: subDays(new Date(), 5),
    notes: 'Better with rest',
    triggers: ['Poor sleep', 'Overexertion'],
    status: 'active',
  },
  {
    id: 'nausea',
    name: 'Nausea',
    severity: 2,
    frequency: 'Occasional',
    startDate: subDays(new Date(), 1),
    notes: 'Mild, related to new medication',
    triggers: [],
    status: 'resolved',
  },
];

const severityMarks = [
  { value: 1, label: 'Mild' },
  { value: 2, label: 'Moderate' },
  { value: 3, label: 'Medium' },
  { value: 4, label: 'Severe' },
  { value: 5, label: 'Extreme' },
];

const frequencyOptions = [
  'Occasional',
  'Daily',
  '2-3 times/day',
  'Hourly',
  'Constant',
];

const commonTriggers = [
  'Stress',
  'Lack of sleep',
  'Certain foods',
  'Weather changes',
  'Exercise',
  'Medication',
  'Allergens',
  'Dehydration',
];

const getSeverityIcon = (severity: number) => {
  switch (severity) {
    case 1:
      return <SentimentSatisfiedIcon color="success" />;
    case 2:
      return <SentimentDissatisfiedIcon color="info" />;
    case 3:
      return <SentimentDissatisfiedIcon color="warning" />;
    case 4:
      return <SentimentVeryDissatisfiedIcon color="error" />;
    case 5:
      return <MoodBadIcon color="error" />;
    default:
      return <SentimentSatisfiedIcon color="disabled" />;
  }
};

const getSeverityLabel = (severity: number): string => {
  switch (severity) {
    case 1:
      return 'Mild';
    case 2:
      return 'Moderate';
    case 3:
      return 'Medium';
    case 4:
      return 'Severe';
    case 5:
      return 'Extreme';
    default:
      return 'Unknown';
  }
};

export const SymptomTracker = () => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    severity: 3,
    frequency: '',
    startDate: new Date(),
    notes: '',
    triggers: [],
    customTrigger: '',
  });

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, _symptom: Symptom) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      name: '',
      severity: 3,
      frequency: '',
      startDate: new Date(),
      notes: '',
      triggers: [],
      customTrigger: '',
    });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSeverityChange = (_event: Event, newValue: number | number[]) => {
    setFormData(prev => ({
      ...prev,
      severity: newValue as number
    }));
  };

  const handleTriggerToggle = (_event: React.MouseEvent<HTMLElement>, newTriggers: string[]) => {
    setFormData(prev => ({
      ...prev,
      triggers: newTriggers,
    }));
  };

  const handleAddCustomTrigger = () => {
    if (formData.customTrigger.trim() && !formData.triggers.includes(formData.customTrigger)) {
      setFormData(prev => ({
        ...prev,
        triggers: [...prev.triggers, prev.customTrigger.trim()],
        customTrigger: '',
      }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('Symptom data:', formData);
    handleCloseDialog();
  };

  const activeSymptoms = symptoms.filter(s => s.status === 'active');
  const resolvedSymptoms = symptoms.filter(s => s.status === 'resolved');

  return (
    <SymptomCard>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={600}>
            Symptom Tracker
          </Typography>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            sx={{ textTransform: 'none' }}
          >
            Log Symptom
          </Button>
        </Box>

        {activeSymptoms.length > 0 ? (
          <List disablePadding>
            {activeSymptoms.map((symptom) => (
              <SymptomItem key={symptom.id}>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: theme.palette.primary.light, width: 40, height: 40 }}>
                    {getSeverityIcon(symptom.severity)}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="subtitle1" fontWeight={500}>
                        {symptom.name}
                      </Typography>
                      <Box display="flex" alignItems="center">
                        <FrequencyChip
                          label={symptom.frequency}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 1 }}
                        />
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, symptom)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Box display="flex" alignItems="center" mt={0.5}>
                        <SeverityMeter>
                          {[1, 2, 3, 4, 5].map((level) => (
                            <Box
                              key={level}
                              sx={{
                                width: 8,
                                height: 16,
                                borderRadius: 1,
                                bgcolor: level <= symptom.severity
                                  ? theme.palette.error.main
                                  : theme.palette.action.disabledBackground,
                                transition: 'all 0.2s',
                              }}
                            />
                          ))}
                        </SeverityMeter>
                      </Box>
                      <SeverityLabel>
                        <span>{getSeverityLabel(symptom.severity)}</span>
                        <span>Started {format(symptom.startDate, 'MMM d')}</span>
                      </SeverityLabel>
                      {symptom.notes && (
                        <Typography variant="body2" color="text.secondary" mt={0.5}>
                          {symptom.notes}
                        </Typography>
                      )}
                      {symptom.triggers && symptom.triggers.length > 0 && (
                        <Box mt={1}>
                          {symptom.triggers.map((trigger) => (
                            <Chip
                              key={trigger}
                              label={trigger}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  }
                />
              </SymptomItem>
            ))}
          </List>
        ) : (
          <Box textAlign="center" py={4}>
            <EventNoteIcon color="disabled" fontSize="large" />
            <Typography color="textSecondary" mt={1}>
              No active symptoms to display
            </Typography>
          </Box>
        )}

        {resolvedSymptoms.length > 0 && (
          <Box mt={3}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Resolved Symptoms
            </Typography>
            <List disablePadding>
              {resolvedSymptoms.map((symptom) => (
                <SymptomItem key={symptom.id} sx={{ opacity: 0.7 }}>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">
                          {symptom.name}
                        </Typography>
                        <Chip
                          label="Resolved"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      </Box>
                    }
                  />
                </SymptomItem>
              ))}
            </List>
          </Box>
        )}
      </CardContent>

      {/* Add/Edit Symptom Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Log New Symptom</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Symptom Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Headache, Nausea, Dizziness"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography gutterBottom>Severity</Typography>
                <Box sx={{ px: 2 }}>
                  <Slider
                    value={formData.severity}
                    min={1}
                    max={5}
                    step={1}
                    marks={severityMarks}
                    valueLabelDisplay="auto"
                    onChange={handleSeverityChange}
                    valueLabelFormat={(value) => getSeverityLabel(value)}
                  />
                </Box>
                <Box display="flex" justifyContent="center" mt={1}>
                  {getSeverityIcon(formData.severity)}
                  <Typography ml={1}>
                    {getSeverityLabel(formData.severity)}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Frequency</InputLabel>
                  <Select
                    value={formData.frequency}
                    onChange={handleSelectChange}
                    label="Frequency"
                    name="frequency"
                    required
                  >
                    <MenuItem value="">Select frequency</MenuItem>
                    {frequencyOptions.map((freq) => (
                      <MenuItem key={freq} value={freq}>
                        {freq}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  name="startDate"
                  value={format(formData.startDate, 'yyyy-MM-dd')}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : new Date();
                    setFormData(prev => ({ ...prev, startDate: date }));
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
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
                  placeholder="Describe your symptoms, when they occur, what makes them better/worse, etc."
                />
              </Grid>

              <Grid item xs={12}>
                <Typography gutterBottom>Possible Triggers</Typography>
                <ToggleButtonGroup
                  value={formData.triggers}
                  onChange={handleTriggerToggle}
                  aria-label="triggers"
                  sx={{ flexWrap: 'wrap', gap: 1, '& > *': { m: '4px !important' } }}
                >
                  {commonTriggers.map((trigger) => (
                    <ToggleButton
                      key={trigger}
                      value={trigger}
                      size="small"
                      sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: '16px !important',
                        padding: '4px 12px',
                        '&.Mui-selected': {
                          backgroundColor: `${theme.palette.primary.light}33`,
                          borderColor: theme.palette.primary.main,
                          color: theme.palette.primary.dark,
                          '&:hover': {
                            backgroundColor: `${theme.palette.primary.light}55`,
                          },
                        },
                      }}
                    >
                      {trigger}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>

                <Box display="flex" mt={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Add custom trigger"
                    value={formData.customTrigger}
                    onChange={(e) => setFormData(prev => ({ ...prev, customTrigger: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTrigger()}
                  />
                  <Button
                    onClick={handleAddCustomTrigger}
                    disabled={!formData.customTrigger.trim()}
                    sx={{ ml: 1 }}
                  >
                    Add
                  </Button>
                </Box>

                {formData.triggers.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="caption" color="textSecondary">
                      Selected triggers:
                    </Typography>
                    <Box mt={0.5}>
                      {formData.triggers.map((trigger) => (
                        <Chip
                          key={trigger}
                          label={trigger}
                          size="small"
                          onDelete={() => {
                            setFormData(prev => ({
                              ...prev,
                              triggers: prev.triggers.filter(t => t !== trigger),
                            }));
                          }}
                          sx={{ m: 0.5 }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
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
              disabled={!formData.name || !formData.frequency}
            >
              Save Symptom
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Context Menu */}
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
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <AccessTimeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View History</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <TrendingUpIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Track Pattern</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <TrendingDownIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mark as Resolved</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: theme.palette.error.main }}>
          <ListItemIcon sx={{ color: 'inherit' }}>
            <MoreVertIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </SymptomCard>
  );
};

export default SymptomTracker;