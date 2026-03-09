import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Tabs,
  Tab,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  InputAdornment,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Stack,
  IconButton,
} from '@mui/material';
import {
  Search,
  LocalHospital,
  CheckCircle,
  Info,
  ExpandMore,
  FilterList,
  Clear,
  Warning,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { PrimaryButton } from '@/components/ui';
import { Disease, DiseaseCategory, RegionalPrevalence } from '@/types';
import { BodyMap } from '@/components/ui/body-map/BodyMap';

interface DiseaseLibraryProps {
  diseases?: Disease[];
  visualAssets?: Record<string, any>;
  searchQuery?: string;
  categoryFilter?: DiseaseCategory;
  regionalData?: RegionalPrevalence[];
  onDiseaseSelect?: (disease: Disease) => void;
  language?: 'en' | 'am';
  userLocation?: string;
}

const diseaseCategories: Array<{ value: DiseaseCategory; label: string; labelAm: string }> = [
  { value: 'infectious', label: 'Infectious Diseases', labelAm: 'ተላላፊ በሽታዎች' },
  { value: 'chronic', label: 'Chronic Conditions', labelAm: 'ዘላቂ ሁኔታዎች' },
  { value: 'respiratory', label: 'Respiratory Illnesses', labelAm: 'የመተንፈሻ በሽታዎች' },
  { value: 'maternal-child', label: 'Maternal & Child Health', labelAm: 'የእናት እና ልጅ ጤና' },
  { value: 'tropical', label: 'Tropical Diseases', labelAm: 'የሙቀት ሰፈር በሽታዎች' },
  { value: 'common-ailments', label: 'Common Ailments', labelAm: 'ተራ በሽታዎች' },
];

const severityLevels = [
  { value: 'all', label: 'All Severities' },
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
  { value: 'critical', label: 'Critical' },
];

const urgencyLevels = [
  { value: 'all', label: 'All Urgency Levels' },
  { value: 'emergency', label: 'Emergency (Immediate Care)' },
  { value: 'chronic', label: 'Chronic (Long-term Management)' },
  { value: 'acute', label: 'Acute (Short-term Treatment)' },
  { value: 'self-limiting', label: 'Self-limiting (Resolves on its own)' },
];

const seasonalOptions = [
  { value: 'all', label: 'All Seasons' },
  { value: 'rainy', label: 'Rainy Season' },
  { value: 'dry', label: 'Dry Season' },
  { value: 'year-round', label: 'Year-round' },
];

const mockDiseases: Disease[] = [
  {
    id: '1',
    name: 'Malaria',
    nameAmharic: 'አንደኛ ዓይነት ትኩሳት',
    category: 'infectious',
    description: 'A mosquito-borne infectious disease caused by Plasmodium parasites.',
    symptoms: ['Fever', 'Chills', 'Headache', 'Fatigue', 'Nausea'],
    causes: ['Mosquito bites', 'Plasmodium parasites'],
    prevention: ['Use mosquito nets', 'Wear protective clothing', 'Use insect repellent'],
    treatment: ['Antimalarial medications', 'Rest', 'Fluid intake'],
    severity: 'severe',
    prevalence: { region: 'Ethiopia', prevalence: 'high' },
    seasonal: ['Rainy season'],
    bodyRegions: ['head', 'chest', 'abdomen'],
  },
  {
    id: '2',
    name: 'Diabetes',
    nameAmharic: 'ስኳር በሽታ',
    category: 'chronic',
    description: 'A chronic condition that affects how your body processes blood sugar.',
    symptoms: ['Increased thirst', 'Frequent urination', 'Fatigue', 'Blurred vision'],
    causes: ['Genetics', 'Lifestyle factors', 'Obesity'],
    prevention: ['Healthy diet', 'Regular exercise', 'Weight management'],
    treatment: ['Medication', 'Diet control', 'Exercise', 'Monitoring'],
    severity: 'moderate',
    prevalence: { region: 'Ethiopia', prevalence: 'medium' },
    bodyRegions: ['abdomen', 'leftLeg', 'rightLeg'],
  },
  {
    id: '3',
    name: 'Hypertension',
    nameAmharic: 'የደም ግፊት',
    category: 'chronic',
    description: 'High blood pressure (Hypertension) is a chronic cardiovascular condition affecting the circulatory system and multiple organ systems.',
    symptoms: [
      'Persistent headaches (especially back of head)',
      'Blurred vision',
      'Buzzing or ringing sounds (tinnitus)',
      'Facial flushing',
      'Nosebleeds',
      'Chest pain or pressure',
      'Palpitations',
      'Irregular heartbeat',
      'Shortness of breath',
      'Dizziness',
      'Lightheadedness',
      'Confusion',
      'Unsteadiness',
      'Feeling faint',
      'Fatigue',
      'Weakness',
      'Numbness or tingling in hands/feet',
    ],
    causes: [
      'Genetics and family history',
      'Age (risk increases with age)',
      'Obesity and overweight',
      'Lack of physical activity',
      'High salt intake',
      'Excessive alcohol consumption',
      'Tobacco use',
      'Chronic stress',
      'Certain medical conditions (kidney disease, diabetes)',
    ],
    prevention: [
      'Maintain healthy weight',
      'Regular exercise (at least 30 minutes daily)',
      'Reduce salt intake',
      'Eat a balanced diet rich in fruits and vegetables',
      'Limit alcohol consumption',
      'Quit smoking',
      'Manage stress through relaxation techniques',
      'Regular blood pressure monitoring',
      'Follow medication regimen if prescribed',
    ],
    treatment: [
      'Lifestyle modifications (diet, exercise)',
      'Blood pressure medications (ACE inhibitors, diuretics, beta-blockers)',
      'Regular monitoring and follow-up',
      'Weight management',
      'Stress management',
      'Quitting smoking and limiting alcohol',
    ],
    severity: 'moderate',
    prevalence: { region: 'Ethiopia', prevalence: 'high' },
    bodyRegions: [
      'head',
      'eyes',
      'ears',
      'face',
      'chest',
      'heart',
      'lungs',
      'brain',
      'leftArm',
      'rightArm',
      'abdomen',
      'kidneys',
      'leftLeg',
      'rightLeg',
    ],
    progressionTimeline: [
      {
        stage: 'Stage 1 (Mild)',
        duration: 'Early stage',
        symptoms: ['Occasional headaches', 'Mild dizziness'],
        severity: 'mild' as const,
      },
      {
        stage: 'Stage 2 (Moderate)',
        duration: 'Progressive stage',
        symptoms: ['Frequent headaches', 'Vision problems', 'Chest discomfort'],
        severity: 'moderate' as const,
      },
      {
        stage: 'Stage 3 (Severe)',
        duration: 'Advanced stage',
        symptoms: ['Severe headaches', 'Chest pain', 'Difficulty breathing', 'Confusion'],
        severity: 'severe' as const,
      },
    ],
    visualAssets: {
      bodyMapRegions: ['head', 'chest', 'heart', 'kidneys', 'eyes'],
      symptomIcons: ['headache', 'chest-pain', 'dizziness'],
      infographics: ['blood-pressure-chart', 'risk-factors'],
      flowcharts: ['diagnosis-flowchart', 'treatment-decision-tree'],
    },
  },
];

export const DiseaseLibrary: React.FC<DiseaseLibraryProps> = ({
  diseases: propDiseases,
  searchQuery: initialSearchQuery,
  categoryFilter: initialCategoryFilter,
  onDiseaseSelect,
  language,
  userLocation: _userLocation,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [categoryFilter, setCategoryFilter] = useState<DiseaseCategory | 'all'>(initialCategoryFilter || 'all');
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBodyRegions, setSelectedBodyRegions] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [seasonalFilter, setSeasonalFilter] = useState<string>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const diseases = propDiseases || mockDiseases;

  // Extract all unique symptoms from diseases for autocomplete
  const allSymptoms = useMemo(() => {
    const symptomSet = new Set<string>();
    diseases.forEach((disease) => {
      disease.symptoms.forEach((symptom) => {
        symptomSet.add(symptom);
      });
    });
    return Array.from(symptomSet).sort();
  }, [diseases]);

  const filteredDiseases = useMemo(() => {
    let filtered = diseases;

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((d) => d.category === categoryFilter);
    }

    // Filter by search query (name, description, symptoms)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.nameAmharic?.toLowerCase().includes(query) ||
          d.description.toLowerCase().includes(query) ||
          d.symptoms.some((s) => s.toLowerCase().includes(query)) ||
          d.causes.some((c) => c.toLowerCase().includes(query)),
      );
    }

    // Filter by selected symptoms
    if (selectedSymptoms.length > 0) {
      filtered = filtered.filter((d) =>
        selectedSymptoms.some((symptom) =>
          d.symptoms.some((s) => s.toLowerCase().includes(symptom.toLowerCase())),
        ),
      );
    }

    // Filter by body regions
    if (selectedBodyRegions.length > 0) {
      filtered = filtered.filter((d) =>
        selectedBodyRegions.some((region) => d.bodyRegions.includes(region)),
      );
    }

    // Filter by severity
    if (severityFilter !== 'all') {
      filtered = filtered.filter((d) => d.severity === severityFilter);
    }

    // Filter by urgency (based on severity and category)
    if (urgencyFilter !== 'all') {
      filtered = filtered.filter((d) => {
        if (urgencyFilter === 'emergency') {
          return d.severity === 'critical' || d.severity === 'severe';
        }
        if (urgencyFilter === 'chronic') {
          return d.category === 'chronic';
        }
        if (urgencyFilter === 'acute') {
          return d.category === 'infectious' || d.severity === 'moderate';
        }
        if (urgencyFilter === 'self-limiting') {
          return d.severity === 'mild';
        }
        return true;
      });
    }

    // Filter by seasonal
    if (seasonalFilter !== 'all') {
      filtered = filtered.filter((d) => {
        if (!d.seasonal || d.seasonal.length === 0) {
          return seasonalFilter === 'year-round';
        }
        return d.seasonal.some((season) => {
          const seasonLower = season.toLowerCase();
          if (seasonalFilter === 'rainy') {
            return seasonLower.includes('rainy') || seasonLower.includes('wet');
          }
          if (seasonalFilter === 'dry') {
            return seasonLower.includes('dry');
          }
          return true;
        });
      });
    }

    const computeMatchScore = (d: Disease) => {
      let score = 0;
      const reasons: string[] = [];

      if (selectedBodyRegions.length) {
        const bodyHits = selectedBodyRegions.filter((r) => d.bodyRegions.includes(r)).length;
        if (bodyHits > 0) {
          score += Math.min(bodyHits * 3, 6);
          reasons.push(`Body regions match (${bodyHits})`);
        }
      }

      if (selectedSymptoms.length) {
        const symptomHits = selectedSymptoms.filter((s) =>
          d.symptoms.some((ds) => ds.toLowerCase().includes(s.toLowerCase())),
        ).length;
        if (symptomHits > 0) {
          score += Math.min(symptomHits * 2, 4);
          reasons.push(`Symptom overlap (${symptomHits})`);
        }
      }

      // Mild bonus for severity alignment with urgency filter
      if (urgencyFilter === 'emergency' && (d.severity === 'critical' || d.severity === 'severe')) {
        score += 1;
        reasons.push('Urgency aligned');
      }
      return { score: Math.min(score, 10), reasons };
    };

    return filtered
      .map((d) => ({ disease: d, match: computeMatchScore(d) }))
      .sort((a, b) => b.match.score - a.match.score)
      .map(({ disease, match }) => ({ ...disease, match }));
  }, [
    diseases,
    categoryFilter,
    searchQuery,
    selectedBodyRegions,
    selectedSymptoms,
    severityFilter,
    urgencyFilter,
    seasonalFilter,
  ]);

  const handleDiseaseClick = (disease: Disease) => {
    setSelectedDisease(disease);
    setDialogOpen(true);
    onDiseaseSelect?.(disease);
  };

  const handleBodyRegionSelect = (region: string) => {
    setSelectedBodyRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region],
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setSelectedBodyRegions([]);
    setSelectedSymptoms([]);
    setSeverityFilter('all');
    setUrgencyFilter('all');
    setSeasonalFilter('all');
  };

  const getSeverityColor = (severity: Disease['severity']) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'severe':
        return 'error';
      case 'moderate':
        return 'warning';
      default:
        return 'info';
    }
  };

  const activeFiltersCount =
    (categoryFilter !== 'all' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0) +
    selectedBodyRegions.length +
    selectedSymptoms.length +
    (severityFilter !== 'all' ? 1 : 0) +
    (urgencyFilter !== 'all' ? 1 : 0) +
    (seasonalFilter !== 'all' ? 1 : 0);

  return (
    <Box>
      {/* Hero Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4eb6f2 0%, #4A90E2 60%, #2C3E50 100%)',
          color: 'white',
          py: 6,
          textAlign: 'center',
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          {t('diseases.title')}
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          {t('diseases.subtitle')}
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
        {/* Search and Quick Filters */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Stack spacing={3}>
            {/* Search Bar */}
            <TextField
              fullWidth
              placeholder={t('diseases.searchPlaceholder') || 'Search diseases, symptoms, or conditions...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
                endAdornment:
                  searchQuery.trim() && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchQuery('')}>
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              }}
            />

            {/* Symptom Autocomplete */}
            <Autocomplete
              multiple
              options={allSymptoms}
              value={selectedSymptoms}
              onChange={(_, newValue) => setSelectedSymptoms(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Filter by Symptoms"
                  placeholder="Type to search symptoms..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option}
                    label={option}
                    size="small"
                    sx={{
                      bgcolor: 'primary.light',
                      color: 'white',
                      '& .MuiChip-deleteIcon': {
                        color: 'white',
                      },
                    }}
                  />
                ))
              }
            />

            {/* Category Tabs */}
            <Box>
              <Tabs
                value={categoryFilter}
                onChange={(_, newValue) => setCategoryFilter(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    color: 'text.secondary',
                    fontWeight: 600,
                    textTransform: 'none',
                    minHeight: 48,
                    '&.Mui-selected': {
                      color: 'primary.main',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: 'primary.main',
                    height: 3,
                  },
                }}
              >
                <Tab label={t('diseases.all') || 'All'} value="all" />
                {diseaseCategories.map((cat) => (
                  <Tab
                    key={cat.value}
                    label={language === 'am' ? cat.labelAm : cat.label}
                    value={cat.value}
                  />
                ))}
              </Tabs>
            </Box>

            {/* Advanced Filters Toggle */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Button
                startIcon={<FilterList />}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                sx={{ color: 'primary.main' }}
              >
                Advanced Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </Button>
              {activeFiltersCount > 0 && (
                <Button
                  startIcon={<Clear />}
                  onClick={clearAllFilters}
                  size="small"
                  sx={{ color: 'text.secondary' }}
                >
                  Clear All
                </Button>
              )}
            </Box>

            {/* Advanced Filters Accordion */}
            <Accordion expanded={showAdvancedFilters} onChange={() => setShowAdvancedFilters(!showAdvancedFilters)}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography fontWeight={600}>Additional Filters</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Severity Level</InputLabel>
                      <Select
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value)}
                        label="Severity Level"
                      >
                        {severityLevels.map((level) => (
                          <MenuItem key={level.value} value={level.value}>
                            {level.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Urgency Level</InputLabel>
                      <Select
                        value={urgencyFilter}
                        onChange={(e) => setUrgencyFilter(e.target.value)}
                        label="Urgency Level"
                      >
                        {urgencyLevels.map((level) => (
                          <MenuItem key={level.value} value={level.value}>
                            {level.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Seasonal Pattern</InputLabel>
                      <Select
                        value={seasonalFilter}
                        onChange={(e) => setSeasonalFilter(e.target.value)}
                        label="Seasonal Pattern"
                      >
                        {seasonalOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </Paper>

        {/* Body Map Filter */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={700} sx={{ color: 'primary.main', mb: 2 }}>
            {t('diseases.filterByBodyRegion') || 'Filter by body region'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select multiple regions. Use presets for common scenarios such as respiratory issues (chest, lungs, throat) or digestive problems (stomach, intestines, liver).
          </Typography>
          <BodyMap
            onLocationSelect={handleBodyRegionSelect}
            onSelectionChange={setSelectedBodyRegions}
            selectedLocations={selectedBodyRegions}
          />
          {selectedBodyRegions.length > 0 && (
            <Button
              size="small"
              startIcon={<Clear />}
              onClick={() => setSelectedBodyRegions([])}
              sx={{ mt: 2, color: 'primary.main' }}
            >
              {t('diseases.clearFilter') || 'Clear body region filter'}
            </Button>
          )}
        </Paper>

        {/* Results Count */}
        <Box mb={3}>
          <Typography variant="body1" color="text.secondary">
            Found <strong>{filteredDiseases.length}</strong> disease{filteredDiseases.length !== 1 ? 's' : ''}
            {activeFiltersCount > 0 && ` (filtered from ${diseases.length} total)`}
          </Typography>
        </Box>

        {/* Disease Grid */}
        {filteredDiseases.length === 0 ? (
          <Paper elevation={2} sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t('diseases.noDiseasesFound') || 'No diseases found matching your criteria'}
            </Typography>
            <Button
              variant="outlined"
              onClick={clearAllFilters}
              sx={{ mt: 2 }}
              startIcon={<Clear />}
            >
              Clear All Filters
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredDiseases.map((disease: Disease & { match?: { score: number; reasons: string[] } }) => (
              <Grid item xs={12} sm={6} md={4} key={disease.id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '2px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 8,
                      borderColor: 'primary.main',
                    },
                  }}
                  onClick={() => handleDiseaseClick(disease)}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Typography variant="h6" fontWeight={600} sx={{ color: 'primary.main', flex: 1 }}>
                        {language === 'am' && disease.nameAmharic ? disease.nameAmharic : disease.name}
                      </Typography>
                      <Chip
                        label={disease.severity}
                        size="small"
                        color={getSeverityColor(disease.severity)}
                        sx={{ ml: 1 }}
                      />
                    </Box>
                    {disease.match && (
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Chip
                          label={`Relevance ${disease.match.score}/10`}
                          size="small"
                          color={disease.match.score >= 7 ? 'success' : disease.match.score >= 4 ? 'warning' : 'default'}
                        />
                        {disease.match.reasons.slice(0, 1).map((reason) => (
                          <Typography key={reason} variant="caption" color="text.secondary">
                            {reason}
                          </Typography>
                        ))}
                      </Box>
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60 }}>
                      {disease.description.substring(0, 120)}...
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                      {disease.symptoms.slice(0, 3).map((symptom, idx) => (
                        <Chip
                          key={idx}
                          label={symptom}
                          size="small"
                          variant="outlined"
                          sx={{ borderColor: 'primary.light', color: 'primary.main' }}
                        />
                      ))}
                      {disease.symptoms.length > 3 && (
                        <Chip
                          label={`+${disease.symptoms.length - 3} more`}
                          size="small"
                          variant="outlined"
                          sx={{ borderColor: 'primary.light', color: 'primary.main' }}
                        />
                      )}
                    </Box>
                    {disease.seasonal && disease.seasonal.length > 0 && (
                      <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                        <Info fontSize="small" color="info" />
                        <Chip
                          icon={<Info />}
                          label={t('diseases.seasonal') || 'Seasonal'}
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Disease Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        {selectedDisease && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <Typography variant="h5" fontWeight={600} sx={{ color: 'primary.main' }}>
                  {language === 'am' && selectedDisease.nameAmharic
                    ? selectedDisease.nameAmharic
                    : selectedDisease.name}
                </Typography>
                <Chip
                  label={selectedDisease.severity}
                  color={getSeverityColor(selectedDisease.severity)}
                  size="medium"
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" paragraph>
                {selectedDisease.description}
              </Typography>

              <Typography variant="h6" gutterBottom mt={2} sx={{ color: 'primary.main' }}>
                {t('diseases.symptoms') || 'Symptoms'}
              </Typography>
              <List dense>
                {selectedDisease.symptoms.map((symptom, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon>
                      <Warning color="warning" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={symptom} />
                  </ListItem>
                ))}
              </List>

              <Typography variant="h6" gutterBottom mt={2} sx={{ color: 'primary.main' }}>
                {t('diseases.causes') || 'Causes'}
              </Typography>
              <List dense>
                {selectedDisease.causes.map((cause, idx) => (
                  <ListItem key={idx}>
                    <ListItemText primary={`• ${cause}`} />
                  </ListItem>
                ))}
              </List>

              <Typography variant="h6" gutterBottom mt={2} sx={{ color: 'primary.main' }}>
                {t('diseases.prevention') || 'Prevention'}
              </Typography>
              <List dense>
                {selectedDisease.prevention.map((prevention, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={prevention} />
                  </ListItem>
                ))}
              </List>

              <Typography variant="h6" gutterBottom mt={2} sx={{ color: 'primary.main' }}>
                {t('diseases.treatment') || 'Treatment'}
              </Typography>
              <List dense>
                {selectedDisease.treatment.map((treatment, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon>
                      <LocalHospital color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={treatment} />
                  </ListItem>
                ))}
              </List>

              {selectedDisease.progressionTimeline && selectedDisease.progressionTimeline.length > 0 && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                    Disease Progression Timeline
                  </Typography>
                  {selectedDisease.progressionTimeline.map((stage, idx) => (
                    <Paper
                      key={idx}
                      elevation={1}
                      sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: 'background.default',
                        borderRadius: 2,
                        borderLeft: '4px solid',
                        borderColor: 'primary.main',
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        {stage.stage} - {stage.duration}
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
                        {stage.symptoms.map((symptom, sIdx) => (
                          <Chip key={sIdx} label={symptom} size="small" variant="outlined" />
                        ))}
                      </Box>
                      <Chip
                        label={`Severity: ${stage.severity}`}
                        size="small"
                        color={
                          stage.severity === 'severe'
                            ? 'error'
                            : stage.severity === 'moderate'
                            ? 'warning'
                            : 'info'
                        }
                      />
                    </Paper>
                  ))}
                </Box>
              )}

              {selectedDisease.bodyRegions && selectedDisease.bodyRegions.length > 0 && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                    Affected Body Regions
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {selectedDisease.bodyRegions.map((region, idx) => (
                      <Chip
                        key={idx}
                        label={region}
                        size="small"
                        sx={{ bgcolor: 'primary.light', color: 'white' }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {selectedDisease.seasonal && selectedDisease.seasonal.length > 0 && (
                <Paper elevation={1} sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    {t('diseases.seasonalAlert') || 'Seasonal Alert'}
                  </Typography>
                  <Typography variant="body2">
                    {t('diseases.commonIn') || 'Common in'}: {selectedDisease.seasonal.join(', ')}
                  </Typography>
                </Paper>
              )}

              {selectedDisease.prevalence && (
                <Paper elevation={1} sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Regional Prevalence in Ethiopia
                  </Typography>
                  <Typography variant="body2">
                    Prevalence: <strong>{selectedDisease.prevalence.prevalence}</strong> in{' '}
                    {selectedDisease.prevalence.region}
                  </Typography>
                </Paper>
              )}

              {/* Hypertension Images Gallery */}
              {selectedDisease.id === '3' && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                    Visual Resources
                  </Typography>
                  <Grid container spacing={2}>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <Grid item xs={12} sm={6} md={4} key={num}>
                        <Box
                          component="img"
                          src={`/HBP${num}.png`}
                          alt={`Hypertension visual ${num}`}
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            const paths = [`/Hypertension/HBP${num}.png`, `/public/HBP${num}.png`, `/dist/HBP${num}.png`];
                            let currentPathIndex = paths.indexOf(img.src.split('/').pop() || '');
                            if (currentPathIndex < paths.length - 1) {
                              img.src = paths[currentPathIndex + 1];
                            } else {
                              img.style.display = 'none';
                            }
                          }}
                          sx={{
                            width: '100%',
                            height: 'auto',
                            borderRadius: 2,
                            border: '2px solid',
                            borderColor: 'primary.main',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: 2,
                            '&:hover': {
                              transform: 'scale(1.05)',
                              boxShadow: 6,
                              borderColor: 'primary.dark',
                            },
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                  <Typography variant="caption" color="text.secondary" mt={1} display="block" textAlign="center">
                    Click images to view full size
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setDialogOpen(false)}>{t('common.close') || 'Close'}</Button>
              <PrimaryButton
                onClick={() => {
                  setDialogOpen(false);
                }}
              >
                {t('diseases.checkSymptoms') || 'Check Symptoms'}
              </PrimaryButton>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};
