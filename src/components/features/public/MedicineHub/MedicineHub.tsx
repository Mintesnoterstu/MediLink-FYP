import React, { useState, useMemo } from 'react';
import { Box, Typography, Grid, Card, CardContent, TextField, Tabs, Tab, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, ListItemIcon, Alert, InputAdornment } from '@mui/material';
import { Search, VerifiedUser, LocalHospital, Healing, Info } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { VerifiedRemedy, RemedyCategory } from '@/types';

interface MedicineHubProps {
  remedies?: VerifiedRemedy[];
  onRemedySelect?: (remedy: VerifiedRemedy) => void;
}

const bodyParts = [
  { id: 'skin', label: 'Skin', icon: <Healing /> },
  { id: 'head', label: 'Head', icon: <Info /> },
  { id: 'stomach', label: 'Stomach', icon: <Healing /> },
  { id: 'joints', label: 'Joints', icon: <Healing /> },
  { id: 'respiratory', label: 'Respiratory', icon: <Healing /> },
];

const healthGoals = [
  { id: 'protein', label: 'Protein Gain' },
  { id: 'weight', label: 'Weight Management' },
  { id: 'immunity', label: 'Immunity Boost' },
  { id: 'energy', label: 'Energy Improvement' },
];

const medicineTypes = [
  { id: 'traditional', label: 'Traditional Ethiopian Medicine' },
  { id: 'modern', label: 'Modern Pharmaceuticals' },
  { id: 'herbal', label: 'Herbal & Natural Remedies' },
  { id: 'supplements', label: 'Nutritional Supplements' },
];

const mockSelfCareRemedies = [
  {
    id: '1',
    name: 'Moringa (Shiferaw)',
    nameAmharic: 'ሽፈራው',
    category: 'herbal' as RemedyCategory,
    bodyPart: 'general',
    healthGoal: 'immunity',
    description: 'Moringa leaves are rich in vitamins and minerals, traditionally used for boosting immunity and treating malnutrition.',
    preparation: 'Boil fresh leaves in water for 10 minutes, strain and drink as tea.',
    dosage: '1 cup, 2-3 times daily',
    indications: ['Malnutrition', 'Weakness', 'Low immunity'],
    contraindications: ['Pregnancy (in large amounts)', 'Blood thinning medications'],
    verificationLevel: 'verified' as const,
    ministryApproved: true,
    scientificEvidence: 'strong' as const,
    safetyWarnings: ['Consult doctor if taking blood thinners'],
    medicationInteractions: ['Warfarin', 'Aspirin'],
    culturalContext: 'Widely used in Ethiopian traditional medicine for generations',
    modernCorrelation: 'Rich in Vitamin C, A, and iron. Scientific studies confirm nutritional benefits.',
  },
  {
    id: '2',
    name: 'Honey for Cough',
    nameAmharic: 'ማር ለሳል',
    category: 'food-medicine' as RemedyCategory,
    bodyPart: 'respiratory',
    healthGoal: 'general',
    description: 'Raw honey is traditionally used to soothe coughs and sore throats.',
    preparation: 'Take 1-2 teaspoons of raw honey directly or mix with warm water.',
    dosage: 'As needed, up to 3 times daily',
    indications: ['Cough', 'Sore throat', 'Cold symptoms'],
    contraindications: ['Children under 1 year', 'Diabetes (use with caution)'],
    verificationLevel: 'verified' as const,
    ministryApproved: true,
    scientificEvidence: 'moderate' as const,
    safetyWarnings: ['Never give to infants under 1 year'],
    medicationInteractions: [],
    culturalContext: 'Common household remedy across Ethiopia',
    modernCorrelation: 'Honey has antimicrobial properties and can soothe throat irritation.',
  },
];

const mockProfessionalCare = [
  {
    id: '1',
    title: 'Prescription Medications',
    description: 'Medications that require a doctor\'s prescription and professional supervision.',
    examples: ['Antibiotics', 'Blood pressure medications', 'Diabetes medications'],
    whenToSeek: 'Always consult a healthcare provider before starting prescription medications.',
  },
  {
    id: '2',
    title: 'Medical Procedures',
    description: 'Medical procedures that must be performed by qualified healthcare professionals.',
    examples: ['Surgery', 'Injections', 'Blood tests', 'X-rays'],
    whenToSeek: 'These procedures require professional medical facilities and trained staff.',
  },
];

export const MedicineHub: React.FC<MedicineHubProps> = ({
  remedies: propRemedies,
  onRemedySelect,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'self-care' | 'professional' | 'types'>('self-care');
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [selectedHealthGoal, setSelectedHealthGoal] = useState<string | null>(null);
  const [selectedRemedy, setSelectedRemedy] = useState<VerifiedRemedy | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const remedies = propRemedies || mockSelfCareRemedies;

  const filteredRemedies = useMemo(() => {
    let filtered = remedies;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.nameAmharic?.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query)
      );
    }

    if (selectedBodyPart) {
      filtered = filtered.filter((r: any) => r.bodyPart === selectedBodyPart);
    }

    if (selectedHealthGoal) {
      filtered = filtered.filter((r: any) => r.healthGoal === selectedHealthGoal);
    }

    return filtered;
  }, [remedies, searchQuery, selectedBodyPart, selectedHealthGoal]);

  const handleRemedyClick = (remedy: VerifiedRemedy) => {
    setSelectedRemedy(remedy);
    setDialogOpen(true);
    onRemedySelect?.(remedy);
  };

  return (
    <Box>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4eb6f2 0%, #4A90E2 60%, #2C3E50 100%)',
          color: 'white',
          py: 4,
          textAlign: 'center',
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          {t('medicineHub.title')}
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          {t('medicineHub.subtitle')}
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        {/* Search */}
        <TextField
          fullWidth
          placeholder={t('traditional.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label={t('medicineHub.selfCare')} value="self-care" />
          <Tab label={t('medicineHub.professionalCare')} value="professional" />
          <Tab label={t('medicineHub.medicineTypes')} value="types" />
        </Tabs>

        {/* Self-Care Section */}
        {activeTab === 'self-care' && (
          <Box>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('medicineHub.byBodyPart')}
                    </Typography>
                    <Grid container spacing={2}>
                      {bodyParts.map((part) => (
                        <Grid item xs={6} sm={4} key={part.id}>
                          <Button
                            fullWidth
                            variant={selectedBodyPart === part.id ? 'contained' : 'outlined'}
                            startIcon={part.icon}
                            onClick={() => setSelectedBodyPart(selectedBodyPart === part.id ? null : part.id)}
                          >
                            {part.label}
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('medicineHub.byHealthGoal')}
                    </Typography>
                    <Grid container spacing={2}>
                      {healthGoals.map((goal) => (
                        <Grid item xs={6} sm={6} key={goal.id}>
                          <Button
                            fullWidth
                            variant={selectedHealthGoal === goal.id ? 'contained' : 'outlined'}
                            onClick={() => setSelectedHealthGoal(selectedHealthGoal === goal.id ? null : goal.id)}
                          >
                            {goal.label}
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom mb={2}>
              {t('medicineHub.traditionalRemedies')}
            </Typography>
            <Grid container spacing={3}>
              {filteredRemedies.map((remedy) => (
                <Grid item xs={12} sm={6} md={4} key={remedy.id}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 4 },
                    }}
                    onClick={() => handleRemedyClick(remedy)}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Typography variant="h6" fontWeight={600}>
                          {remedy.nameAmharic || remedy.name}
                        </Typography>
                        {remedy.ministryApproved && (
                          <Chip icon={<VerifiedUser />} label="Approved" color="success" size="small" />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {remedy.description.substring(0, 100)}...
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {remedy.indications.slice(0, 2).map((ind, idx) => (
                          <Chip key={idx} label={ind} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Professional Care Section */}
        {activeTab === 'professional' && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                {t('medicineHub.whenToSeekHelp')}: Always consult healthcare professionals for prescription medications, medical procedures, and therapies requiring supervision.
              </Typography>
            </Alert>
            <Grid container spacing={3}>
              {mockProfessionalCare.map((care) => (
                <Grid item xs={12} md={6} key={care.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {care.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {care.description}
                      </Typography>
                      <Typography variant="subtitle2" gutterBottom>
                        Examples:
                      </Typography>
                      <List dense>
                        {care.examples.map((example, idx) => (
                          <ListItem key={idx}>
                            <ListItemIcon>
                              <LocalHospital fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={example} />
                          </ListItem>
                        ))}
                      </List>
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        {care.whenToSeek}
                      </Alert>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Medicine Types Section */}
        {activeTab === 'types' && (
          <Box>
            <Grid container spacing={3}>
              {medicineTypes.map((type) => (
                <Grid item xs={12} md={6} key={type.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {type.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Information about {type.label.toLowerCase()} and their uses in Ethiopian healthcare.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>

      {/* Remedy Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedRemedy && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                <Typography variant="h5" fontWeight={600}>
                  {selectedRemedy.nameAmharic || selectedRemedy.name}
                </Typography>
                <Box display="flex" gap={1}>
                  {selectedRemedy.ministryApproved && (
                    <Chip icon={<VerifiedUser />} label="Ministry Approved" color="success" size="small" />
                  )}
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" paragraph>
                {selectedRemedy.description}
              </Typography>

              {selectedRemedy.culturalContext && (
                <Box mb={2} p={2} bgcolor="info.light" borderRadius={1}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    {t('medicineHub.culturalContext')}
                  </Typography>
                  <Typography variant="body2">{selectedRemedy.culturalContext}</Typography>
                </Box>
              )}

              <Typography variant="h6" gutterBottom mt={2}>
                {t('traditional.preparation')}
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedRemedy.preparation}
              </Typography>

              <Typography variant="h6" gutterBottom mt={2}>
                {t('traditional.dosage')}
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedRemedy.dosage}
              </Typography>

              {selectedRemedy.safetyWarnings.length > 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('traditional.safetyWarnings')}
                  </Typography>
                  {selectedRemedy.safetyWarnings.map((warning, idx) => (
                    <Typography key={idx} variant="body2">
                      • {warning}
                    </Typography>
                  ))}
                </Alert>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>{t('common.close')}</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

