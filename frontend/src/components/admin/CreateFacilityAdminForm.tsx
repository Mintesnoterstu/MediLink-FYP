import React from 'react';
import { Box, Button, Grid, MenuItem, TextField } from '@mui/material';
import { useUI } from '@/contexts/UIContext';

export interface CreateFacilityAdminPayload {
  facilityName: string;
  facilityType: 'Hospital' | 'Health Center' | 'Clinic';
  licenseNumber: string;
  licenseDocument?: string;
  facilityAddress: string;
  facilityPhone: string;
  facilityEmail: string;
  adminFullName: string;
  adminEmail: string;
  recoveryEmail: string;
  adminPhone: string;
  officialTitle: string;
}

const initialForm: CreateFacilityAdminPayload = {
  facilityName: '',
  facilityType: 'Hospital',
  licenseNumber: '',
  licenseDocument: '',
  facilityAddress: '',
  facilityPhone: '',
  facilityEmail: '',
  adminFullName: '',
  adminEmail: '',
  recoveryEmail: '',
  adminPhone: '',
  officialTitle: '',
};

interface Props {
  loading?: boolean;
  onSubmit: (payload: CreateFacilityAdminPayload) => Promise<void>;
}

export const CreateFacilityAdminForm: React.FC<Props> = ({ loading = false, onSubmit }) => {
  const { language } = useUI();
  const isAmharic = language === 'am';
  const t = (en: string, am: string) => (isAmharic ? am : en);
  const [form, setForm] = React.useState<CreateFacilityAdminPayload>(initialForm);

  const setField = (key: keyof CreateFacilityAdminPayload, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = async (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setField('licenseDocument', String(reader.result || ''));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
    setForm(initialForm);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField fullWidth required label={t('Facility Name', 'የተቋም ስም')} value={form.facilityName} onChange={(e) => setField('facilityName', e.target.value)} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField select fullWidth required label={t('Facility Type', 'የተቋም አይነት')} value={form.facilityType} onChange={(e) => setField('facilityType', e.target.value)}>
            <MenuItem value="Hospital">Hospital</MenuItem>
            <MenuItem value="Health Center">Health Center</MenuItem>
            <MenuItem value="Clinic">Clinic</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth required label={t('License Number', 'የፈቃድ ቁጥር')} value={form.licenseNumber} onChange={(e) => setField('licenseNumber', e.target.value)} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Button component="label" variant="outlined" fullWidth sx={{ height: 56 }}>
            {t('Upload License Document', 'የፈቃድ ሰነድ ይጫኑ')}
            <input type="file" hidden accept=".pdf,image/*" onChange={(e) => handleFileChange(e.target.files?.[0])} />
          </Button>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth required label={t('Facility Address', 'የተቋም አድራሻ')} value={form.facilityAddress} onChange={(e) => setField('facilityAddress', e.target.value)} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth required label={t('Facility Phone', 'የተቋም ስልክ')} value={form.facilityPhone} onChange={(e) => setField('facilityPhone', e.target.value)} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField type="email" fullWidth required label={t('Facility Email', 'የተቋም ኢሜይል')} value={form.facilityEmail} onChange={(e) => setField('facilityEmail', e.target.value)} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth required label={t('Admin Full Name', 'የአስተዳዳሪ ሙሉ ስም')} value={form.adminFullName} onChange={(e) => setField('adminFullName', e.target.value)} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField type="email" fullWidth required label={t('Admin Email', 'የአስተዳዳሪ ኢሜይል')} value={form.adminEmail} onChange={(e) => setField('adminEmail', e.target.value)} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField type="email" fullWidth required label={t('Recovery Email', 'የመልሶ ማግኛ ኢሜይል')} value={form.recoveryEmail} onChange={(e) => setField('recoveryEmail', e.target.value)} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth required label={t('Admin Phone', 'የአስተዳዳሪ ስልክ')} value={form.adminPhone} onChange={(e) => setField('adminPhone', e.target.value)} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth required label={t('Official Title', 'የስራ መደብ')} value={form.officialTitle} onChange={(e) => setField('officialTitle', e.target.value)} />
        </Grid>
      </Grid>
      <Button sx={{ mt: 2 }} variant="contained" type="submit" disabled={loading}>
        {loading ? t('Creating...', 'በመፍጠር ላይ...') : t('Create Facility Admin', 'የተቋም አስተዳዳሪ ፍጠር')}
      </Button>
    </Box>
  );
};
