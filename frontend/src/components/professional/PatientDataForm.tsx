import React from 'react';
import { Box, Tabs, Tab, Button, Stack, Alert } from '@mui/material';
import { VitalSignsForm } from './VitalSignsForm';
import { SymptomsForm } from './SymptomsForm';
import { PhysicalExamForm } from './PhysicalExamForm';
import { DiagnosisForm } from './DiagnosisForm';
import { LabOrderForm } from './LabOrderForm';
import { PrescriptionForm } from './PrescriptionForm';
import { TreatmentPlanForm } from './TreatmentPlanForm';
import { ClinicalNotesForm } from './ClinicalNotesForm';
import { professionalDataService } from '@/features/professional/services/professionalDataService';

interface PatientDataFormProps {
  patientId: string;
  onSaved: (message?: string) => void;
}

export const PatientDataForm: React.FC<PatientDataFormProps> = ({ patientId, onSaved }) => {
  const [tab, setTab] = React.useState(0);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [form, setForm] = React.useState<Record<string, Record<string, any>>>({
    vitals: {},
    symptoms: {},
    examination: {},
    diagnosis: {},
    lab_order: {},
    prescription: {},
    treatment_plan: {},
    clinical_note: {},
  });

  const hasValues = (obj: Record<string, any>) => Object.values(obj || {}).some((v) => String(v ?? '').trim() !== '');

  const saveSection = async (section: keyof typeof form) => {
    try {
      setSaving(true);
      setError('');
      const payload = form[section];
      if (!hasValues(payload)) {
        setError('This section is empty. Add at least one field.');
        return;
      }
      if (section === 'vitals') await professionalDataService.saveVitals(patientId, payload);
      else if (section === 'symptoms') await professionalDataService.saveSymptoms(patientId, payload);
      else if (section === 'examination') await professionalDataService.saveExamination(patientId, payload);
      else if (section === 'diagnosis') await professionalDataService.addDiagnosis(patientId, payload);
      else if (section === 'lab_order') await professionalDataService.orderLab(patientId, payload);
      else if (section === 'prescription') await professionalDataService.addPrescription(patientId, payload);
      else if (section === 'treatment_plan') await professionalDataService.saveTreatment(patientId, payload);
      else if (section === 'clinical_note') await professionalDataService.saveClinicalNotes(patientId, payload);
      onSaved('Section saved. Consent is auto-revoked until patient approves.');
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to save section');
    } finally {
      setSaving(false);
    }
  };

  const saveAll = async () => {
    try {
      setSaving(true);
      setError('');
      const nonEmpty = Object.fromEntries(Object.entries(form).filter(([, v]) => hasValues(v)));
      if (Object.keys(nonEmpty).length === 0) {
        setError('All sections are empty.');
        return;
      }
      await professionalDataService.saveCompletePatientData(patientId, nonEmpty);
      onSaved('Saved successfully. Consent is auto-revoked until patient approves.');
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { key: 'vitals', label: 'Vitals' },
    { key: 'symptoms', label: 'History' },
    { key: 'examination', label: 'Examination' },
    { key: 'diagnosis', label: 'Diagnosis' },
    { key: 'lab_order', label: 'Labs' },
    { key: 'prescription', label: 'Medications' },
    { key: 'treatment_plan', label: 'Treatment' },
    { key: 'clinical_note', label: 'Notes' },
  ] as const;

  const current = tabs[tab].key;

  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" allowScrollButtonsMobile>
        {tabs.map((t) => <Tab key={t.key} label={t.label} />)}
      </Tabs>
      <Box sx={{ mt: 2 }}>
        {current === 'vitals' && <VitalSignsForm value={form.vitals} onChange={(next) => setForm((p) => ({ ...p, vitals: next }))} />}
        {current === 'symptoms' && <SymptomsForm value={form.symptoms} onChange={(next) => setForm((p) => ({ ...p, symptoms: next }))} />}
        {current === 'examination' && <PhysicalExamForm value={form.examination} onChange={(next) => setForm((p) => ({ ...p, examination: next }))} />}
        {current === 'diagnosis' && <DiagnosisForm value={form.diagnosis} onChange={(next) => setForm((p) => ({ ...p, diagnosis: next }))} />}
        {current === 'lab_order' && <LabOrderForm value={form.lab_order} onChange={(next) => setForm((p) => ({ ...p, lab_order: next }))} />}
        {current === 'prescription' && <PrescriptionForm value={form.prescription} onChange={(next) => setForm((p) => ({ ...p, prescription: next }))} />}
        {current === 'treatment_plan' && <TreatmentPlanForm value={form.treatment_plan} onChange={(next) => setForm((p) => ({ ...p, treatment_plan: next }))} />}
        {current === 'clinical_note' && <ClinicalNotesForm value={form.clinical_note} onChange={(next) => setForm((p) => ({ ...p, clinical_note: next }))} />}
      </Box>

      {error ? <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert> : null}
      <Alert severity="warning" sx={{ mt: 2 }}>
        Any save action revokes consent until patient approves changes.
      </Alert>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mt: 2 }}>
        <Button variant="contained" onClick={() => saveSection(current)} disabled={saving}>Save & Continue</Button>
        <Button variant="outlined" onClick={saveAll} disabled={saving}>Save All</Button>
      </Stack>
    </Box>
  );
};

