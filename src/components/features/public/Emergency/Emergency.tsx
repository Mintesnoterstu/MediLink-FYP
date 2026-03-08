import React from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Paper,
  Divider,
  Alert,
  Container,
} from '@mui/material';
import {
  LocalHospital,
  Phone,
  Warning,
  Info,
  Directions,
  AccessTime,
  Favorite,
  Medication,
  Person,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useHealthData } from '@/contexts/HealthDataContext';
import { useNavigate } from 'react-router-dom';

export const Emergency: React.FC = () => {
  const { t } = useTranslation();
  const { patientData } = useHealthData();
  const navigate = useNavigate();

  const emergencyContacts = [
    { name: 'Police', number: '911', type: 'police' },
    { name: 'Ambulance', number: '907', type: 'ambulance' },
    { name: 'Fire Department', number: '939', type: 'fire' },
    { name: 'Poison Control', number: '+251-11-123-4567', type: 'poison' },
  ];

  const hospitals = [
    {
      name: 'Black Lion Hospital',
      address: 'Addis Ababa, Ethiopia',
      phone: '+251-11-123-4567',
      distance: '2.5 km',
      services: ['Emergency', 'Trauma', 'ICU'],
    },
    {
      name: 'St. Paul\'s Hospital',
      address: 'Addis Ababa, Ethiopia',
      phone: '+251-11-234-5678',
      distance: '3.2 km',
      services: ['Emergency', 'Cardiology', 'Pediatrics'],
    },
    {
      name: 'Tikur Anbessa Hospital',
      address: 'Addis Ababa, Ethiopia',
      phone: '+251-11-345-6789',
      distance: '4.1 km',
      services: ['Emergency', 'Surgery', 'Neurology'],
    },
  ];

  const emergencyProcedures = [
    {
      title: 'Heart Attack',
      steps: [
        'Call 911/907 immediately',
        'Have person sit or lie down',
        'Loosen tight clothing',
        'Give aspirin if available and not allergic',
        'Stay with person until help arrives',
      ],
    },
    {
      title: 'Stroke',
      steps: [
        'Call 911/907 immediately',
        'Note time symptoms started',
        'Keep person calm and comfortable',
        'Do NOT give food or water',
        'Monitor breathing and consciousness',
      ],
    },
    {
      title: 'Severe Bleeding',
      steps: [
        'Apply direct pressure to wound',
        'Elevate injured area if possible',
        'Call 911/907 if bleeding is severe',
        'Keep person warm and calm',
        'Do NOT remove objects stuck in wound',
      ],
    },
    {
      title: 'Choking',
      steps: [
        'Encourage coughing if person can cough',
        'Perform Heimlich maneuver if needed',
        'Call 911/907 if person cannot breathe',
        'Continue until object is expelled or help arrives',
        'Check for breathing after object is removed',
      ],
    },
  ];

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  const handleGetDirections = (hospital: typeof hospitals[0]) => {
    // In a real app, this would open maps with directions
    const query = encodeURIComponent(`${hospital.name} ${hospital.address}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <Box>
      {/* Emergency Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
          color: 'white',
          py: 4,
          textAlign: 'center',
        }}
      >
        <Container>
          <LocalHospital sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h2" component="h1" gutterBottom fontWeight={700}>
            {t('emergency.title') || 'EMERGENCY ASSISTANCE'}
          </Typography>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {t('emergency.callFirst') || 'CALL 911/907 FIRST FOR LIFE-THREATENING EMERGENCIES'}
          </Typography>
          <Alert severity="error" sx={{ mt: 2, bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}>
            <Typography variant="h6" fontWeight={600}>
              {t('emergency.urgent') || 'If this is a life-threatening emergency, call emergency services immediately!'}
            </Typography>
          </Alert>
        </Container>
      </Box>

      <Container sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Emergency Contacts */}
          <Grid item xs={12} md={6}>
            <Card sx={{ border: '2px solid', borderColor: 'error.main', boxShadow: 4 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom fontWeight={700} color="error.main">
                  <Phone sx={{ verticalAlign: 'middle', mr: 1 }} />
                  {t('emergency.emergencyContacts') || 'Emergency Contacts'}
                </Typography>
                <List>
                  {emergencyContacts.map((contact, idx) => (
                    <React.Fragment key={idx}>
                      <ListItem>
                        <ListItemIcon>
                          <Phone color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary={contact.name}
                          secondary={contact.number}
                        />
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<Phone />}
                          onClick={() => handleCall(contact.number)}
                          sx={{ fontWeight: 600 }}
                        >
                          {t('emergency.call') || 'Call'}
                        </Button>
                      </ListItem>
                      {idx < emergencyContacts.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Nearby Hospitals */}
          <Grid item xs={12} md={6}>
            <Card sx={{ border: '2px solid', borderColor: 'primary.main', boxShadow: 4 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom fontWeight={700} color="primary.main">
                  <LocalHospital sx={{ verticalAlign: 'middle', mr: 1 }} />
                  {t('emergency.nearbyHospitals') || 'Nearby Hospitals'}
                </Typography>
                <List>
                  {hospitals.map((hospital, idx) => (
                    <React.Fragment key={idx}>
                      <ListItem>
                        <ListItemIcon>
                          <LocalHospital color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={hospital.name}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {hospital.address}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {hospital.phone} • {hospital.distance}
                              </Typography>
                              <Box display="flex" gap={0.5} mt={0.5} flexWrap="wrap">
                                {hospital.services.map((service, sIdx) => (
                                  <Chip key={sIdx} label={service} size="small" color="primary" variant="outlined" />
                                ))}
                              </Box>
                            </Box>
                          }
                        />
                        <Box display="flex" flexDirection="column" gap={1}>
                          <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<Phone />}
                            onClick={() => handleCall(hospital.phone)}
                            size="small"
                          >
                            {t('emergency.call') || 'Call'}
                          </Button>
                          <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<Directions />}
                            onClick={() => handleGetDirections(hospital)}
                            size="small"
                          >
                            {t('emergency.directions') || 'Directions'}
                          </Button>
                        </Box>
                      </ListItem>
                      {idx < hospitals.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Emergency Procedures */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom fontWeight={700} color="error.main">
                  <Warning sx={{ verticalAlign: 'middle', mr: 1 }} />
                  {t('emergency.emergencyProcedures') || 'Emergency Procedures'}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {t('emergency.proceduresNote') || 'Basic first aid procedures. Always call emergency services first for serious situations.'}
                </Typography>
                <Grid container spacing={2} mt={1}>
                  {emergencyProcedures.map((procedure, idx) => (
                    <Grid item xs={12} sm={6} md={3} key={idx}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2,
                          height: '100%',
                          border: '1px solid',
                          borderColor: 'error.light',
                        }}
                      >
                        <Typography variant="h6" gutterBottom fontWeight={600} color="error.main">
                          {procedure.title}
                        </Typography>
                        <List dense>
                          {procedure.steps.map((step, sIdx) => (
                            <ListItem key={sIdx} sx={{ py: 0.5, px: 0 }}>
                              <ListItemIcon sx={{ minWidth: 24 }}>
                                <Typography variant="body2" color="error.main">
                                  {sIdx + 1}.
                                </Typography>
                              </ListItemIcon>
                              <ListItemText
                                primary={<Typography variant="body2">{step}</Typography>}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Medical Information Card */}
          {patientData && (
            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: 'info.light' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom fontWeight={700}>
                    <Person sx={{ verticalAlign: 'middle', mr: 1 }} />
                    {t('emergency.yourMedicalInfo') || 'Your Medical Information'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {t('emergency.medicalInfoNote') || 'Keep this information accessible for first responders'}
                  </Typography>
                  
                  {patientData.allergies && patientData.allergies.length > 0 && (
                    <Box mb={2}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        <Warning sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: 18 }} />
                        {t('emergency.allergies') || 'Allergies:'}
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {patientData.allergies.map((allergy, idx: number) => (
                          <Chip key={idx} label={allergy.allergen} color="error" size="small" />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {patientData.currentMedications && patientData.currentMedications.length > 0 && (
                    <Box mb={2}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        <Medication sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: 18 }} />
                        {t('emergency.currentMedications') || 'Current Medications:'}
                      </Typography>
                      <List dense>
                        {patientData.currentMedications.slice(0, 5).map((med: any, idx: number) => (
                          <ListItem key={idx} sx={{ py: 0 }}>
                            <ListItemText
                              primary={med.name}
                              secondary={`${med.dosage} - ${med.frequency}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {patientData.emergencyContacts && patientData.emergencyContacts.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        <Favorite sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: 18 }} />
                        {t('emergency.emergencyContacts') || 'Emergency Contacts:'}
                      </Typography>
                      <List dense>
                        {patientData.emergencyContacts.map((contact: any, idx: number) => (
                          <ListItem key={idx} sx={{ py: 0 }}>
                            <ListItemText
                              primary={contact.name}
                              secondary={`${contact.relationship} • ${contact.phone}`}
                            />
                            <Button
                              size="small"
                              startIcon={<Phone />}
                              onClick={() => handleCall(contact.phone)}
                            >
                              {t('emergency.call') || 'Call'}
                            </Button>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Emergency Checklist */}
          <Grid item xs={12} md={patientData ? 6 : 12}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom fontWeight={700}>
                  <Info sx={{ verticalAlign: 'middle', mr: 1 }} />
                  {t('emergency.emergencyChecklist') || 'Emergency Checklist'}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {t('emergency.checklistNote') || 'What to have ready in an emergency:'}
                </Typography>
                <List>
                  {[
                    t('emergency.checklist1') || 'Emergency contact numbers',
                    t('emergency.checklist2') || 'List of current medications',
                    t('emergency.checklist3') || 'Allergy information',
                    t('emergency.checklist4') || 'Medical insurance card',
                    t('emergency.checklist5') || 'ID or identification',
                    t('emergency.checklist6') || 'Address and location',
                  ].map((item, idx) => (
                    <ListItem key={idx}>
                      <ListItemIcon>
                        <AccessTime color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12}>
            <Card sx={{ bgcolor: 'warning.light' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  {t('emergency.quickActions') || 'Quick Actions'}
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
                  <Button
                    variant="contained"
                    color="error"
                    size="large"
                    startIcon={<Phone />}
                    onClick={() => handleCall('911')}
                    sx={{ fontWeight: 600 }}
                  >
                    {t('emergency.call911') || 'Call 911'}
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="large"
                    startIcon={<Phone />}
                    onClick={() => handleCall('907')}
                    sx={{ fontWeight: 600 }}
                  >
                    {t('emergency.call907') || 'Call 907 (Ambulance)'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    startIcon={<LocalHospital />}
                    onClick={() => navigate('/symptom-checker')}
                  >
                    {t('emergency.symptomChecker') || 'Symptom Checker'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    startIcon={<Info />}
                    onClick={() => navigate('/diseases')}
                  >
                    {t('emergency.diseaseInfo') || 'Disease Information'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

