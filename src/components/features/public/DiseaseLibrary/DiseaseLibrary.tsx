import React, { useState, useMemo } from 'react';
import { Box, Typography, Grid, Card, CardContent, TextField, Tabs, Tab, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, ListItemIcon, InputAdornment } from '@mui/material';
import { Search, LocalHospital, CheckCircle, Info } from '@mui/icons-material';
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
      'Numbness or tingling in hands/feet'
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
      'Certain medical conditions (kidney disease, diabetes)'
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
      'Follow medication regimen if prescribed'
    ],
    treatment: [
      'Lifestyle modifications (diet, exercise)',
      'Blood pressure medications (ACE inhibitors, diuretics, beta-blockers)',
      'Regular monitoring and follow-up',
      'Weight management',
      'Stress management',
      'Quitting smoking and limiting alcohol'
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
      'rightLeg'
    ],
    progressionTimeline: [
      {
        stage: 'Stage 1 (Mild)',
        duration: 'Early stage',
        symptoms: ['Occasional headaches', 'Mild dizziness'],
        severity: 'mild' as const
      },
      {
        stage: 'Stage 2 (Moderate)',
        duration: 'Progressive stage',
        symptoms: ['Frequent headaches', 'Vision problems', 'Chest discomfort'],
        severity: 'moderate' as const
      },
      {
        stage: 'Stage 3 (Severe)',
        duration: 'Advanced stage',
        symptoms: ['Severe headaches', 'Chest pain', 'Difficulty breathing', 'Confusion'],
        severity: 'severe' as const
      }
    ],
    visualAssets: {
      bodyMapRegions: ['head', 'chest', 'heart', 'kidneys', 'eyes'],
      symptomIcons: ['headache', 'chest-pain', 'dizziness'],
      infographics: ['blood-pressure-chart', 'risk-factors'],
      flowcharts: ['diagnosis-flowchart', 'treatment-decision-tree']
    }
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

  const diseases = propDiseases || mockDiseases;

  const filteredDiseases = useMemo(() => {
    let filtered = diseases;

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((d) => d.category === categoryFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.nameAmharic?.toLowerCase().includes(query) ||
          d.description.toLowerCase().includes(query) ||
          d.symptoms.some((s) => s.toLowerCase().includes(query))
      );
    }

    // Filter by body regions if selected
    if (selectedBodyRegions.length > 0) {
      filtered = filtered.filter((d) =>
        selectedBodyRegions.some((region) => d.bodyRegions.includes(region))
      );
    }

    return filtered;
  }, [diseases, categoryFilter, searchQuery, selectedBodyRegions]);

  const handleDiseaseClick = (disease: Disease) => {
    setSelectedDisease(disease);
    setDialogOpen(true);
    onDiseaseSelect?.(disease);
  };

  const handleBodyRegionSelect = (region: string) => {
    setSelectedBodyRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    );
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

  return (
    <Box>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 4,
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

      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        {/* Search and Filters */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder={t('diseases.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {/* Category Tabs */}
          <Tabs
            value={categoryFilter}
            onChange={(_, newValue) => setCategoryFilter(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 3 }}
          >
            <Tab label={t('diseases.all')} value="all" />
            {diseaseCategories.map((cat) => (
              <Tab
                key={cat.value}
                label={language === 'am' ? cat.labelAm : cat.label}
                value={cat.value}
              />
            ))}
          </Tabs>

          {/* Body Map Filter */}
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="subtitle1" gutterBottom>
              {t('diseases.filterByBodyRegion')}
            </Typography>
            <BodyMap
              onLocationSelect={handleBodyRegionSelect}
              selectedLocations={selectedBodyRegions}
            />
            {selectedBodyRegions.length > 0 && (
              <Button
                size="small"
                onClick={() => setSelectedBodyRegions([])}
                sx={{ mt: 1 }}
              >
                {t('diseases.clearFilter')}
              </Button>
            )}
          </Box>
        </Box>

        {/* Disease Grid */}
        {filteredDiseases.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary">
              {t('diseases.noDiseasesFound')}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredDiseases.map((disease) => (
              <Grid item xs={12} sm={6} md={4} key={disease.id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                  }}
                  onClick={() => handleDiseaseClick(disease)}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Typography variant="h6" fontWeight={600}>
                        {language === 'am' && disease.nameAmharic ? disease.nameAmharic : disease.name}
                      </Typography>
                      <Chip
                        label={disease.severity}
                        size="small"
                        color={getSeverityColor(disease.severity)}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {disease.description.substring(0, 100)}...
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {disease.symptoms.slice(0, 3).map((symptom, idx) => (
                        <Chip key={idx} label={symptom} size="small" variant="outlined" />
                      ))}
                    </Box>
                    {disease.seasonal && disease.seasonal.length > 0 && (
                      <Box mt={2}>
                        <Chip
                          icon={<Info />}
                          label={t('diseases.seasonal')}
                          size="small"
                          color="info"
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
      >
        {selectedDisease && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" fontWeight={600}>
                  {language === 'am' && selectedDisease.nameAmharic
                    ? selectedDisease.nameAmharic
                    : selectedDisease.name}
                </Typography>
                <Chip
                  label={selectedDisease.severity}
                  color={getSeverityColor(selectedDisease.severity)}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" paragraph>
                {selectedDisease.description}
              </Typography>

              <Typography variant="h6" gutterBottom mt={2}>
                {t('diseases.symptoms')}
              </Typography>
              <List dense>
                {selectedDisease.symptoms.map((symptom, idx) => (
                  <ListItem key={idx}>
                    <ListItemText primary={`• ${symptom}`} />
                  </ListItem>
                ))}
              </List>

              <Typography variant="h6" gutterBottom mt={2}>
                {t('diseases.causes')}
              </Typography>
              <List dense>
                {selectedDisease.causes.map((cause, idx) => (
                  <ListItem key={idx}>
                    <ListItemText primary={`• ${cause}`} />
                  </ListItem>
                ))}
              </List>

              <Typography variant="h6" gutterBottom mt={2}>
                {t('diseases.prevention')}
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

              <Typography variant="h6" gutterBottom mt={2}>
                {t('diseases.treatment')}
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
                <Box mt={2}>
                  <Typography variant="h6" gutterBottom>
                    Disease Progression Timeline
                  </Typography>
                  {selectedDisease.progressionTimeline.map((stage, idx) => (
                    <Box key={idx} mb={2} p={2} bgcolor="background.default" borderRadius={1}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        {stage.stage} - {stage.duration}
                      </Typography>
                      <Box display="flex" gap={1} mb={1}>
                        {stage.symptoms.map((symptom, sIdx) => (
                          <Chip key={sIdx} label={symptom} size="small" variant="outlined" />
                        ))}
                      </Box>
                      <Chip
                        label={`Severity: ${stage.severity}`}
                        size="small"
                        color={stage.severity === 'severe' ? 'error' : stage.severity === 'moderate' ? 'warning' : 'info'}
                      />
                    </Box>
                  ))}
                </Box>
              )}

              {selectedDisease.bodyRegions && selectedDisease.bodyRegions.length > 0 && (
                <Box mt={2}>
                  <Typography variant="h6" gutterBottom>
                    Affected Body Regions
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {selectedDisease.bodyRegions.map((region, idx) => (
                      <Chip key={idx} label={region} size="small" color="primary" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}

              {selectedDisease.seasonal && selectedDisease.seasonal.length > 0 && (
                <Box mt={2} p={2} bgcolor="info.light" borderRadius={1}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    {t('diseases.seasonalAlert')}
                  </Typography>
                  <Typography variant="body2">
                    {t('diseases.commonIn')}: {selectedDisease.seasonal.join(', ')}
                  </Typography>
                </Box>
              )}

              {selectedDisease.prevalence && (
                <Box mt={2} p={2} bgcolor="warning.light" borderRadius={1}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Regional Prevalence in Ethiopia
                  </Typography>
                  <Typography variant="body2">
                    Prevalence: {selectedDisease.prevalence.prevalence} in {selectedDisease.prevalence.region}
                  </Typography>
                </Box>
              )}

              {/* Hypertension Images Gallery */}
              {selectedDisease.id === '3' && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    Visual Resources
                  </Typography>
                  <Grid container spacing={2}>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <Grid item xs={12} sm={6} md={4} key={num}>
                        <Box
                          component="img"
                          src={`/Hypertension/HBP${num}.png`}
                          alt={`Hypertension visual ${num}`}
                          sx={{
                            width: '100%',
                            height: 'auto',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            '&:hover': {
                              transform: 'scale(1.05)',
                            },
                          }}
                          onError={(e) => {
                            // Fallback if image doesn't load
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                  <Typography variant="caption" color="text.secondary" mt={1} display="block">
                    Click images to view full size
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>{t('common.close')}</Button>
              <PrimaryButton onClick={() => {
                setDialogOpen(false);
                // Navigate to symptom checker with this disease pre-selected
              }}>
                {t('diseases.checkSymptoms')}
              </PrimaryButton>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

