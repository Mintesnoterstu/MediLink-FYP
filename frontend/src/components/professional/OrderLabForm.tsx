import React from 'react';
import { Stack, TextField, Button } from '@mui/material';

interface OrderLabFormProps {
  onSave: (payload: Record<string, unknown>) => Promise<void> | void;
}

export const OrderLabForm: React.FC<OrderLabFormProps> = ({ onSave }) => {
  const [testName, setTestName] = React.useState('');
  const [priority, setPriority] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  const submit = async () => {
    if (!testName.trim()) return;
    setIsSaving(true);
    try {
      await onSave({
        test_name: testName.trim(),
        priority: priority.trim(),
        notes: notes.trim(),
      });
      setTestName('');
      setPriority('');
      setNotes('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Stack spacing={1}>
      <TextField fullWidth label="Lab Test Name" value={testName} onChange={(e) => setTestName(e.target.value)} />
      <TextField fullWidth label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)} />
      <TextField fullWidth multiline minRows={2} label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <Button variant="contained" onClick={submit} disabled={isSaving}>
        Order Lab
      </Button>
    </Stack>
  );
};

