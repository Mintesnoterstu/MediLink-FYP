import React from 'react';
import { Stack, TextField, Button } from '@mui/material';

interface AddPrescriptionFormProps {
  onSave: (payload: Record<string, unknown>) => Promise<void> | void;
}

export const AddPrescriptionForm: React.FC<AddPrescriptionFormProps> = ({ onSave }) => {
  const [medication, setMedication] = React.useState('');
  const [dosage, setDosage] = React.useState('');
  const [instructions, setInstructions] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  const submit = async () => {
    if (!medication.trim()) return;
    setIsSaving(true);
    try {
      await onSave({
        medication: medication.trim(),
        dosage: dosage.trim(),
        instructions: instructions.trim(),
      });
      setMedication('');
      setDosage('');
      setInstructions('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Stack spacing={1}>
      <TextField fullWidth label="Medication" value={medication} onChange={(e) => setMedication(e.target.value)} />
      <TextField fullWidth label="Dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} />
      <TextField
        fullWidth
        multiline
        minRows={2}
        label="Instructions"
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
      />
      <Button variant="contained" onClick={submit} disabled={isSaving}>
        Save Prescription
      </Button>
    </Stack>
  );
};

