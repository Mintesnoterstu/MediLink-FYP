import React from 'react';
import { Box, Button, Grid, MenuItem, TextField } from '@mui/material';

export interface RegisterPatientPayload {
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  kebeleIdNumber: string;
  idDocumentUpload?: string;
  email: string;
  phoneNumber?: string;
  woreda: string;
  kebele: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
}

const woredas = ['Jimma', 'Seka', 'Gera', 'Gomma', 'Mana', 'Limmu Kosa', 'Kersa', 'Dedo', 'Omo Nada', 'Sigimo'];

const initialForm: RegisterPatientPayload = {
  fullName: '',
  dateOfBirth: '',
  gender: 'male',
  kebeleIdNumber: '',
  idDocumentUpload: '',
  email: '',
  phoneNumber: '',
  woreda: 'Jimma',
  kebele: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelation: '',
};

interface Props {
  loading?: boolean;
  onCheckDuplicates: (payload: Pick<RegisterPatientPayload, 'kebeleIdNumber' | 'phoneNumber' | 'fullName' | 'dateOfBirth'>) => Promise<void>;
  onSubmit: (payload: RegisterPatientPayload) => Promise<void>;
}

export const RegisterPatientForm: React.FC<Props> = ({ loading = false, onCheckDuplicates, onSubmit }) => {
  const [form, setForm] = React.useState<RegisterPatientPayload>(initialForm);
  const setField = (key: keyof RegisterPatientPayload, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const normalizeEthiopianPhone = (value: string) => {
    const digits = String(value || '').replace(/\D/g, '');
    if (digits.startsWith('251') && digits.length === 12) {
      return `0${digits.slice(3)}`;
    }
    return digits;
  };

  const handleFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setField('idDocumentUpload', String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: RegisterPatientPayload = {
      ...form,
      phoneNumber: (normalizeEthiopianPhone(form.phoneNumber || '') || '').trim() || undefined,
      emergencyContactPhone: normalizeEthiopianPhone(form.emergencyContactPhone),
      email: (form.email || '').trim(),
      idDocumentUpload: (form.idDocumentUpload || '').trim() || undefined,
    };
    await onSubmit(payload);
    setForm(initialForm);
  };

  return (
    <Box component="form" onSubmit={submit}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}><TextField fullWidth required label="Full Name" value={form.fullName} onChange={(e) => setField('fullName', e.target.value)} /></Grid>
        <Grid item xs={12} md={3}><TextField fullWidth required type="date" label="Date of Birth" InputLabelProps={{ shrink: true }} value={form.dateOfBirth} onChange={(e) => setField('dateOfBirth', e.target.value)} /></Grid>
        <Grid item xs={12} md={3}>
          <TextField select fullWidth required label="Gender" value={form.gender} onChange={(e) => setField('gender', e.target.value)}>
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={6}><TextField fullWidth required label="Kebele ID Number" value={form.kebeleIdNumber} onChange={(e) => setField('kebeleIdNumber', e.target.value)} /></Grid>
        <Grid item xs={12} md={6}>
          <Button component="label" variant="outlined" fullWidth sx={{ height: 56 }}>
            Upload ID Document
            <input hidden type="file" accept=".pdf,image/*" onChange={(e) => handleFile(e.target.files?.[0])} />
          </Button>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            type="email"
            label="Email"
            value={form.email || ''}
            onChange={(e) => setField('email', e.target.value)}
            helperText="Credentials are sent via email only."
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Phone Number (Optional)"
            value={form.phoneNumber || ''}
            onChange={(e) => setField('phoneNumber', e.target.value)}
            helperText="Optional. Format: 09XXXXXXXX"
          />
        </Grid>
        <Grid item xs={12} md={3}><TextField fullWidth label="Region" value="Oromia" disabled /></Grid>
        <Grid item xs={12} md={3}><TextField fullWidth label="Zone" value="Jimma" disabled /></Grid>
        <Grid item xs={12} md={3}>
          <TextField select fullWidth required label="Woreda" value={form.woreda} onChange={(e) => setField('woreda', e.target.value)}>
            {woredas.map((w) => <MenuItem key={w} value={w}>{w}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} md={3}><TextField fullWidth required label="Kebele" value={form.kebele} onChange={(e) => setField('kebele', e.target.value)} /></Grid>
        <Grid item xs={12} md={4}><TextField fullWidth required label="Emergency Contact Name" value={form.emergencyContactName} onChange={(e) => setField('emergencyContactName', e.target.value)} /></Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            required
            label="Emergency Contact Phone"
            value={form.emergencyContactPhone}
            onChange={(e) => setField('emergencyContactPhone', e.target.value)}
            helperText="Format: 09XXXXXXXX"
          />
        </Grid>
        <Grid item xs={12} md={4}><TextField fullWidth required label="Emergency Contact Relation" value={form.emergencyContactRelation} onChange={(e) => setField('emergencyContactRelation', e.target.value)} /></Grid>
      </Grid>
      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          disabled={loading}
          onClick={() =>
            onCheckDuplicates({
              kebeleIdNumber: form.kebeleIdNumber,
              phoneNumber: form.phoneNumber,
              fullName: form.fullName,
              dateOfBirth: form.dateOfBirth,
            })
          }
        >
          Check For Duplicates
        </Button>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Registering...' : 'Register Patient'}
        </Button>
      </Box>
    </Box>
  );
};
