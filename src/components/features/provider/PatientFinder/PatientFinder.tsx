import React, { useState, useMemo } from 'react';
import { Box, Typography, TextField, List, ListItem, ListItemText, Chip, Avatar, InputAdornment, Card, CardContent } from '@mui/material';
import { Search, Person, Medication, Warning } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { HealthCard } from '@/components/ui';
import { PatientData, ConsentRecord } from '@/types';

interface PatientFinderProps {
  patients?: PatientData[];
  onPatientSelect?: (patient: PatientData) => void;
  searchPlaceholder?: string;
}

export const PatientFinder: React.FC<PatientFinderProps> = ({
  patients = [],
  onPatientSelect,
  searchPlaceholder,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    
    const query = searchQuery.toLowerCase();
    return patients.filter((patient) => {
      const idMatch = patient.id.toLowerCase().includes(query);
      const userIdMatch = patient.userId.toLowerCase().includes(query);
      const medicationMatch = patient.currentMedications.some((med) =>
        med.name.toLowerCase().includes(query)
      );
      const allergyMatch = patient.allergies.some((allergy) =>
        allergy.allergen.toLowerCase().includes(query)
      );
      
      return idMatch || userIdMatch || medicationMatch || allergyMatch;
    });
  }, [patients, searchQuery]);

  const handlePatientClick = (patient: PatientData) => {
    setSelectedPatient(patient);
    onPatientSelect?.(patient);
  };

  const hasActiveConsent = (patient: PatientData): boolean => {
    if (!patient.consentRecords || patient.consentRecords.length === 0) return false;
    const now = new Date();
    return patient.consentRecords.some((consent: ConsentRecord) => {
      if (consent.revokedAt) return false;
      if (consent.expiresAt) {
        return new Date(consent.expiresAt) > now;
      }
      return true;
    });
  };

  return (
    <Box>
      <HealthCard title={t('provider.findPatient')} icon={<Search color="primary" />}>
        <TextField
          fullWidth
          placeholder={searchPlaceholder || t('provider.searchPatients')}
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

        {filteredPatients.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
            {searchQuery ? t('provider.noPatientsFound') : t('provider.noPatients')}
          </Typography>
        ) : (
          <List>
            {filteredPatients.map((patient) => {
              const hasConsent = hasActiveConsent(patient);
              return (
                <ListItem
                  key={patient.id}
                  button
                  onClick={() => handlePatientClick(patient)}
                  sx={{
                    mb: 1,
                    bgcolor: selectedPatient?.id === patient.id ? 'primary.light' : 'background.default',
                    borderRadius: 1,
                    border: selectedPatient?.id === patient.id ? '2px solid' : 'none',
                    borderColor: 'primary.main',
                  }}
                >
                  <Avatar sx={{ mr: 2, bgcolor: hasConsent ? 'success.main' : 'warning.main' }}>
                    <Person />
                  </Avatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Patient ID: {patient.id.slice(0, 8)}
                        </Typography>
                        {hasConsent ? (
                          <Chip label={t('provider.hasConsent')} size="small" color="success" />
                        ) : (
                          <Chip label={t('provider.noConsent')} size="small" color="warning" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {t('provider.age')}: {patient.age} | {t('provider.gender')}: {patient.gender}
                        </Typography>
                        <Box display="flex" gap={1} mt={0.5}>
                          <Chip
                            icon={<Medication />}
                            label={`${patient.currentMedications.length} ${t('provider.medications')}`}
                            size="small"
                          />
                          {patient.allergies.length > 0 && (
                            <Chip
                              icon={<Warning />}
                              label={`${patient.allergies.length} ${t('provider.allergies')}`}
                              size="small"
                              color="error"
                            />
                          )}
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </HealthCard>

      {selectedPatient && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('provider.selectedPatient')}
            </Typography>
            <Typography variant="body2">
              <strong>{t('provider.patientId')}:</strong> {selectedPatient.id}
            </Typography>
            <Typography variant="body2">
              <strong>{t('provider.age')}:</strong> {selectedPatient.age}
            </Typography>
            <Typography variant="body2">
              <strong>{t('provider.gender')}:</strong> {selectedPatient.gender}
            </Typography>
            <Typography variant="body2" mt={1}>
              <strong>{t('provider.currentMedications')}:</strong>{' '}
              {selectedPatient.currentMedications.length > 0
                ? selectedPatient.currentMedications.map((m) => m.name).join(', ')
                : t('provider.none')}
            </Typography>
            <Typography variant="body2">
              <strong>{t('provider.allergies')}:</strong>{' '}
              {selectedPatient.allergies.length > 0
                ? selectedPatient.allergies.map((a) => a.allergen).join(', ')
                : t('provider.none')}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
