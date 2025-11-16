import React, { useState, useMemo } from 'react';
import { Box, Typography, Grid, Card, CardContent, TextField, Tabs, Tab, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, ListItemIcon, Alert, InputAdornment } from '@mui/material';
import { Search, VerifiedUser, Warning, CheckCircle, Science } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { PrimaryButton } from '@/components/ui';
import { VerifiedRemedy, RemedyCategory, VerificationLevel, EvidenceLevel } from '@/types';

interface TraditionalMedicineProps {
  remedies?: VerifiedRemedy[];
  verificationLevels?: Array<{ level: VerificationLevel; label: string }>;
  culturalContext?: Array<{ id: string; practice: string; description: string }>;
  safetyWarnings?: Array<{ id: string; remedy: string; warning: string }>;
  userCulturalBackground?: string;
  onRemedySelect?: (remedy: VerifiedRemedy) => void;
}

const remedyCategories: Array<{ value: RemedyCategory; label: string; labelAm: string }> = [
  { value: 'herbal', label: 'Herbal Remedies', labelAm: 'የአትክልት መድሃኒቶች' },
  { value: 'traditional-practices', label: 'Traditional Practices', labelAm: 'ባህላዊ ልምዶች' },
  { value: 'food-medicine', label: 'Food as Medicine', labelAm: 'ምግብ እንደ መድሃኒት' },
  { value: 'spiritual', label: 'Spiritual Healing', labelAm: 'መንፈሳዊ ፈውስ' },
  { value: 'modern-traditional', label: 'Modern-Traditional Integration', labelAm: 'ዘመናዊ-ባህላዊ ውህደት' },
];

const mockRemedies: VerifiedRemedy[] = [
  {
    id: '1',
    name: 'Moringa (Shiferaw)',
    nameAmharic: 'ሽፈራው',
    category: 'herbal',
    description: 'Moringa leaves are rich in vitamins and minerals, traditionally used for boosting immunity and treating malnutrition.',
    preparation: 'Boil fresh leaves in water for 10 minutes, strain and drink as tea.',
    dosage: '1 cup, 2-3 times daily',
    indications: ['Malnutrition', 'Weakness', 'Low immunity'],
    contraindications: ['Pregnancy (in large amounts)', 'Blood thinning medications'],
    verificationLevel: 'verified',
    ministryApproved: true,
    scientificEvidence: 'strong',
    safetyWarnings: ['Consult doctor if taking blood thinners'],
    medicationInteractions: ['Warfarin', 'Aspirin'],
    culturalContext: 'Widely used in Ethiopian traditional medicine for generations',
    modernCorrelation: 'Rich in Vitamin C, A, and iron. Scientific studies confirm nutritional benefits.',
  },
  {
    id: '2',
    name: 'Honey for Cough',
    nameAmharic: 'ማር ለሳል',
    category: 'food-medicine',
    description: 'Raw honey is traditionally used to soothe coughs and sore throats.',
    preparation: 'Take 1-2 teaspoons of raw honey directly or mix with warm water.',
    dosage: 'As needed, up to 3 times daily',
    indications: ['Cough', 'Sore throat', 'Cold symptoms'],
    contraindications: ['Children under 1 year', 'Diabetes (use with caution)'],
    verificationLevel: 'verified',
    ministryApproved: true,
    scientificEvidence: 'moderate',
    safetyWarnings: ['Never give to infants under 1 year'],
    medicationInteractions: [],
    culturalContext: 'Common household remedy across Ethiopia',
    modernCorrelation: 'Honey has antimicrobial properties and can soothe throat irritation.',
  },
];

export const TraditionalMedicine: React.FC<TraditionalMedicineProps> = ({
  remedies: propRemedies,
  onRemedySelect,
  userCulturalBackground: _userCulturalBackground,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<RemedyCategory | 'all'>('all');
  const [selectedRemedy, setSelectedRemedy] = useState<VerifiedRemedy | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const remedies = propRemedies || mockRemedies;

  const filteredRemedies = useMemo(() => {
    let filtered = remedies;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((r) => r.category === categoryFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.nameAmharic?.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query) ||
          r.indications.some((i) => i.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [remedies, categoryFilter, searchQuery]);

  const handleRemedyClick = (remedy: VerifiedRemedy) => {
    setSelectedRemedy(remedy);
    setDialogOpen(true);
    onRemedySelect?.(remedy);
  };

  const getVerificationBadge = (remedy: VerifiedRemedy) => {
    if (remedy.ministryApproved) {
      return <Chip icon={<VerifiedUser />} label={t('traditional.ministryApproved')} color="success" size="small" />;
    }
    if (remedy.verificationLevel === 'verified') {
      return <Chip icon={<CheckCircle />} label={t('traditional.verified')} color="success" size="small" />;
    }
    return <Chip icon={<Warning />} label={t('traditional.underReview')} color="warning" size="small" />;
  };

  const getEvidenceBadge = (evidence: EvidenceLevel) => {
    const colors: Record<EvidenceLevel, 'success' | 'warning' | 'default' | 'error'> = {
      strong: 'success',
      moderate: 'warning',
      anecdotal: 'default',
      none: 'error',
    };
    return (
      <Chip
        icon={<Science />}
        label={t(`traditional.evidence.${evidence}`)}
        color={colors[evidence]}
        size="small"
      />
    );
  };

  return (
    <Box>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
          color: 'white',
          py: 4,
          textAlign: 'center',
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          {t('traditional.title')}
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          {t('traditional.subtitle')}
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        {/* Search and Filters */}
        <Box sx={{ mb: 4 }}>
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
            sx={{ mb: 2 }}
          />

          <Tabs
            value={categoryFilter}
            onChange={(_, newValue) => setCategoryFilter(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={t('traditional.all')} value="all" />
            {remedyCategories.map((cat) => (
              <Tab key={cat.value} label={cat.label} value={cat.value} />
            ))}
          </Tabs>
        </Box>

        {/* Remedy Grid */}
        {filteredRemedies.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary">
              {t('traditional.noRemediesFound')}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredRemedies.map((remedy) => (
              <Grid item xs={12} sm={6} md={4} key={remedy.id}>
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
                  onClick={() => handleRemedyClick(remedy)}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2} flexWrap="wrap" gap={1}>
                      <Typography variant="h6" fontWeight={600}>
                        {remedy.nameAmharic || remedy.name}
                      </Typography>
                      {getVerificationBadge(remedy)}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {remedy.description.substring(0, 100)}...
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                      {getEvidenceBadge(remedy.scientificEvidence)}
                      {remedy.safetyWarnings.length > 0 && (
                        <Chip
                          icon={<Warning />}
                          label={t('traditional.hasWarnings')}
                          color="warning"
                          size="small"
                        />
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('traditional.indications')}: {remedy.indications.slice(0, 2).join(', ')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
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
                  {getVerificationBadge(selectedRemedy)}
                  {getEvidenceBadge(selectedRemedy.scientificEvidence)}
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
                    {t('traditional.culturalContext')}
                  </Typography>
                  <Typography variant="body2">{selectedRemedy.culturalContext}</Typography>
                </Box>
              )}

              {selectedRemedy.modernCorrelation && (
                <Box mb={2} p={2} bgcolor="success.light" borderRadius={1}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    {t('traditional.modernCorrelation')}
                  </Typography>
                  <Typography variant="body2">{selectedRemedy.modernCorrelation}</Typography>
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

              <Typography variant="h6" gutterBottom mt={2}>
                {t('traditional.indications')}
              </Typography>
              <List dense>
                {selectedRemedy.indications.map((indication, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={indication} />
                  </ListItem>
                ))}
              </List>

              {selectedRemedy.contraindications.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom mt={2}>
                    {t('traditional.contraindications')}
                  </Typography>
                  <List dense>
                    {selectedRemedy.contraindications.map((contra, idx) => (
                      <ListItem key={idx}>
                        <ListItemIcon>
                          <Warning color="warning" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={contra} />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

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

              {selectedRemedy.medicationInteractions.length > 0 && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('traditional.medicationInteractions')}
                  </Typography>
                  <Typography variant="body2">
                    {t('traditional.mayInteractWith')}: {selectedRemedy.medicationInteractions.join(', ')}
                  </Typography>
                </Alert>
              )}

              {selectedRemedy.regionalVariations && selectedRemedy.regionalVariations.length > 0 && (
                <Box mt={2} p={2} bgcolor="background.default" borderRadius={1}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    {t('traditional.regionalVariations')}
                  </Typography>
                  <Typography variant="body2">
                    {selectedRemedy.regionalVariations.join(', ')}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>{t('common.close')}</Button>
              <PrimaryButton onClick={() => {
                setDialogOpen(false);
                // Could navigate to AI advisor to verify this remedy
              }}>
                {t('traditional.verifyWithAI')}
              </PrimaryButton>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

