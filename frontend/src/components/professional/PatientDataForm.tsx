import React from 'react';
import {
  Alert,
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { professionalDataService } from '@/features/professional/services/professionalDataService';
import { useUI } from '@/contexts/UIContext';

interface PatientDataFormProps {
  patientId: string;
  onSaved: (message?: string) => void;
}

type Attachment = { name: string; type: string; dataUrl: string };

export const PatientDataForm: React.FC<PatientDataFormProps> = ({ patientId, onSaved }) => {
  const { language } = useUI();
  const isAmharic = language === 'am';
  const t = (en: string, am: string) => (isAmharic ? am : en);
  const [tab, setTab] = React.useState(0);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const [form, setForm] = React.useState({
    subjective: {
      chiefComplaint: '',
      historyOfPresentIllness: '',
      symptomSeverity: '',
      symptomDuration: '',
      reviewOfSystems: '',
    },
    objective: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      physicalExamination: '',
      labResults: '',
    },
    assessment: {
      primaryDiagnosis: '',
      differentialDiagnoses: '',
      diagnosisNotes: '',
      icd11Code: '',
    },
    plan: {
      treatmentPlan: '',
      medicationsPrescribed: '',
      labTestsOrdered: '',
      followUpRequired: 'no',
      followUpDate: '',
      referral: '',
      patientInstructions: '',
    },
  });

  const nonEmpty = (v: unknown) => String(v ?? '').trim() !== '';
  const getFirstMissingRequiredField = () => {
    if (!nonEmpty(form.subjective.chiefComplaint)) {
      return { tab: 0, label: 'Chief Complaint' };
    }
    if (!nonEmpty(form.subjective.historyOfPresentIllness)) {
      return { tab: 0, label: 'History of Present Illness' };
    }
    if (!nonEmpty(form.assessment.primaryDiagnosis)) {
      return { tab: 2, label: 'Primary Diagnosis' };
    }
    if (!nonEmpty(form.plan.treatmentPlan)) {
      return { tab: 3, label: 'Treatment Plan' };
    }
    return null;
  };

  const onFilesSelected = async (evt: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(evt.target.files || []);
    const valid = files.filter((f) => ['image/jpeg', 'image/png', 'application/pdf'].includes(f.type));
    const converted = await Promise.all(
      valid.map(
        (file) =>
          new Promise<Attachment>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ name: file.name, type: file.type, dataUrl: String(reader.result || '') });
            reader.onerror = reject;
            reader.readAsDataURL(file);
          }),
      ),
    );
    setAttachments((prev) => [...prev, ...converted].slice(0, 5));
    evt.target.value = '';
  };

  const saveAll = async () => {
    try {
      setSaving(true);
      setError('');
      const missing = getFirstMissingRequiredField();
      if (missing) {
        setTab(missing.tab);
        setError(
          isAmharic
            ? `የሚያስፈልግ መስክ አልተሞላም፡ ${missing.label}`
            : `Required field missing: ${missing.label}`,
        );
        return;
      }
      await professionalDataService.saveCompletePatientData(patientId, {
        subjective: form.subjective,
        objective: form.objective,
        assessment: form.assessment,
        plan: form.plan,
        attachments,
      });
      onSaved(
        isAmharic
          ? 'የSOAP መዝገብ ተቀምጧል። ታካሚው እስኪያጸድቅ ድረስ ፈቃድ በራስ-ሰር ይሰረዛል።'
          : 'SOAP note saved. Consent is auto-revoked until patient approves.',
      );
    } catch (e: any) {
      setError(e?.response?.data?.error || t('Failed to save SOAP note', 'የSOAP መዝገብ ማስቀመጥ አልተሳካም'));
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { key: 'subjective', label: t('Subjective', 'ታካሚው የሚናገረው') },
    { key: 'objective', label: t('Objective', 'የሐኪም ምልከታ') },
    { key: 'assessment', label: t('Assessment', 'ምርመራ') },
    { key: 'plan', label: t('Plan', 'እቅድ') },
    { key: 'summary', label: t('Summary', 'ማጠቃለያ') },
  ] as const;

  const current = tabs[tab].key;

  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" allowScrollButtonsMobile>
        {tabs.map((t) => <Tab key={t.key} label={t.label} />)}
      </Tabs>
      <Box sx={{ mt: 2 }}>
        {current === 'subjective' && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField label={t('Chief Complaint *', 'ዋና ቅሬታ *')} fullWidth multiline minRows={2} value={form.subjective.chiefComplaint} onChange={(e) => setForm((p) => ({ ...p, subjective: { ...p.subjective, chiefComplaint: e.target.value } }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField label={t('History of Present Illness *', 'የአሁኑ ሕመም ታሪክ *')} fullWidth multiline minRows={3} value={form.subjective.historyOfPresentIllness} onChange={(e) => setForm((p) => ({ ...p, subjective: { ...p.subjective, historyOfPresentIllness: e.target.value } }))} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField select label={t('Symptom Severity (1-10)', 'የምልክት ክብደት (1-10)')} fullWidth value={form.subjective.symptomSeverity} onChange={(e) => setForm((p) => ({ ...p, subjective: { ...p.subjective, symptomSeverity: e.target.value } }))}>
                {Array.from({ length: 10 }, (_, i) => <MenuItem key={i + 1} value={String(i + 1)}>{i + 1}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField label={t('Symptom Duration', 'የምልክት ቆይታ')} fullWidth value={form.subjective.symptomDuration} onChange={(e) => setForm((p) => ({ ...p, subjective: { ...p.subjective, symptomDuration: e.target.value } }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField label={t('Review of Systems', 'የሰውነት ስርዓት ግምገማ')} fullWidth multiline minRows={2} value={form.subjective.reviewOfSystems} onChange={(e) => setForm((p) => ({ ...p, subjective: { ...p.subjective, reviewOfSystems: e.target.value } }))} />
            </Grid>
          </Grid>
        )}

        {current === 'objective' && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><TextField label={t('Blood Pressure', 'የደም ግፊት')} fullWidth value={form.objective.bloodPressure} onChange={(e) => setForm((p) => ({ ...p, objective: { ...p.objective, bloodPressure: e.target.value } }))} /></Grid>
            <Grid item xs={12} md={4}><TextField label={t('Heart Rate', 'የልብ ምት')} fullWidth type="number" value={form.objective.heartRate} onChange={(e) => setForm((p) => ({ ...p, objective: { ...p.objective, heartRate: e.target.value } }))} /></Grid>
            <Grid item xs={12} md={4}><TextField label={t('Temperature (C)', 'የሙቀት መጠን (C)')} fullWidth type="number" value={form.objective.temperature} onChange={(e) => setForm((p) => ({ ...p, objective: { ...p.objective, temperature: e.target.value } }))} /></Grid>
            <Grid item xs={12} md={6}><TextField label={t('Respiratory Rate', 'የመተንፈሻ መጠን')} fullWidth type="number" value={form.objective.respiratoryRate} onChange={(e) => setForm((p) => ({ ...p, objective: { ...p.objective, respiratoryRate: e.target.value } }))} /></Grid>
            <Grid item xs={12} md={6}><TextField label={t('Oxygen Saturation (%)', 'የኦክሲጅን መጠን (%)')} fullWidth type="number" value={form.objective.oxygenSaturation} onChange={(e) => setForm((p) => ({ ...p, objective: { ...p.objective, oxygenSaturation: e.target.value } }))} /></Grid>
            <Grid item xs={12}><TextField label={t('Physical Examination', 'አካላዊ ምርመራ')} fullWidth multiline minRows={3} value={form.objective.physicalExamination} onChange={(e) => setForm((p) => ({ ...p, objective: { ...p.objective, physicalExamination: e.target.value } }))} /></Grid>
            <Grid item xs={12}><TextField label={t('Lab Results', 'የላብ ውጤቶች')} fullWidth multiline minRows={3} value={form.objective.labResults} onChange={(e) => setForm((p) => ({ ...p, objective: { ...p.objective, labResults: e.target.value } }))} /></Grid>
          </Grid>
        )}

        {current === 'assessment' && (
          <Grid container spacing={2}>
            <Grid item xs={12}><TextField label={t('Primary Diagnosis *', 'ዋና ምርመራ *')} fullWidth value={form.assessment.primaryDiagnosis} onChange={(e) => setForm((p) => ({ ...p, assessment: { ...p.assessment, primaryDiagnosis: e.target.value } }))} /></Grid>
            <Grid item xs={12}><TextField label={t('Differential Diagnoses', 'ተጨማሪ የሚታሰቡ ምርመራዎች')} fullWidth multiline minRows={2} value={form.assessment.differentialDiagnoses} onChange={(e) => setForm((p) => ({ ...p, assessment: { ...p.assessment, differentialDiagnoses: e.target.value } }))} /></Grid>
            <Grid item xs={12}><TextField label={t('Diagnosis Notes', 'የምርመራ ማስታወሻ')} fullWidth multiline minRows={3} value={form.assessment.diagnosisNotes} onChange={(e) => setForm((p) => ({ ...p, assessment: { ...p.assessment, diagnosisNotes: e.target.value } }))} /></Grid>
            <Grid item xs={12} md={6}><TextField label={t('ICD-11 Code', 'ICD-11 ኮድ')} fullWidth value={form.assessment.icd11Code} onChange={(e) => setForm((p) => ({ ...p, assessment: { ...p.assessment, icd11Code: e.target.value } }))} /></Grid>
          </Grid>
        )}

        {current === 'plan' && (
          <Grid container spacing={2}>
            <Grid item xs={12}><TextField label={t('Treatment Plan *', 'የሕክምና እቅድ *')} fullWidth multiline minRows={3} value={form.plan.treatmentPlan} onChange={(e) => setForm((p) => ({ ...p, plan: { ...p.plan, treatmentPlan: e.target.value } }))} /></Grid>
            <Grid item xs={12}><TextField label={t('Medications Prescribed', 'የታዘዙ መድሀኒቶች')} fullWidth multiline minRows={2} value={form.plan.medicationsPrescribed} onChange={(e) => setForm((p) => ({ ...p, plan: { ...p.plan, medicationsPrescribed: e.target.value } }))} /></Grid>
            <Grid item xs={12}><TextField label={t('Lab Tests Ordered', 'የታዘዙ የላብ ምርመራዎች')} fullWidth multiline minRows={2} value={form.plan.labTestsOrdered} onChange={(e) => setForm((p) => ({ ...p, plan: { ...p.plan, labTestsOrdered: e.target.value } }))} /></Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>{t('Follow-up Required', 'ክትትል ያስፈልጋል')}</InputLabel>
                <Select label={t('Follow-up Required', 'ክትትል ያስፈልጋል')} value={form.plan.followUpRequired} onChange={(e) => setForm((p) => ({ ...p, plan: { ...p.plan, followUpRequired: String(e.target.value) } }))}>
                  <MenuItem value="yes">{t('Yes', 'አዎ')}</MenuItem>
                  <MenuItem value="no">{t('No', 'አይ')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}><TextField label={t('Follow-up Date', 'የክትትል ቀን')} type="date" fullWidth InputLabelProps={{ shrink: true }} disabled={form.plan.followUpRequired !== 'yes'} value={form.plan.followUpDate} onChange={(e) => setForm((p) => ({ ...p, plan: { ...p.plan, followUpDate: e.target.value } }))} /></Grid>
            <Grid item xs={12} md={4}><TextField label={t('Referral', 'ሪፈራል')} fullWidth value={form.plan.referral} onChange={(e) => setForm((p) => ({ ...p, plan: { ...p.plan, referral: e.target.value } }))} /></Grid>
            <Grid item xs={12}><TextField label={t('Patient Instructions', 'ለታካሚ መመሪያ')} fullWidth multiline minRows={3} value={form.plan.patientInstructions} onChange={(e) => setForm((p) => ({ ...p, plan: { ...p.plan, patientInstructions: e.target.value } }))} /></Grid>
          </Grid>
        )}

        {current === 'summary' && (
          <Stack spacing={1.5}>
            <Typography variant="subtitle2" fontWeight={700}>{t('SOAP Summary', 'የSOAP ማጠቃለያ')}</Typography>
            <Typography variant="body2"><strong>{t('Chief Complaint', 'ዋና ቅሬታ')}:</strong> {form.subjective.chiefComplaint || '-'}</Typography>
            <Typography variant="body2"><strong>{t('Primary Diagnosis', 'ዋና ምርመራ')}:</strong> {form.assessment.primaryDiagnosis || '-'}</Typography>
            <Typography variant="body2"><strong>{t('Treatment Plan', 'የሕክምና እቅድ')}:</strong> {form.plan.treatmentPlan || '-'}</Typography>
            <Typography variant="body2"><strong>{t('Attachments', 'አባሪ ፋይሎች')}:</strong> {attachments.length}</Typography>
          </Stack>
        )}
      </Box>

      {error ? <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert> : null}
      <Alert severity="warning" sx={{ mt: 2 }}>
        {t(
          'Any save action revokes consent until patient approves.',
          'ማንኛውም ማስቀመጥ እርምጃ ታካሚው እስኪያጸድቅ ድረስ ፈቃድን ይሰርዛል።',
        )}
      </Alert>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mt: 2 }}>
        <Button variant="outlined" component="label">
          {t('Attach JPG/PNG/PDF', 'JPG/PNG/PDF ያያይዙ')}
          <input hidden type="file" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={onFilesSelected} />
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
          {attachments.length > 0 ? attachments.map((a) => a.name).join(', ') : t('No attachments selected', 'ምንም አባሪ አልተመረጠም')}
        </Typography>
      </Stack>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mt: 2 }}>
        <Button variant="contained" onClick={saveAll} disabled={saving}>{t('Save All', 'ሁሉንም አስቀምጥ')}</Button>
      </Stack>
    </Box>
  );
};
