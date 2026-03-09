import React, { useState, useMemo } from 'react';
import { Box, Typography, Button, Slider, Chip, Alert, Stepper, Step, StepLabel, RadioGroup, FormControlLabel, Radio, Card, CardContent } from '@mui/material';
import { Add, LocalHospital, ArrowBack, ArrowForward, CompareArrows } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAI } from '@/contexts/AIContext';
import { useHealthData } from '@/contexts/HealthDataContext';
import { HealthCard, PrimaryButton, LoadingSpinner, TextField } from '@/components/ui';
import { BodyMap } from '@/components/ui/body-map/BodyMap';
import { Symptom, SymptomAnalysis } from '@/types';

interface SymptomTrackerProps {
  initialSymptoms?: Symptom[];
  patientContext?: any;
  deepSeekService?: any;
  onAnalysisComplete?: (analysis: SymptomAnalysis) => void;
  language?: 'en' | 'am';
  onSaveToRecords?: (analysis: SymptomAnalysis) => void;
  urgencyLevel?: 'low' | 'medium' | 'high' | 'critical';
}

const questionnaireSteps = [
  { label: 'Symptom Selection', key: 'symptom' },
  { label: 'Location', key: 'location' },
  { label: 'Severity', key: 'severity' },
  { label: 'Duration', key: 'duration' },
  { label: 'Additional Details', key: 'details' },
];

const commonSymptoms = [
  'Headache', 'Fever', 'Cough', 'Nausea', 'Dizziness', 'Fatigue',
  'Chest Pain', 'Shortness of Breath', 'Abdominal Pain', 'Joint Pain',
];

export const SymptomTracker: React.FC<SymptomTrackerProps> = ({
  initialSymptoms = [],
  patientContext: propPatientContext,
  deepSeekService: _deepSeekService,
  onAnalysisComplete,
  onSaveToRecords,
  language: _language,
}) => {
  const { t } = useTranslation();
  const { analyzeSymptoms, isProcessing } = useAI();
  const { patientData, symptomAnalyses } = useHealthData();
  const [symptoms, setSymptoms] = useState<Symptom[]>(initialSymptoms);
  const [currentSymptom, setCurrentSymptom] = useState<Partial<Symptom>>({
    name: '',
    severity: 5,
    duration: '',
    location: '',
  });
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [showHistoricalComparison, setShowHistoricalComparison] = useState(false);

  const patientContext = propPatientContext || patientData;

  // Get historical symptom analyses for comparison
  const historicalAnalyses = useMemo(() => {
    return symptomAnalyses.slice(-5).reverse();
  }, [symptomAnalyses]);

  const handleLocationSelect = (location: string) => {
    if (selectedLocations.includes(location)) {
      setSelectedLocations(selectedLocations.filter(l => l !== location));
    } else {
      setSelectedLocations([...selectedLocations, location]);
    }
    setCurrentSymptom({ ...currentSymptom, location: selectedLocations.join(', ') });
  };

  const handleNext = () => {
    if (activeStep < questionnaireSteps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleAddSymptom = () => {
    if (!currentSymptom.name) return;

    const newSymptom: Symptom = {
      id: Date.now().toString(),
      name: currentSymptom.name,
      severity: currentSymptom.severity || 5,
      duration: currentSymptom.duration || '',
      location: selectedLocations.join(', ') || currentSymptom.location,
      notes: currentSymptom.notes,
    };

    setSymptoms([...symptoms, newSymptom]);
    setCurrentSymptom({ name: '', severity: 5, duration: '', location: '' });
    setSelectedLocations([]);
    setActiveStep(0);
    setShowAddForm(false);
  };

  // Generate follow-up questions based on symptoms
  const generateFollowUpQuestions = (symptomName: string): string[] => {
    const questions: Record<string, string[]> = {
      'Headache': ['Is the pain on one side or both sides?', 'Does light or sound make it worse?', 'Have you had this type of headache before?'],
      'Fever': ['What is your temperature?', 'Do you have chills?', 'How long have you had the fever?'],
      'Cough': ['Is it a dry or productive cough?', 'Do you have any phlegm?', 'Does it get worse at night?'],
      'Chest Pain': ['Does it worsen with activity?', 'Is it sharp or dull?', 'Does it radiate to other areas?'],
    };
    return questions[symptomName] || ['Can you describe it in more detail?', 'When did it start?', 'What makes it better or worse?'];
  };

  const handleAnalyze = async () => {
    if (symptoms.length === 0) return;

    try {
      const result = await analyzeSymptoms(symptoms, patientContext);
      setAnalysis(result);
      
      // Generate follow-up questions based on analysis
      if (result.possibleConditions.length > 0) {
        const questions = symptoms.flatMap(s => generateFollowUpQuestions(s.name));
        setFollowUpQuestions(questions.slice(0, 3));
      }
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }

      if (onSaveToRecords) {
        onSaveToRecords(result);
      }
    } catch (error) {
      console.error('Failed to analyze symptoms:', error);
    }
  };

  const renderQuestionnaireStep = () => {
    switch (activeStep) {
      case 0: // Symptom Selection
        return (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              {t('symptoms.selectSymptom')}
            </Typography>
            <RadioGroup
              value={currentSymptom.name}
              onChange={(e) => {
                setCurrentSymptom({ ...currentSymptom, name: e.target.value });
                setFollowUpQuestions(generateFollowUpQuestions(e.target.value));
              }}
            >
              {commonSymptoms.map((symptom) => (
                <FormControlLabel key={symptom} value={symptom} control={<Radio />} label={symptom} />
              ))}
            </RadioGroup>
            <TextField
              fullWidth
              label={t('symptoms.customSymptom')}
              value={currentSymptom.name}
              onChange={(e) => setCurrentSymptom({ ...currentSymptom, name: e.target.value })}
              margin="normal"
              placeholder={t('symptoms.enterCustomSymptom')}
            />
          </Box>
        );
      case 1: // Location
        return (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              {t('symptoms.selectLocation')}
            </Typography>
            <BodyMap
              onLocationSelect={handleLocationSelect}
              selectedLocations={selectedLocations}
            />
            <TextField
              fullWidth
              label={t('symptoms.additionalLocation')}
              value={currentSymptom.location}
              onChange={(e) => setCurrentSymptom({ ...currentSymptom, location: e.target.value })}
              margin="normal"
              placeholder={t('symptoms.locationPlaceholder')}
            />
          </Box>
        );
      case 2: // Severity
        return (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              {t('symptoms.severity')}: {currentSymptom.severity}/10
            </Typography>
            <Slider
              value={currentSymptom.severity}
              onChange={(_, value) => setCurrentSymptom({ ...currentSymptom, severity: value as number })}
              min={1}
              max={10}
              marks={[
                { value: 1, label: t('symptoms.mild') },
                { value: 5, label: t('symptoms.moderate') },
                { value: 10, label: t('symptoms.severe') },
              ]}
              step={1}
            />
          </Box>
        );
      case 3: // Duration
        return (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              {t('symptoms.duration')}
            </Typography>
            <RadioGroup
              value={currentSymptom.duration}
              onChange={(e) => setCurrentSymptom({ ...currentSymptom, duration: e.target.value })}
            >
              <FormControlLabel value="< 1 hour" control={<Radio />} label={t('symptoms.lessThanHour')} />
              <FormControlLabel value="1-6 hours" control={<Radio />} label={t('symptoms.oneToSixHours')} />
              <FormControlLabel value="6-24 hours" control={<Radio />} label={t('symptoms.sixToTwentyFourHours')} />
              <FormControlLabel value="1-3 days" control={<Radio />} label={t('symptoms.oneToThreeDays')} />
              <FormControlLabel value="> 3 days" control={<Radio />} label={t('symptoms.moreThanThreeDays')} />
            </RadioGroup>
            <TextField
              fullWidth
              label={t('symptoms.customDuration')}
              value={currentSymptom.duration}
              onChange={(e) => setCurrentSymptom({ ...currentSymptom, duration: e.target.value })}
              margin="normal"
              placeholder={t('symptoms.durationPlaceholder')}
            />
          </Box>
        );
      case 4: // Additional Details
        return (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              {t('symptoms.additionalDetails')}
            </Typography>
            {followUpQuestions.length > 0 && (
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('symptoms.followUpQuestions')}:
                </Typography>
                {followUpQuestions.map((q, idx) => (
                  <Chip key={idx} label={q} sx={{ m: 0.5 }} />
                ))}
              </Box>
            )}
            <TextField
              fullWidth
              multiline
              rows={4}
              label={t('symptoms.notes')}
              value={currentSymptom.notes || ''}
              onChange={(e) => setCurrentSymptom({ ...currentSymptom, notes: e.target.value })}
              margin="normal"
              placeholder={t('symptoms.notesPlaceholder')}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'success';
    }
  };

  return (
    <Box>
      <HealthCard
        title={t('symptoms.title')}
        icon={<LocalHospital color="primary" />}
        action={
          <Button
            startIcon={<Add />}
            onClick={() => setShowAddForm(!showAddForm)}
            variant="outlined"
            size="small"
          >
            {t('symptoms.addSymptom')}
          </Button>
        }
      >
        {showAddForm && (
          <Box mb={3} p={2} bgcolor="background.default" borderRadius={1}>
            <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
              {questionnaireSteps.map((step) => (
                <Step key={step.key}>
                  <StepLabel>{step.label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            {renderQuestionnaireStep()}
            
            <Box display="flex" justifyContent="space-between" mt={3}>
              <Button
                startIcon={<ArrowBack />}
                onClick={handleBack}
                disabled={activeStep === 0}
              >
                {t('common.back')}
              </Button>
              {activeStep < questionnaireSteps.length - 1 ? (
                <PrimaryButton endIcon={<ArrowForward />} onClick={handleNext}>
                  {t('common.next')}
                </PrimaryButton>
              ) : (
                <PrimaryButton onClick={handleAddSymptom} disabled={!currentSymptom.name}>
                  {t('common.add')}
                </PrimaryButton>
              )}
            </Box>
          </Box>
        )}

        {symptoms.length > 0 && (
          <Box mb={3}>
            <Typography variant="subtitle2" gutterBottom>
              Current Symptoms:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {symptoms.map((symptom) => (
                <Chip
                  key={symptom.id}
                  label={`${symptom.name} (${symptom.severity}/10)`}
                  onDelete={() => setSymptoms(symptoms.filter((s) => s.id !== symptom.id))}
                />
              ))}
            </Box>
            <PrimaryButton
              onClick={handleAnalyze}
              fullWidth
              sx={{ mt: 2 }}
              disabled={isProcessing}
            >
              {isProcessing ? <LoadingSpinner size={20} /> : t('symptoms.analyze')}
            </PrimaryButton>
          </Box>
        )}

        {analysis && (
          <Box mt={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                {t('symptoms.analysisResults')}
              </Typography>
              <Button
                startIcon={<CompareArrows />}
                onClick={() => setShowHistoricalComparison(!showHistoricalComparison)}
                size="small"
              >
                {t('symptoms.compareHistory')}
              </Button>
            </Box>
            <Alert severity={getUrgencyColor(analysis.urgencyLevel)} sx={{ mb: 2 }}>
              <Typography variant="subtitle2">
                {t('symptoms.urgencyLevel')}: {analysis.urgencyLevel.toUpperCase()}
              </Typography>
              <Typography variant="caption" display="block" mt={1}>
                {t('symptoms.confidence')}: {(analysis.confidence * 100).toFixed(0)}%
              </Typography>
            </Alert>
            <Typography variant="subtitle2" gutterBottom>
              {t('symptoms.possibleConditions')}:
            </Typography>
            {analysis.possibleConditions.map((condition, idx) => (
              <Box key={idx} mb={1} p={1} bgcolor="background.default" borderRadius={1}>
                <Typography variant="body2" fontWeight={600}>
                  {condition.condition} ({(condition.probability * 100).toFixed(0)}%)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {condition.description}
                </Typography>
              </Box>
            ))}
            <Typography variant="subtitle2" gutterBottom mt={2}>
              {t('symptoms.recommendations')}:
            </Typography>
            {analysis.recommendations.map((rec, idx) => (
              <Typography key={idx} variant="body2" component="li">
                {rec}
              </Typography>
            ))}
            
            {showHistoricalComparison && historicalAnalyses.length > 0 && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('symptoms.historicalComparison')}
                  </Typography>
                  {historicalAnalyses.map((hist, idx) => (
                    <Box key={idx} mb={2} p={1} bgcolor="background.default" borderRadius={1}>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(hist.timestamp).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2">
                        {hist.symptoms.map(s => s.name).join(', ')}
                      </Typography>
                      <Chip
                        label={hist.urgencyLevel}
                        size="small"
                        color={getUrgencyColor(hist.urgencyLevel) as any}
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}
          </Box>
        )}
      </HealthCard>
    </Box>
  );
};

