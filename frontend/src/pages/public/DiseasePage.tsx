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
  ListItemIcon,
  ListItemText,
  InputAdornment,
  Autocomplete,
  Paper,
  Stack,
  IconButton,
} from '@mui/material';
import { Search, LocalHospital, CheckCircle, Clear } from '@mui/icons-material';
import { Disease, DiseaseCategory } from '@/types';
import { BodyMap } from '@/components/ui/body-map/BodyMap';
import { useUI } from '@/contexts/UIContext';
import { mockDiseases } from '@/data/diseasesData';

const diseaseCategories: Array<{ value: DiseaseCategory | 'all'; label: string; labelAm: string }> = [
  { value: 'all', label: 'All', labelAm: 'ሁሉም' },
  { value: 'chronic', label: 'Chronic Diseases', labelAm: 'ሥር የሰደዱ በሽታዎች' },
  { value: 'infectious', label: 'Infectious Diseases', labelAm: 'ተላላፊ በሽታዎች' },
  { value: 'autoimmune', label: 'Autoimmune Diseases', labelAm: 'ራስን በራስ የሚከላከሉ በሽታዎች' },
];

const LABELS = {
  filterBySymptoms: { en: 'Filter by Symptoms', am: 'በምልክቶች ማጣራት' },
  advancedFilters: { en: 'Advanced Filters', am: 'የላቀ ማጣራት' },
  clearAll: { en: 'Clear All', am: 'ሁሉንም አጽዳ' },
  severityLevel: { en: 'Severity Level', am: 'የከባድነት ደረጃ' },
  all: { en: 'All', am: 'ሁሉም' },
  symptoms: { en: 'Symptoms', am: 'ምልክቶች' },
  causes: { en: 'Causes', am: 'ምክንያቶች' },
  prevention: { en: 'Prevention', am: 'መከላከል' },
  treatment: { en: 'Treatment', am: 'ሕክምና' },
  close: { en: 'Close', am: 'ዝጋ' },
  affectedRegions: { en: 'Affected Body Regions', am: 'የተጎዱ የሰውነት ክፍሎች' },
  seasonalAlert: { en: 'Seasonal Alert', am: 'የወቅት ማሳወቂያ' },
  commonIn: { en: 'Common in', am: 'በተለመደ' },
  noDiseasesFound: { en: 'No diseases found matching your criteria', am: 'የተገኙ በሽታዎች የሉም' },
  found: { en: 'Found', am: 'ተገኝቷል' },
  diseases: { en: 'disease', am: 'በሽታ' },
};

export const DiseasePage: React.FC = () => {
  const { language } = useUI();
  const isAmharic = language === 'am';
  const t = (key: keyof typeof LABELS) => (isAmharic ? LABELS[key].am : LABELS[key].en);

  const [activeTab, setActiveTab] = useState<'quick-search' | 'advanced-filter'>('quick-search');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DiseaseCategory | 'all'>('all');
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBodyRegions, setSelectedBodyRegions] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  // Diseases: mock data for now; more diseases will be loaded from backend/API when available
  const diseases = mockDiseases;

  const getText = (d: Disease, field: 'description' | 'symptoms' | 'causes' | 'prevention' | 'treatment' | 'seasonal') => {
    if (isAmharic) {
      if (field === 'description' && d.descriptionAmharic) return d.descriptionAmharic;
      if (field === 'symptoms' && d.symptomsAmharic) return d.symptomsAmharic;
      if (field === 'causes' && d.causesAmharic) return d.causesAmharic;
      if (field === 'prevention' && d.preventionAmharic) return d.preventionAmharic;
      if (field === 'treatment' && d.treatmentAmharic) return d.treatmentAmharic;
      if (field === 'seasonal' && d.seasonalAmharic) return d.seasonalAmharic;
    }
    if (field === 'symptoms') return d.symptoms;
    if (field === 'causes') return d.causes;
    if (field === 'prevention') return d.prevention;
    if (field === 'treatment') return d.treatment;
    if (field === 'seasonal') return d.seasonal || [];
    return d.description;
  };

  const allSymptoms = useMemo(() => {
    const symptomSet = new Set<string>();
    diseases.forEach((disease) => {
      (isAmharic && disease.symptomsAmharic ? disease.symptomsAmharic : disease.symptoms).forEach((symptom) => {
        symptomSet.add(symptom);
      });
    });
    return Array.from(symptomSet).sort();
  }, [diseases, isAmharic]);

  const filteredDiseases = useMemo(() => {
    let filtered = diseases;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((d) => d.category === categoryFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.nameAmharic?.toLowerCase().includes(query) ||
          d.description.toLowerCase().includes(query) ||
          d.descriptionAmharic?.toLowerCase().includes(query) ||
          d.symptoms.some((s) => s.toLowerCase().includes(query)) ||
          d.symptomsAmharic?.some((s) => s.toLowerCase().includes(query)) ||
          d.causes.some((c) => c.toLowerCase().includes(query)),
      );
    }

    if (selectedSymptoms.length > 0) {
      filtered = filtered.filter((d) => {
        const dSymptoms = isAmharic ? (d.symptomsAmharic || d.symptoms) : d.symptoms;
        return selectedSymptoms.some((symptom) =>
          dSymptoms.some((s) => s.toLowerCase().includes(symptom.toLowerCase())),
        );
      });
    }

    if (selectedBodyRegions.length > 0) {
      filtered = filtered.filter((d) =>
        selectedBodyRegions.some((region) => d.bodyRegions.includes(region)),
      );
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
        const dSymptoms = isAmharic ? (d.symptomsAmharic || d.symptoms) : d.symptoms;
        const symptomHits = selectedSymptoms.filter((s) =>
          dSymptoms.some((ds) => ds.toLowerCase().includes(s.toLowerCase())),
        ).length;
        if (symptomHits > 0) {
          score += Math.min(symptomHits * 2, 4);
          reasons.push(`Symptom overlap (${symptomHits})`);
        }
      }
      return { score: Math.min(score, 10), reasons };
    };

    return filtered
      .map((d) => ({ disease: d, match: computeMatchScore(d) }))
      .sort((a, b) => b.match.score - a.match.score)
      .map(({ disease, match }) => ({ ...disease, match }));
  }, [diseases, categoryFilter, searchQuery, selectedBodyRegions, selectedSymptoms, isAmharic]);

  const handleDiseaseClick = (disease: Disease) => {
    setSelectedDisease(disease);
    setDialogOpen(true);
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

  const searchPlaceholder = isAmharic ? 'በሽታዎችን፣ ምልክቶችን ይፈልጉ...' : 'Search diseases, symptoms...';
  const heroTitle = isAmharic ? 'የበሽታ መረጃ ቤተ-መጻሕፍት' : 'Disease Information Library';

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
          {heroTitle}
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
        <Paper elevation={2} sx={{ mb: 4, borderRadius: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': { color: 'text.secondary', fontWeight: 600, textTransform: 'none', minHeight: 48, '&.Mui-selected': { color: '#4A90E2' } },
              '& .MuiTabs-indicator': { backgroundColor: '#4A90E2', height: 3 },
            }}
          >
            <Tab label={isAmharic ? 'ፈጣን ፍለጋ' : 'Quick Search'} value="quick-search" />
            <Tab label={isAmharic ? 'የላቀ ማጣራት (የሰውነት ካርታ)' : 'Advanced Filter (Body Map)'} value="advanced-filter" />
          </Tabs>

          {activeTab === 'quick-search' && (
            <Box sx={{ p: 3 }}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: '#4A90E2' }} />
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
                      '&:hover fieldset': { borderColor: '#4A90E2' },
                      '&.Mui-focused fieldset': { borderColor: '#4A90E2' },
                    },
                  }}
                />

                <Autocomplete
                  multiple
                  options={allSymptoms}
                  value={selectedSymptoms}
                  onChange={(_, newValue) => setSelectedSymptoms(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t('filterBySymptoms')}
                      placeholder={isAmharic ? 'ምልክቶችን ይፈልጉ...' : 'Type to search symptoms...'}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option}
                        label={option}
                        size="small"
                        sx={{ bgcolor: '#4A90E2', color: 'white', '& .MuiChip-deleteIcon': { color: 'white' } }}
                      />
                    ))
                  }
                />

                <Box>
                  <Tabs
                    value={categoryFilter}
                    onChange={(_, newValue) => setCategoryFilter(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      '& .MuiTab-root': { color: 'text.secondary', fontWeight: 600, textTransform: 'none', minHeight: 48, '&.Mui-selected': { color: '#4A90E2' } },
                      '& .MuiTabs-indicator': { backgroundColor: '#4A90E2', height: 3 },
                    }}
                  >
                    {diseaseCategories.map((cat) => (
                      <Tab key={cat.value} label={isAmharic ? cat.labelAm : cat.label} value={cat.value} />
                    ))}
                  </Tabs>
                </Box>

                {(searchQuery.trim() || selectedSymptoms.length >= 1 || categoryFilter !== 'all') && (
                  <Button startIcon={<Clear />} onClick={clearAllFilters} size="small" sx={{ color: 'text.secondary', alignSelf: 'flex-start' }}>
                    {t('clearAll')}
                  </Button>
                )}
              </Stack>
            </Box>
          )}

          {activeTab === 'advanced-filter' && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={700} sx={{ color: '#4A90E2', mb: 2 }}>
                {t('advancedFilters')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {isAmharic
                  ? 'ብዙ ክፍሎችን ይምረጡ። የመተንፈሻ ችግሮች (ደረት፣ ሳምባስ፣ ጉሮሮ) ወይም የማይጨምር ችግሮች ለመፈለግ ይጠቀሙ።'
                  : 'Select multiple regions. Use for respiratory issues (chest, lungs, throat) or digestive problems.'}
              </Typography>
              <BodyMap
                onLocationSelect={handleBodyRegionSelect}
                onSelectionChange={setSelectedBodyRegions}
                selectedLocations={selectedBodyRegions}
              />
              {selectedBodyRegions.length >= 1 && (
                <Button size="small" startIcon={<Clear />} onClick={() => setSelectedBodyRegions([])} sx={{ mt: 2, color: '#4A90E2' }}>
                  {t('clearAll')}
                </Button>
              )}
            </Box>
          )}
        </Paper>

        <Box mb={3}>
          <Typography variant="body1" color="text.secondary">
            {t('found')} <strong>{filteredDiseases.length}</strong> {t('diseases')}{filteredDiseases.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        {filteredDiseases.length === 0 ? (
          <Paper elevation={2} sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t('noDiseasesFound')}
            </Typography>
            <Button variant="outlined" onClick={clearAllFilters} sx={{ mt: 2 }} startIcon={<Clear />}>
              {t('clearAll')}
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredDiseases.map((disease: Disease & { match?: { score: number; reasons: string[] } }) => {
              const dispName = isAmharic && disease.nameAmharic ? disease.nameAmharic : disease.name;
              const dispDesc = getText(disease, 'description');
              const dispSymptoms = Array.isArray(getText(disease, 'symptoms')) ? getText(disease, 'symptoms') as string[] : [];
              return (
                <Grid item xs={12} sm={6} md={4} key={disease.id}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: '2px solid',
                      borderColor: '#EEEEEE',
                      borderRadius: 3,
                      '&:hover': { transform: 'translateY(-8px)', boxShadow: 8, borderColor: '#4A90E2' },
                    }}
                    onClick={() => handleDiseaseClick(disease)}
                  >
                    <CardContent sx={{ pb: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={1.5}>
                        <Typography variant="h6" fontWeight={600} sx={{ color: '#4A90E2', flex: 1, fontSize: '1.1rem' }}>
                          {dispName}
                        </Typography>
                        <Chip label={disease.severity} size="small" color={getSeverityColor(disease.severity) as any} sx={{ ml: 1 }} />
                      </Box>
                      {disease.match && disease.match.score >= 1 && (
                        <Chip
                          label={`${disease.match.score}/10`}
                          size="small"
                          sx={{
                            mb: 1,
                            bgcolor: disease.match.score >= 7 ? '#4A90E2' : disease.match.score >= 4 ? '#FF6B6B' : '#666',
                            color: 'white',
                          }}
                        />
                      )}
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.5, fontSize: '0.95rem' }}>
                        {String(dispDesc).substring(0, 100)}...
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {dispSymptoms.slice(0, 3).map((symptom, idx) => (
                          <Chip key={idx} label={symptom} size="small" variant="outlined" sx={{ borderColor: '#4A90E2', color: '#4A90E2', fontSize: '0.75rem' }} />
                        ))}
                        {dispSymptoms.length >= 4 && (
                          <Chip label={`+${dispSymptoms.length - 3}`} size="small" variant="outlined" sx={{ borderColor: '#4A90E2', color: '#4A90E2' }} />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {selectedDisease && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <Typography variant="h5" fontWeight={600} sx={{ color: '#4A90E2' }}>
                  {isAmharic && selectedDisease.nameAmharic ? selectedDisease.nameAmharic : selectedDisease.name}
                </Typography>
                <Chip label={selectedDisease.severity} color={getSeverityColor(selectedDisease.severity) as any} size="medium" />
              </Box>
            </DialogTitle>
            <DialogContent>
              {/* Image placeholder for disease (media from backend when available) */}
              <Box sx={{ width: '100%', height: 180, bgcolor: 'grey.200', borderRadius: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {isAmharic ? 'ምስል ቦታ' : 'Image placeholder'}
                </Typography>
              </Box>

              <Typography variant="body1" paragraph sx={{ lineHeight: 1.7 }}>
                {getText(selectedDisease, 'description')}
              </Typography>

              <Typography variant="subtitle1" fontWeight={700} gutterBottom mt={2} sx={{ color: '#4A90E2' }}>
                {t('symptoms')}
              </Typography>
              <List dense disablePadding>
                {(Array.isArray(getText(selectedDisease, 'symptoms')) ? getText(selectedDisease, 'symptoms') as string[] : []).map((symptom, idx) => (
                  <ListItem key={idx} sx={{ py: 0.25 }}>
                    <ListItemText primary={`\u2022 ${symptom}`} primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItem>
                ))}
              </List>

              <Typography variant="subtitle1" fontWeight={700} gutterBottom mt={2} sx={{ color: '#4A90E2' }}>
                {t('causes')}
              </Typography>
              <List dense disablePadding>
                {(Array.isArray(getText(selectedDisease, 'causes')) ? getText(selectedDisease, 'causes') as string[] : []).map((cause, idx) => (
                  <ListItem key={idx} sx={{ py: 0.25 }}>
                    <ListItemText primary={`\u2022 ${cause}`} primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItem>
                ))}
              </List>

              <Typography variant="subtitle1" fontWeight={700} gutterBottom mt={2} sx={{ color: '#4A90E2' }}>
                {t('prevention')}
              </Typography>
              <List dense disablePadding>
                {(Array.isArray(getText(selectedDisease, 'prevention')) ? getText(selectedDisease, 'prevention') as string[] : []).map((p, idx) => (
                  <ListItem key={idx} sx={{ py: 0.25 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <CheckCircle sx={{ color: '#4A90E2', fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText primary={p} primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItem>
                ))}
              </List>

              <Typography variant="subtitle1" fontWeight={700} gutterBottom mt={2} sx={{ color: '#4A90E2' }}>
                {t('treatment')}
              </Typography>
              <List dense disablePadding>
                {(Array.isArray(getText(selectedDisease, 'treatment')) ? getText(selectedDisease, 'treatment') as string[] : []).map((tmt, idx) => (
                  <ListItem key={idx} sx={{ py: 0.25 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <LocalHospital sx={{ color: '#4A90E2', fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText primary={tmt} primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItem>
                ))}
              </List>

              {selectedDisease.bodyRegions && selectedDisease.bodyRegions.length >= 1 && (
                <Box mt={3}>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ color: '#4A90E2' }}>
                    {t('affectedRegions')}
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {selectedDisease.bodyRegions.map((region, idx) => (
                      <Chip key={idx} label={region} size="small" sx={{ bgcolor: '#4A90E2', color: 'white' }} />
                    ))}
                  </Box>
                </Box>
              )}

              {selectedDisease.seasonal && selectedDisease.seasonal.length >= 1 && (
                <Paper elevation={1} sx={{ mt: 3, p: 2, bgcolor: '#E8F4F8', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    {t('seasonalAlert')}
                  </Typography>
                  <Typography variant="body2">
                    {t('commonIn')}: {(getText(selectedDisease, 'seasonal') as string[]).join(', ')}
                  </Typography>
                </Paper>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setDialogOpen(false)}>{t('close')}</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};
