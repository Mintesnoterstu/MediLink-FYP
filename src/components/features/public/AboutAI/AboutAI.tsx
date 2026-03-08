import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Accordion, AccordionSummary, AccordionDetails, LinearProgress, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { ExpandMore, SmartToy, CheckCircle, Warning, People } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { PrimaryButton } from '@/components/ui';
import { AICapability, PerformanceStats, CaseStudy } from '@/types';

interface AboutAIProps {
  aiCapabilities?: AICapability[];
  performanceMetrics?: PerformanceStats;
  trainingDataSources?: Array<{ id: string; name: string; description: string }>;
  caseStudies?: CaseStudy[];
  userQuestions?: Array<{ id: string; question: string; answer: string }>;
  onAskQuestion?: (question: string) => void;
}

const mockCapabilities: AICapability[] = [
  {
    id: '1',
    title: 'Symptom Analysis',
    description: 'Analyzes symptoms and provides possible condition probabilities with confidence scores.',
    accuracy: 87,
    limitations: ['Not a replacement for professional diagnosis', 'Requires sufficient symptom information'],
    useCases: ['Initial symptom assessment', 'Health education', 'Triage guidance'],
  },
  {
    id: '2',
    title: 'Medication Advice',
    description: 'Provides medication information and checks for potential drug interactions.',
    accuracy: 92,
    limitations: ['Does not replace pharmacist consultation', 'May not cover all medications'],
    useCases: ['Drug interaction checking', 'Dosage information', 'Medication education'],
  },
  {
    id: '3',
    title: 'Lifestyle Coaching',
    description: 'Offers culturally appropriate health and lifestyle recommendations.',
    accuracy: 78,
    limitations: ['General recommendations only', 'May not suit all individuals'],
    useCases: ['Dietary advice', 'Exercise recommendations', 'Preventive care'],
  },
];

const mockCaseStudies: CaseStudy[] = [
  {
    id: '1',
    title: 'Early Symptom Detection',
    scenario: 'Patient reported persistent cough and fatigue',
    aiAnalysis: 'AI identified possible respiratory infection with 85% confidence, recommended immediate medical consultation',
    outcome: 'Patient consulted doctor, early treatment prevented complications',
    anonymized: true,
  },
  {
    id: '2',
    title: 'Medication Interaction Alert',
    scenario: 'Patient taking multiple medications for chronic conditions',
    aiAnalysis: 'AI detected potential interaction between medications, flagged for review',
    outcome: 'Healthcare provider adjusted medication regimen, avoided adverse reaction',
    anonymized: true,
  },
];

export const AboutAI: React.FC<AboutAIProps> = ({
  aiCapabilities: propCapabilities,
  performanceMetrics: propMetrics,
  caseStudies: propCaseStudies,
  onAskQuestion,
}) => {
  const { t } = useTranslation();
  const [selectedCapability, setSelectedCapability] = useState<AICapability | null>(null);
  const [demoQuestion, setDemoQuestion] = useState('');
  const [demoDialogOpen, setDemoDialogOpen] = useState(false);

  const capabilities = propCapabilities || mockCapabilities;
  const caseStudies = propCaseStudies || mockCaseStudies;
  const metrics = propMetrics || {
    totalQueries: 45230,
    accuracyRate: 87,
    averageConfidence: 0.82,
    userSatisfaction: 4.2,
    responseTime: 1.2,
  };

  const handleAskQuestion = () => {
    if (demoQuestion.trim() && onAskQuestion) {
      onAskQuestion(demoQuestion);
      setDemoQuestion('');
      setDemoDialogOpen(false);
    }
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
          {t('aboutAI.title')}
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          {t('aboutAI.subtitle')}
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        {/* How AI Works */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              {t('aboutAI.howItWorks')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('aboutAI.howItWorksDesc')}
            </Typography>
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                {t('aboutAI.trainingData')}
              </Typography>
              <List>
                <ListItem>
                  <ListItemText primary="• Ethiopian medical textbooks and guidelines" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Local health authority recommendations" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Verified traditional medicine practices" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Regional disease prevalence data" />
                </ListItem>
              </List>
            </Box>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight={700} color="primary.main">
                    {metrics.totalQueries.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('aboutAI.totalQueries')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    {metrics.accuracyRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('aboutAI.accuracyRate')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight={700} color="info.main">
                    {(metrics.averageConfidence * 100).toFixed(0)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('aboutAI.avgConfidence')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight={700} color="warning.main">
                    {metrics.responseTime}s
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('aboutAI.avgResponseTime')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* AI Capabilities */}
        <Typography variant="h5" gutterBottom fontWeight={600} mb={3}>
          {t('aboutAI.capabilities')}
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {capabilities.map((capability) => (
            <Grid item xs={12} md={4} key={capability.id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 4 },
                }}
                onClick={() => setSelectedCapability(capability)}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <SmartToy color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      {capability.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {capability.description}
                  </Typography>
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="caption">{t('aboutAI.accuracy')}</Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {capability.accuracy}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={capability.accuracy}
                      color={capability.accuracy >= 85 ? 'success' : capability.accuracy >= 70 ? 'warning' : 'error'}
                    />
                  </Box>
                  <Chip
                    label={`${capability.useCases.length} ${t('aboutAI.useCases')}`}
                    size="small"
                    color="primary"
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Limitations & Disclaimers */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              {t('aboutAI.limitations')}
            </Typography>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {t('aboutAI.notReplacement')}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  {t('aboutAI.notReplacementDesc')}
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {t('aboutAI.confidenceLevels')}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  {t('aboutAI.confidenceLevelsDesc')}
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {t('aboutAI.humanOversight')}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  {t('aboutAI.humanOversightDesc')}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>

        {/* Case Studies */}
        <Typography variant="h5" gutterBottom fontWeight={600} mb={3}>
          {t('aboutAI.caseStudies')}
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {caseStudies.map((study) => (
            <Grid item xs={12} md={6} key={study.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    {study.title}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('aboutAI.scenario')}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {study.scenario}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('aboutAI.aiAnalysis')}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {study.aiAnalysis}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('aboutAI.outcome')}
                  </Typography>
                  <Typography variant="body2">
                    {study.outcome}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* AI Decision Simulator */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              {t('aboutAI.decisionSimulator')}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {t('aboutAI.decisionSimulatorDesc')}
            </Typography>
            <Box mt={2}>
              <Button
                variant="outlined"
                startIcon={<SmartToy />}
                onClick={() => setDemoDialogOpen(true)}
              >
                {t('aboutAI.trySimulator')}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Feedback System */}
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              {t('aboutAI.feedback')}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {t('aboutAI.feedbackDesc')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<People />}
              onClick={() => setDemoDialogOpen(true)}
              sx={{ mt: 2 }}
            >
              {t('aboutAI.submitFeedback')}
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* Capability Detail Dialog */}
      <Dialog
        open={!!selectedCapability}
        onClose={() => setSelectedCapability(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedCapability && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={1}>
                <SmartToy color="primary" />
                <Typography variant="h5">{selectedCapability.title}</Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" paragraph>
                {selectedCapability.description}
              </Typography>
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('aboutAI.accuracy')}: {selectedCapability.accuracy}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={selectedCapability.accuracy}
                  color={selectedCapability.accuracy >= 85 ? 'success' : 'warning'}
                />
              </Box>
              <Typography variant="h6" gutterBottom mt={2}>
                {t('aboutAI.useCases')}
              </Typography>
              <List>
                {selectedCapability.useCases.map((useCase, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={useCase} />
                  </ListItem>
                ))}
              </List>
              <Typography variant="h6" gutterBottom mt={2}>
                {t('aboutAI.limitations')}
              </Typography>
              <List>
                {selectedCapability.limitations.map((limitation, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon>
                      <Warning color="warning" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={limitation} />
                  </ListItem>
                ))}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedCapability(null)}>{t('common.close')}</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Demo/Feedback Dialog */}
      <Dialog open={demoDialogOpen} onClose={() => setDemoDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('aboutAI.askQuestion')}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder={t('aboutAI.questionPlaceholder')}
            value={demoQuestion}
            onChange={(e) => setDemoQuestion(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDemoDialogOpen(false)}>{t('common.cancel')}</Button>
          <PrimaryButton onClick={handleAskQuestion} disabled={!demoQuestion.trim()}>
            {t('aboutAI.submit')}
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

