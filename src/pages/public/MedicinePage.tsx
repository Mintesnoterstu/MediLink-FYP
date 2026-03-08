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
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Search, VerifiedUser, LocalHospital, Healing, Info, Clear } from '@mui/icons-material';
import { useUI } from '@/contexts/UIContext';
import { VerifiedRemedy } from '@/types';
import { mockSelfCareRemedies } from '@/data/medicinesData';

const bodyParts = [
  { id: 'skin', label: 'Skin', labelAm: 'ቆዳ', icon: <Healing /> },
  { id: 'head', label: 'Head', labelAm: 'ራስ', icon: <Info /> },
  { id: 'stomach', label: 'Stomach', labelAm: 'ሆድ', icon: <Healing /> },
  { id: 'joints', label: 'Joints', labelAm: 'መገጣጠሚያዎች', icon: <Healing /> },
  { id: 'respiratory', label: 'Respiratory', labelAm: 'የመተንፈሻ', icon: <Healing /> },
  { id: 'general', label: 'General', labelAm: 'አጠቃላይ', icon: <Healing /> },
];

const healthGoals = [
  { id: 'immunity', label: 'Immunity', labelAm: 'የበሽታ መከላከል' },
  { id: 'digestion', label: 'Digestion', labelAm: 'ምግብ መፈጨት' },
  { id: 'pain', label: 'Pain Relief', labelAm: 'ህመም ማስታገሻ' },
  { id: 'nutrition', label: 'Nutrition', labelAm: 'አመጋገብ' },
  { id: 'hydration', label: 'Hydration', labelAm: 'ውሃ መጠጣት' },
  { id: 'allergy', label: 'Allergy', labelAm: 'አለርጂ' },
];

const medicineTypes = [
  { id: 'traditional', label: 'Traditional Remedies', labelAm: 'ባህላዊ መድሀኒቶች' },
  { id: 'modern', label: 'OTC Medicines', labelAm: 'ያለሐኪም የሚገዙ መድሀኒቶች' },
  { id: 'herbal', label: 'Herbal Supplements', labelAm: 'ዕፅዋት ማሟያዎች' },
  { id: 'prescription', label: 'Prescription Only', labelAm: 'በሐኪም ብቻ' },
];

const professionalCare = [
  {
    title: 'Prescription Medications',
    titleAm: 'በሐኪም የሚታዘዙ መድሀኒቶች',
    examples: ['Amoxicillin (antibiotic)', 'Metformin (diabetes)', 'Amlodipine (blood pressure)'],
    whenToSeek: 'Always consult a doctor at your local health facility',
    whenToSeekAm: 'ሁልጊዜ በአካባቢዎ የጤና ተቋም ውስጥ ሐኪም ያማክሩ',
  },
  {
    title: 'Medical Procedures',
    titleAm: 'የሕክምና ሂደቶች',
    examples: ['Blood tests', 'Injections', 'Wound care', 'Maternal care'],
    whenToSeek:
      'These procedures require professional medical facilities and trained staff',
    whenToSeekAm:
      'እነዚህ ሂደቶች የሙያ የጤና ተቋማትን እና የተሰለጡ ሠራተኞችን ይፈልጋሉ',
  },
];

export const MedicinePage: React.FC = () => {
  const { language } = useUI();
  const isAmharic = language === 'am';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'self-care' | 'professional' | 'types'>('self-care');
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [selectedHealthGoal, setSelectedHealthGoal] = useState<string | null>(null);
  const [selectedRemedy, setSelectedRemedy] = useState<VerifiedRemedy | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const getText = (
    r: VerifiedRemedy,
    field: 'description' | 'preparation' | 'dosage' | 'culturalContext' | 'indications' | 'contraindications' | 'safetyWarnings',
  ) => {
    if (isAmharic) {
      if (field === 'description' && r.descriptionAmharic) return r.descriptionAmharic;
      if (field === 'preparation' && r.preparationAmharic) return r.preparationAmharic;
      if (field === 'dosage' && r.dosageAmharic) return r.dosageAmharic;
      if (field === 'culturalContext' && r.culturalContextAmharic) return r.culturalContextAmharic;
      if (field === 'indications' && r.indicationsAmharic) return r.indicationsAmharic;
      if (field === 'contraindications' && r.contraindicationsAmharic) return r.contraindicationsAmharic;
      if (field === 'safetyWarnings' && r.safetyWarningsAmharic) return r.safetyWarningsAmharic;
    }
    if (field === 'indications') return r.indications;
    if (field === 'contraindications') return r.contraindications;
    if (field === 'safetyWarnings') return r.safetyWarnings;
    return (r as any)[field];
  };

  const filteredRemedies = useMemo(() => {
    let filtered = mockSelfCareRemedies;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.nameAmharic?.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query) ||
          r.descriptionAmharic?.toLowerCase().includes(query),
      );
    }

    if (selectedBodyPart) {
      filtered = filtered.filter((r) => r.bodyPart === selectedBodyPart);
    }

    if (selectedHealthGoal) {
      filtered = filtered.filter((r) => r.healthGoal === selectedHealthGoal);
    }

    return filtered;
  }, [searchQuery, selectedBodyPart, selectedHealthGoal]);

  const handleRemedyClick = (remedy: VerifiedRemedy) => {
    setSelectedRemedy(remedy);
    setDialogOpen(true);
  };

  const heroTitle = isAmharic ? 'የመድሀኒት መድረክ' : 'Medicine Hub';
  const heroSubtitle = isAmharic ? 'Medicine Hub' : 'የመድሀኒት መድረክ';
  const searchPlaceholder = isAmharic ? 'መድሀኒቶችን፣ መፍትሄዎችን ይፈልጉ...' : 'Search medicines, remedies...';

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
          {heroTitle}
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          {heroSubtitle}
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
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
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover fieldset': { borderColor: '#4A90E2' },
              '&.Mui-focused fieldset': { borderColor: '#4A90E2' },
            },
          }}
        />

        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            mb: 3,
            '& .MuiTab-root': { fontWeight: 600, textTransform: 'none' },
            '& .Mui-selected': { color: '#4A90E2' },
            '& .MuiTabs-indicator': { bgcolor: '#4A90E2' },
          }}
        >
          <Tab label={isAmharic ? 'ራስን መንከባከብ' : 'Self-Care'} value="self-care" />
          <Tab label={isAmharic ? 'የሙያ እንክብካቤ' : 'Professional Care'} value="professional" />
          <Tab label={isAmharic ? 'የመድሀኒት አይነቶች' : 'Medicine Types'} value="types" />
        </Tabs>

        {activeTab === 'self-care' && (
          <Box>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight={700} sx={{ color: '#4A90E2' }}>
                      {isAmharic ? 'በሰውነት ክፍል ማጣራት' : 'Filter by Body Part'}
                    </Typography>
                    <Grid container spacing={2}>
                      {bodyParts.map((part) => (
                        <Grid item xs={6} sm={4} key={part.id}>
                          <Button
                            fullWidth
                            variant={selectedBodyPart === part.id ? 'contained' : 'outlined'}
                            startIcon={part.icon}
                            onClick={() =>
                              setSelectedBodyPart(selectedBodyPart === part.id ? null : part.id)
                            }
                            sx={{
                              ...(selectedBodyPart === part.id && { bgcolor: '#4A90E2' }),
                            }}
                          >
                            {isAmharic ? part.labelAm : part.label}
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight={700} sx={{ color: '#4A90E2' }}>
                      {isAmharic ? 'በጤና ግብ ማጣራት' : 'Filter by Health Goal'}
                    </Typography>
                    <Grid container spacing={2}>
                      {healthGoals.map((goal) => (
                        <Grid item xs={6} key={goal.id}>
                          <Button
                            fullWidth
                            variant={selectedHealthGoal === goal.id ? 'contained' : 'outlined'}
                            onClick={() =>
                              setSelectedHealthGoal(selectedHealthGoal === goal.id ? null : goal.id)
                            }
                            sx={{
                              ...(selectedHealthGoal === goal.id && { bgcolor: '#4A90E2' }),
                            }}
                          >
                            {isAmharic ? goal.labelAm : goal.label}
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom mb={2} fontWeight={700} sx={{ color: '#4A90E2' }}>
              {isAmharic ? 'ባህላዊ መድሀኒቶች' : 'Traditional Remedies'}
            </Typography>
            <Grid container spacing={3}>
              {filteredRemedies.map((remedy) => {
                const dispName = isAmharic && remedy.nameAmharic ? remedy.nameAmharic : remedy.name;
                const dispDesc = getText(remedy, 'description');
                const dispIndications = getText(remedy, 'indications') as string[];
                return (
                  <Grid item xs={12} sm={6} md={4} key={remedy.id}>
                    <Card
                      sx={{
                        height: '100%',
                        cursor: 'pointer',
                        borderRadius: 3,
                        border: '2px solid',
                        borderColor: '#EEEEEE',
                        overflow: 'hidden',
                        '&:hover': {
                          boxShadow: 6,
                          borderColor: '#4A90E2',
                          transform: 'translateY(-4px)',
                        },
                      }}
                      onClick={() => handleRemedyClick(remedy)}
                    >
                      {/* Image placeholder (backend can supply imageUrl later) */}
                      <Box
                        sx={{
                          height: 120,
                          bgcolor: 'grey.200',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Healing sx={{ fontSize: 48, color: 'grey.400' }} />
                      </Box>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={1.5}>
                          <Typography variant="h6" fontWeight={600} sx={{ color: '#4A90E2' }}>
                            {dispName}
                          </Typography>
                          {remedy.ministryApproved && (
                            <Chip
                              icon={<VerifiedUser />}
                              label={isAmharic ? 'የተጸድቋል' : 'Approved'}
                              color="success"
                              size="small"
                            />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {String(dispDesc).substring(0, 100)}...
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                          {(dispIndications || []).slice(0, 2).map((ind, idx) => (
                            <Chip key={idx} label={ind} size="small" variant="outlined" sx={{ borderColor: '#4A90E2', color: '#4A90E2' }} />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {activeTab === 'professional' && (
          <Box>
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              <Typography variant="body2">
                {isAmharic
                  ? 'በሐኪም የሚታዘዙ መድሀኒቶች፣ የሕክምና ሂደቶች እና በክትትል የሚያስፈልጉ ሕክምናዎች ላይ ሁልጊዜ የጤና ባለሙያዎችን ያማክሩ።'
                  : 'Always consult healthcare professionals for prescription medications, medical procedures, and therapies requiring supervision.'}
              </Typography>
            </Alert>
            <Grid container spacing={3}>
              {professionalCare.map((care) => (
                <Grid item xs={12} md={6} key={care.title}>
                  <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom fontWeight={700} sx={{ color: '#4A90E2' }}>
                        {isAmharic ? care.titleAm : care.title}
                      </Typography>
                      <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                        {isAmharic ? 'ምሳሌዎች' : 'Examples'}:
                      </Typography>
                      <List dense disablePadding>
                        {care.examples.map((example, idx) => (
                          <ListItem key={idx} sx={{ py: 0.25 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <LocalHospital sx={{ color: '#4A90E2', fontSize: 20 }} />
                            </ListItemIcon>
                            <ListItemText primary={example} primaryTypographyProps={{ variant: 'body2' }} />
                          </ListItem>
                        ))}
                      </List>
                      <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                        {isAmharic ? care.whenToSeekAm : care.whenToSeek}
                      </Alert>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {activeTab === 'types' && (
          <Box>
            <Grid container spacing={3}>
              {medicineTypes.map((type) => (
                <Grid item xs={12} md={6} key={type.id}>
                  <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom fontWeight={700} sx={{ color: '#4A90E2' }}>
                        {isAmharic ? type.labelAm : type.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {isAmharic
                          ? `ስለ ${type.labelAm} እና በኢትዮጵያ የጤና አገልግሎት ውስጥ አጠቃቀማቸው መረጃ።`
                          : `Information about ${type.label.toLowerCase()} and their uses in Ethiopian healthcare.`}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        <Alert severity="warning" sx={{ mt: 4, borderRadius: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            {isAmharic ? 'አስፈላጊ የደህንነት መረጃ' : 'Important Safety Information'}
          </Typography>
          <Typography variant="body2">
            {isAmharic
              ? 'ማንኛውንም መድሀኒት ከመውሰድዎ በፊት ሁልጊዜ የጤና ባለሙያ ያማክሩ'
              : 'Always consult a healthcare professional before taking any medication'}
          </Typography>
          <Typography variant="body2">
            {isAmharic ? 'ይህ መረጃ ለትምህርታዊ ዓላማ ብቻ ነው' : 'This information is for educational purposes only'}
          </Typography>
        </Alert>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {selectedRemedy && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                <Typography variant="h5" fontWeight={600} sx={{ color: '#4A90E2' }}>
                  {isAmharic && selectedRemedy.nameAmharic ? selectedRemedy.nameAmharic : selectedRemedy.name}
                </Typography>
                <Box display="flex" gap={1}>
                  {selectedRemedy.ministryApproved && (
                    <Chip icon={<VerifiedUser />} label={isAmharic ? 'የሚኒስትሪ የተጸድቋል' : 'Ministry Approved'} color="success" size="small" />
                  )}
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              {/* Image placeholder for remedy (backend can supply imageUrl later) */}
              <Box
                sx={{
                  width: '100%',
                  height: 180,
                  bgcolor: 'grey.200',
                  borderRadius: 2,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Healing sx={{ fontSize: 64, color: 'grey.400' }} />
              </Box>
              <Typography variant="body1" paragraph>
                {getText(selectedRemedy, 'description')}
              </Typography>

              {selectedRemedy.culturalContext && (
                <Box
                  mb={2}
                  p={2}
                  borderRadius={2}
                  sx={{
                    bgcolor: 'primary.50',
                    border: '1px solid',
                    borderColor: 'primary.100',
                    color: 'text.primary',
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ color: 'text.primary' }}>
                    {isAmharic ? 'ባህላዊ አይነት' : 'Cultural Context'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    {getText(selectedRemedy, 'culturalContext')}
                  </Typography>
                </Box>
              )}

              <Typography variant="h6" gutterBottom mt={2} sx={{ color: '#4A90E2' }}>
                {isAmharic ? 'ዝግጅት' : 'Preparation'}
              </Typography>
              <Typography variant="body2" paragraph>
                {getText(selectedRemedy, 'preparation')}
              </Typography>

              <Typography variant="h6" gutterBottom mt={2} sx={{ color: '#4A90E2' }}>
                {isAmharic ? 'መጠን' : 'Dosage'}
              </Typography>
              <Typography variant="body2" paragraph>
                {getText(selectedRemedy, 'dosage')}
              </Typography>

              {(getText(selectedRemedy, 'indications') as string[])?.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom mt={2} sx={{ color: '#4A90E2' }}>
                    {isAmharic ? 'ማሳሰቢያዎች' : 'Indications'}
                  </Typography>
                  <List dense disablePadding>
                    {(getText(selectedRemedy, 'indications') as string[]).map((ind, idx) => (
                      <ListItem key={idx} sx={{ py: 0.25 }}>
                        <ListItemText primary={`• ${ind}`} primaryTypographyProps={{ variant: 'body2' }} />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              {(getText(selectedRemedy, 'contraindications') as string[])?.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom mt={2} sx={{ color: '#4A90E2' }}>
                    {isAmharic ? 'መተው ያለባቸው' : 'Contraindications'}
                  </Typography>
                  <List dense disablePadding>
                    {(getText(selectedRemedy, 'contraindications') as string[]).map((c, idx) => (
                      <ListItem key={idx} sx={{ py: 0.25 }}>
                        <ListItemText primary={`• ${c}`} primaryTypographyProps={{ variant: 'body2' }} />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              {selectedRemedy.safetyWarnings.length > 0 && (
                <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    {isAmharic ? 'የደህንነት ማስጠንቀቂያዎች' : 'Safety Warnings'}
                  </Typography>
                  {(getText(selectedRemedy, 'safetyWarnings') as string[]).map((warning, idx) => (
                    <Typography key={idx} variant="body2">
                      • {warning}
                    </Typography>
                  ))}
                </Alert>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setDialogOpen(false)}>{isAmharic ? 'ዝጋ' : 'Close'}</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};
