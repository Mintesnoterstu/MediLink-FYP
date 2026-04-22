import React from 'react';
import { Stack, TextField, Button } from '@mui/material';

interface AddDiagnosisFormProps {
  onSave: (payload: Record<string, unknown>) => Promise<void> | void;
}

export const AddDiagnosisForm: React.FC<AddDiagnosisFormProps> = ({ onSave }) => {
  const [diagnosis, setDiagnosis] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  const submit = async () => {
    if (!diagnosis.trim()) return;
    setIsSaving(true);
    try {
      await onSave({
        diagnosis: diagnosis.trim(),
        notes: notes.trim(),
      });
      setDiagnosis('');
      setNotes('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Stack spacing={1}>
      <TextField
        fullWidth
        label="Diagnosis"
        value={diagnosis}
        onChange={(e) => setDiagnosis(e.target.value)}
      />
      <TextField
        fullWidth
        multiline
        minRows={2}
        label="Clinical Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <Button variant="contained" onClick={submit} disabled={isSaving}>
        Save Diagnosis
      </Button>
    </Stack>
  );
};

