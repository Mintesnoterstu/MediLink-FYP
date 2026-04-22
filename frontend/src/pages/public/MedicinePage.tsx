import React, { useEffect, useMemo, useState } from 'react';
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
  CircularProgress,
} from '@mui/material';
import { Search, VerifiedUser, LocalHospital, Healing, Info, Clear } from '@mui/icons-material';
import { useUI } from '@/contexts/UIContext';
import { VerifiedRemedy } from '@/types';
import { mockSelfCareRemedies } from '@/data/medicinesData';
import { catalogService } from '@/services/catalogService';

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
  const medImg = (filename: string) => `/medicine%20images/${encodeURIComponent(filename)}`;
  const normalizeName = (value: string) =>
    String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

  // Canonical 20-medicine list (only these should appear)
  const canonicalMedicines = [
    { key: 'paracetamol', name: 'Paracetamol', nameAmharic: 'ፓራሲታሞል', category: 'modern' as const, imageUrl: medImg('Paracetamol.png') },
    { key: 'ibuprofen', name: 'Ibuprofen', nameAmharic: 'ኢቡፕሮፌን', category: 'modern' as const, imageUrl: medImg('Ibuprofen.png') },
    { key: 'aspirinlowdose', name: 'Aspirin (Low Dose)', nameAmharic: 'አስፒሪን', category: 'modern' as const, imageUrl: medImg('Aspirin (Low Dose).png') },
    { key: 'cetirizine', name: 'Cetirizine', nameAmharic: 'ሴቲሪዚን', category: 'modern' as const, imageUrl: medImg('Cetirizine.png') },
    { key: 'loratadine', name: 'Loratadine', nameAmharic: 'ሎራታዲን', category: 'modern' as const, imageUrl: medImg('Loratadine.png') },
    { key: 'oralrehydrationsaltsors', name: 'Oral Rehydration Salts (ORS)', nameAmharic: 'ኦአርኤስ', category: 'modern' as const, imageUrl: medImg('Oral Rehydration Salts (ORS).png') },
    { key: 'multivitamins', name: 'Multivitamins', nameAmharic: 'ማልቲቫይታሚን', category: 'modern' as const, imageUrl: medImg('multivitamin capsules.png') },
    { key: 'antacid', name: 'Antacid', nameAmharic: 'አንታሲድ', category: 'modern' as const, imageUrl: medImg('antacid.png') },

    { key: 'amoxicillin', name: 'Amoxicillin', nameAmharic: 'አሞክሲሲሊን', category: 'prescription' as const, imageUrl: medImg('Amoxicillin.png') },
    { key: 'azithromycin', name: 'Azithromycin', nameAmharic: 'አዚትሮማይሲን', category: 'prescription' as const, imageUrl: medImg('Azithromycin.png') },
    { key: 'metformin', name: 'Metformin', nameAmharic: 'ሜትፎርሚን', category: 'prescription' as const, imageUrl: medImg('Metformin.png') },
    { key: 'amlodipine', name: 'Amlodipine', nameAmharic: 'አምሎዲፒን', category: 'prescription' as const, imageUrl: medImg('Amlodipine.png') },
    { key: 'omeprazole', name: 'Omeprazole', nameAmharic: 'ኦሜፕራዞል', category: 'prescription' as const, imageUrl: medImg('Omeprazole.png') },
    { key: 'salbutamolinhaler', name: 'Salbutamol Inhaler', nameAmharic: 'ሳልቡታሞል ኢንሄለር', category: 'prescription' as const, imageUrl: medImg('Salbutamol inhaler.png') },

    { key: 'honey', name: 'Honey', nameAmharic: 'ማር', category: 'traditional' as const, imageUrl: medImg('honey.png') },
    { key: 'ginger', name: 'Ginger', nameAmharic: 'ዝንጅብል', category: 'traditional' as const, imageUrl: medImg('ginger.png') },
    { key: 'garlic', name: 'Garlic', nameAmharic: 'ነጭ ሽንኩርት', category: 'traditional' as const, imageUrl: medImg('fresh garlic.png') },
    { key: 'moringashiferaw', name: 'Moringa (Shiferaw)', nameAmharic: 'ሞሪንጋ (ሽፈራው)', category: 'traditional' as const, imageUrl: medImg('moringa.png') },
    { key: 'blackseednigella', name: 'Black Seed (Nigella)', nameAmharic: 'ጥቁር አዝሙድ', category: 'traditional' as const, imageUrl: medImg('black seed.png') },
    { key: 'turmeric', name: 'Turmeric', nameAmharic: 'እርድ', category: 'traditional' as const, imageUrl: medImg('turmeric.png') },
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'self-care' | 'professional' | 'types'>('self-care');
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [selectedHealthGoal, setSelectedHealthGoal] = useState<string | null>(null);
  const [selectedRemedy, setSelectedRemedy] = useState<VerifiedRemedy | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [visibleBySection, setVisibleBySection] = useState<Record<string, number>>({
    otc: 6,
    rx: 6,
    trad: 6,
  });
  const [remedies, setRemedies] = useState<VerifiedRemedy[]>([]);
  const [loadingRemedies, setLoadingRemedies] = useState(true);
  const [remediesError, setRemediesError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadMedicines = async () => {
      try {
        setLoadingRemedies(true);
        setRemediesError(null);
        const rows = await catalogService.getMedicines();
        const source = Array.isArray(rows) && rows.length > 0 ? rows : mockSelfCareRemedies;
        const sourceByNormalized = new Map(source.map((r) => [normalizeName(r.name), r] as const));

        // Only keep the canonical 20 list and enrich details from API/local source.
        const finalList = canonicalMedicines.map((canon, index) => {
          const matched =
            sourceByNormalized.get(canon.key) ||
            sourceByNormalized.get(normalizeName(canon.name)) ||
            sourceByNormalized.get(
              canon.key === 'garlic'
                ? 'freshgarlic'
                : canon.key === 'moringashiferaw'
                  ? 'moringa'
                  : canon.key === 'blackseednigella'
                    ? 'blackseed'
                    : canon.key,
            );

          const fallback = mockSelfCareRemedies.find((r) => normalizeName(r.name) === canon.key) || mockSelfCareRemedies[0];
          const base = matched || fallback;

          return {
            ...base,
            id: base?.id || `med-${index + 1}`,
            name: canon.name,
            nameAmharic: canon.nameAmharic,
            category: canon.category,
            imageUrl: canon.imageUrl,
          };
        });

        if (active) setRemedies(finalList);
      } catch (error: any) {
        if (active) {
          const fallbackOnly = canonicalMedicines.map((canon, index) => {
            const fromLocal = mockSelfCareRemedies.find((r) => normalizeName(r.name) === canon.key) || mockSelfCareRemedies[0];
            return {
              ...fromLocal,
              id: fromLocal?.id || `med-fallback-${index + 1}`,
              name: canon.name,
              nameAmharic: canon.nameAmharic,
              category: canon.category,
              imageUrl: canon.imageUrl,
            };
          });
          setRemedies(fallbackOnly);
          setRemediesError(error?.message || null);
        }
      } finally {
        if (active) setLoadingRemedies(false);
      }
    };
    loadMedicines();
    return () => {
      active = false;
    };
  }, []);

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
    let filtered = remedies;

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
  }, [searchQuery, selectedBodyPart, selectedHealthGoal, remedies]);

  const otcMedicines = useMemo(
    () => filteredRemedies.filter((r) => r.category === 'modern'),
    [filteredRemedies],
  );
  const prescriptionMedicines = useMemo(
    () => filteredRemedies.filter((r) => r.category === 'prescription'),
    [filteredRemedies],
  );
  const traditionalMedicines = useMemo(
    () => filteredRemedies.filter((r) => r.category === 'traditional'),
    [filteredRemedies],
  );

  const categoryChip = (r: VerifiedRemedy) => {
    if (r.category === 'modern')
      return isAmharic ? 'ያለ ሐኪም (OTC)' : 'OTC';
    if (r.category === 'prescription') return isAmharic ? 'በሐኪም ብቻ' : 'Prescription';
    return isAmharic ? 'ባህላዊ / ዕፅዋት' : 'Traditional';
  };

  const medicineSections = useMemo(
    () => [
      {
        sectionKey: 'otc',
        title: isAmharic ? 'ያለ ሐኪም የሚገዙ (OTC)' : 'Over-the-counter (OTC)',
        items: otcMedicines,
      },
      {
        sectionKey: 'rx',
        title: isAmharic ? 'በሐኪም የሚታዘዙ' : 'Prescription medicines',
        items: prescriptionMedicines,
      },
      {
        sectionKey: 'trad',
        title: isAmharic ? 'ባህላዊ / ዕፅዋት' : 'Traditional & herbal',
        items: traditionalMedicines,
      },
    ],
    [isAmharic, otcMedicines, prescriptionMedicines, traditionalMedicines],
  );

  useEffect(() => {
    // When filters change, restart each section pagination
    setVisibleBySection({ otc: 6, rx: 6, trad: 6 });
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
          py: { xs: 3, sm: 4 },
          px: { xs: 1.5, sm: 2 },
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          fontWeight={700}
          sx={{ fontSize: { xs: '1.65rem', sm: '2rem', md: '2.75rem' }, lineHeight: 1.2, px: 1 }}
        >
          {heroTitle}
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9, fontSize: { xs: '0.95rem', sm: '1.1rem' }, px: 1 }}>
          {heroSubtitle}
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%', p: { xs: 2, sm: 3 }, boxSizing: 'border-box' }}>
        {loadingRemedies ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : null}
        {remediesError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {remediesError}
          </Alert>
        ) : null}
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
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            mb: 3,
            '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', minHeight: 44, fontSize: { xs: '0.8rem', sm: '0.875rem' } },
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

            {medicineSections.map((section, sIdx) => (
              <Box key={section.sectionKey} sx={{ mb: sIdx < medicineSections.length - 1 ? 4 : 0 }}>
                <Typography variant="h6" gutterBottom mb={2} fontWeight={700} sx={{ color: '#4A90E2' }}>
                  {section.title}
                </Typography>
                <Grid container spacing={3}>
                  {section.items.slice(0, visibleBySection[section.sectionKey] ?? 6).map((remedy) => {
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
                          <Box
                            sx={{
                              height: 120,
                              bgcolor: 'grey.200',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                            }}
                          >
                            {remedy.imageUrl ? (
                              <Box
                                component="img"
                                src={remedy.imageUrl}
                                alt=""
                                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <Healing sx={{ fontSize: 48, color: 'grey.400' }} />
                            )}
                          </Box>
                          <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="start" mb={1} flexWrap="wrap" gap={0.5}>
                              <Typography variant="h6" fontWeight={600} sx={{ color: '#4A90E2' }}>
                                {dispName}
                              </Typography>
                              <Chip
                                label={categoryChip(remedy)}
                                size="small"
                                variant="outlined"
                                sx={{ borderColor: '#4A90E2', color: '#4A90E2' }}
                              />
                            </Box>
                            <Box display="flex" justifyContent="flex-end" mb={1}>
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
                              {String(dispDesc).length > 110 ? `${String(dispDesc).substring(0, 110)}…` : dispDesc}
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={1}>
                              {(dispIndications || []).slice(0, 2).map((ind, idx) => (
                                <Chip
                                  key={idx}
                                  label={ind}
                                  size="small"
                                  variant="outlined"
                                  sx={{ borderColor: '#4A90E2', color: '#4A90E2' }}
                                />
                              ))}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
                {section.items.length > (visibleBySection[section.sectionKey] ?? 6) && (
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={() =>
                        setVisibleBySection((prev) => ({
                          ...prev,
                          [section.sectionKey]: (prev[section.sectionKey] ?? 6) + 6,
                        }))
                      }
                      sx={{ borderRadius: 999, px: 4 }}
                    >
                      {isAmharic ? 'ተጨማሪ አሳይ' : 'Load more'}
                    </Button>
                  </Box>
                )}
              </Box>
            ))}
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
                  overflow: 'hidden',
                }}
              >
                {selectedRemedy.imageUrl ? (
                  <Box
                    component="img"
                    src={selectedRemedy.imageUrl}
                    alt=""
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Healing sx={{ fontSize: 64, color: 'grey.400' }} />
                )}
              </Box>
              <Chip
                label={categoryChip(selectedRemedy)}
                size="small"
                sx={{ mb: 2 }}
                variant="outlined"
              />
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
