import { useState, ChangeEvent, FormEvent } from 'react';
import type { Theme } from '@mui/material/styles';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  useTheme,
  IconButton,
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
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  SelectChangeEvent,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import { format, addDays, subDays } from 'date-fns';

const GoalCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: theme.spacing(1),
  '& > * + *': {
    marginLeft: theme.spacing(1),
  },
}));



interface GoalItemProps {
  completed?: boolean;
}

const GoalItem = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== 'completed',
})<GoalItemProps>(({ theme, completed }) => ({
  padding: theme.spacing(1.5, 2),
  backgroundColor: completed ? theme.palette.action.selected : 'transparent',
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.completed': {
    opacity: 0.7,
    '& .MuiTypography-root': {
      textDecoration: 'line-through',
      color: theme.palette.text.secondary,
    },
  },
}));

const getGoalIcon = (category: string) => {
  switch (category) {
    case 'exercise':
      return <FitnessCenterIcon />;
    case 'nutrition':
      return <LocalDiningIcon />;
    case 'sleep':
      return <BedtimeIcon />;
    case 'hydration':
      return <WaterDropIcon />;
    case 'mindfulness':
      return <SelfImprovementIcon />;
    default:
      return <EmojiEventsIcon />;
  }
};

const getGoalColor = (category: string, theme: Theme) => {
  switch (category) {
    case 'exercise':
      return theme.palette.primary.main;
    case 'nutrition':
      return theme.palette.success.main;
    case 'sleep':
      return theme.palette.info.main;
    case 'hydration':
      return theme.palette.info.light;
    case 'mindfulness':
      return theme.palette.secondary.main;
    default:
      return theme.palette.primary.main;
  }
};

interface Goal {
  id: string;
  title: string;
  category: string;
  target: number;
  current: number;
  unit: string;
  frequency: string;
  startDate: Date;
  endDate: Date;
  completed: boolean;
  streak: number;
}

interface FormData {
  title: string;
  category: string;
  target: number;
  current: number;
  unit: string;
  frequency: string;
  startDate: string;
  endDate: string;
  notes: string;
}

const goals: Goal[] = [
  {
    id: 'goal1',
    title: 'Daily Steps',
    category: 'exercise',
    target: 10000,
    current: 8500,
    unit: 'steps',
    frequency: 'daily',
    startDate: subDays(new Date(), 30),
    endDate: addDays(new Date(), 60),
    completed: false,
    streak: 5,
  },
  {
    id: 'goal2',
    title: 'Vegetable Intake',
    category: 'nutrition',
    target: 5,
    current: 3,
    unit: 'servings',
    frequency: 'daily',
    startDate: subDays(new Date(), 15),
    endDate: addDays(new Date(), 15),
    completed: false,
    streak: 3,
  },
  {
    id: 'goal3',
    title: 'Sleep Duration',
    category: 'sleep',
    target: 8,
    current: 6.5,
    unit: 'hours',
    frequency: 'daily',
    startDate: subDays(new Date(), 7),
    endDate: addDays(new Date(), 21),
    completed: false,
    streak: 2,
  },
  {
    id: 'goal4',
    title: 'Water Intake',
    category: 'hydration',
    target: 8,
    current: 8,
    unit: 'glasses',
    frequency: 'daily',
    startDate: subDays(new Date(), 2),
    endDate: addDays(new Date(), 5),
    completed: true,
    streak: 2,
  },
];

const goalCategories = [
  { value: 'exercise', label: 'Exercise' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'hydration', label: 'Hydration' },
  { value: 'mindfulness', label: 'Mindfulness' },
  { value: 'other', label: 'Other' },
];

const frequencyOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom' },
];

export const HealthGoals = () => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [view, setView] = useState<'active' | 'completed'>('active');
  const [formData, setFormData] = useState<FormData>({
    title: '',
    category: 'exercise',
    target: 1,
    current: 0,
    unit: '',
    frequency: 'daily',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    notes: '',
  });

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      title: '',
      category: 'exercise',
      target: 1,
      current: 0,
      unit: '',
      frequency: 'daily',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      notes: '',
    });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'target' || name === 'current' ? Number(value) : value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('Goal data:', formData);
    handleCloseDialog();
  };

  const toggleGoalCompletion = (goalId: string) => {
    console.log('Toggle goal completion:', goalId);
  };

  const filteredGoals = goals.filter(goal =>
    view === 'completed' ? goal.completed : !goal.completed
  );

  const activeGoals = goals.filter(goal => !goal.completed);
  const completedGoals = goals.filter(goal => goal.completed);

  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const getDaysRemaining = (endDate: Date) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <GoalCard>
      <CardContent sx={{ flexGrow: 1, p: 0 }}>
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6" fontWeight={600}>
              Health Goals
            </Typography>
            <Box>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
                sx={{ textTransform: 'none' }}
              >
                New Goal
              </Button>
            </Box>
          </Box>

          <Box display="flex" gap={1} mt={1}>
            <Chip
              label={`Active (${activeGoals.length})`}
              onClick={() => setView('active')}
              color={view === 'active' ? 'primary' : 'default'}
              variant={view === 'active' ? 'filled' : 'outlined'}
              size="small"
            />
            <Chip
              label={`Completed (${completedGoals.length})`}
              onClick={() => setView('completed')}
              color={view === 'completed' ? 'success' : 'default'}
              variant={view === 'completed' ? 'filled' : 'outlined'}
              size="small"
            />
          </Box>
        </Box>

        {filteredGoals.length > 0 ? (
          <List sx={{ p: 2 }}>
            {filteredGoals.map((goal) => {
              const progress = calculateProgress(goal.current, goal.target);
              const daysRemaining = getDaysRemaining(goal.endDate);
              const isCompleted = goal.completed || progress >= 100;

              return (
                <GoalItem
                  key={goal.id}
                  className={isCompleted ? 'completed' : ''}
                  completed={isCompleted}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: `${getGoalColor(goal.category, theme)}20`,
                        color: getGoalColor(goal.category, theme),
                      }}
                    >
                      {getGoalIcon(goal.category)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center">
                        <Typography
                          variant="subtitle1"
                          fontWeight={500}
                          sx={{ mr: 1 }}
                        >
                          {goal.title}
                        </Typography>
                        {goal.streak > 0 && (
                          <Chip
                            label={`🔥 ${goal.streak}`}
                            size="small"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                          <Typography variant="body2" color="text.secondary">
                            {goal.current} of {goal.target} {goal.unit}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {progress}%
                          </Typography>
                        </Box>
                        <ProgressContainer>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                              flexGrow: 1,
                              height: 8,
                              borderRadius: 4,
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getGoalColor(goal.category, theme),
                              },
                            }}
                          />
                        </ProgressContainer>
                        <Box display="flex" justifyContent="space-between" mt={0.5}>
                          <Typography variant="caption" color="text.secondary">
                            {isCompleted ? 'Completed' : `${daysRemaining} days remaining`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(goal.startDate), 'MMM d')} - {format(new Date(goal.endDate), 'MMM d, yyyy')}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => toggleGoalCompletion(goal.id)}
                      color={isCompleted ? 'success' : 'default'}
                    >
                      <CheckCircleIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </GoalItem>
              );
            })}
          </List>
        ) : (
          <Box textAlign="center" py={4}>
            <EmojiEventsIcon color="disabled" fontSize="large" />
            <Typography color="textSecondary" mt={1}>
              No {view} goals found
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              sx={{ mt: 2, textTransform: 'none' }}
            >
              Create a New Goal
            </Button>
          </Box>
        )}
      </CardContent>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Set a New Health Goal</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Goal Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Daily Steps, Water Intake, Sleep Hours"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleSelectChange}
                    label="Category"
                    required
                  >
                    {goalCategories.map((cat) => (
                      <MenuItem key={cat.value} value={cat.value}>
                        <Box display="flex" alignItems="center">
                          <Box
                            sx={{
                              display: 'inline-flex',
                              mr: 1,
                              color: getGoalColor(cat.value, theme),
                            }}
                          >
                            {getGoalIcon(cat.value)}
                          </Box>
                          {cat.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Frequency</InputLabel>
                  <Select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleSelectChange}
                    label="Frequency"
                    required
                  >
                    {frequencyOptions.map((freq) => (
                      <MenuItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6} sm={4}>
                <TextField
                  fullWidth
                  label="Target"
                  name="target"
                  type="number"
                  value={formData.target}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>

              <Grid item xs={6} sm={4}>
                <TextField
                  fullWidth
                  label="Current"
                  name="current"
                  type="number"
                  value={formData.current}
                  onChange={handleInputChange}
                  inputProps={{ min: 0, max: formData.target }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  placeholder="e.g., steps, glasses, hours"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Target Date"
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: formData.startDate,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Why is this goal important to you?"
                />
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 1,
                    borderLeft: `3px solid ${getGoalColor(formData.category, theme)}`,
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    {formData.title || 'Your Goal'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formData.current || 0} of {formData.target} {formData.unit || 'units'}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={formData.target > 0
                      ? Math.min(Math.round(((formData.current || 0) / formData.target) * 100), 100)
                      : 0}
                    sx={{
                      mt: 1,
                      height: 6,
                      borderRadius: 3,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getGoalColor(formData.category, theme),
                      },
                    }}
                  />
                  <Box display="flex" justifyContent="space-between" mt={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      {formData.startDate ? format(new Date(formData.startDate), 'MMM d') : 'Start date'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formData.endDate ? format(new Date(formData.endDate), 'MMM d, yyyy') : 'End date'}
                    </Typography>
                  </Box>
                </Box>
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
              disabled={!formData.title || !formData.target}
            >
              Save Goal
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </GoalCard>
  );
};

export default HealthGoals;