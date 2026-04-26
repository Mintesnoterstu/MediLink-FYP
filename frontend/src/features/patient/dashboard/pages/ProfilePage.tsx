import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Divider,
  Stack,
  Chip,
  Switch,
  FormControlLabel,
  Alert,
} from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useUI } from '@/contexts/UIContext';
import { apiClient } from '@/services/apiClient';

export const ProfilePage: React.FC = () => {
  const { language, theme, toggleTheme } = useUI();
  const isAmharic = language === 'am';
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profile, setProfile] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/patient/me');
      setProfile(res.data || null);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const changePassword = async () => {
    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setMessage({ type: 'error', text: 'Please fill all password fields.' });
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match.' });
        return;
      }
      await apiClient.put('/patient/change-password', { currentPassword, newPassword });
      setMessage({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.response?.data?.error || 'Failed to change password.' });
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        {isAmharic ? 'መገለጫ እና ቅንብሮች' : 'PROFILE & SETTINGS'}
      </Typography>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            {isAmharic ? 'የትምህርት ሁነታ' : 'Appearance'}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Brightness4 fontSize="small" />
            <FormControlLabel
              control={
                <Switch
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                  color="primary"
                />
              }
              label={isAmharic ? (theme === 'dark' ? 'ጨለማ' : 'ብርሃን') : (theme === 'dark' ? 'Dark' : 'Light')}
            />
            <Brightness7 fontSize="small" />
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            {isAmharic ? 'የግል መረጃ (ለእይታ ብቻ)' : 'Personal Information (View only)'}
          </Typography>
          {loading ? <Alert severity="info" sx={{ mb: 1 }}>{isAmharic ? 'በመጫን ላይ...' : 'Loading...'}</Alert> : null}
          <Typography variant="body2" color="text.secondary">
            {isAmharic
              ? 'ታካሚዎች የግል መረጃቸውን በቀጥታ ማስተካከል አይችሉም። ማስተካከያ ለመጠየቅ ከፋሲሊቲ አድሚን ጋር ያነጋግሩ።'
              : 'Patients cannot edit personal information directly. Contact your facility admin to request corrections.'}
          </Typography>
          {profile ? (
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>{isAmharic ? 'ስም፡ ' : 'Name: '}</strong>{profile.fullName || '-'}
              {' · '}
              <strong>{isAmharic ? 'መታወቂያ፡ ' : 'Health ID: '}</strong>{profile.ethiopianHealthId || '-'}
            </Typography>
          ) : null}
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            {isAmharic ? 'የድንገተኛ አደጋ መጠናኛ' : 'Emergency Contact'}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{isAmharic ? 'መስክ' : 'Field'}</TableCell>
                <TableCell>{isAmharic ? 'አሁን ያለው ዋጋ' : 'Current Value'}</TableCell>
                <TableCell>{isAmharic ? 'እርምጃ' : 'Action'}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(() => {
                const ec = profile?.encryptedData?.emergencyContact || profile?.encryptedData?.emergency_contact || null;
                const name = ec?.name || '-';
                const relation = ec?.relation || '-';
                const phone = ec?.phone || '-';
                const rows = [
                  { enField: 'Name', amField: 'ስም', value: name },
                  { enField: 'Relationship', amField: 'ዝምድና', value: relation },
                  { enField: 'Phone', amField: 'ስልክ', value: phone },
                ];
                return rows;
              })().map((r) => (
                <TableRow key={r.enField}>
                  <TableCell>{isAmharic ? r.amField : r.enField}</TableCell>
                  <TableCell>{r.value}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() =>
                        setMessage({
                          type: 'error',
                          text: isAmharic
                            ? 'ማስተካከያ ለመጠየቅ ከፋሲሊቲ አድሚን ጋር ያነጋግሩ።'
                            : 'Contact your facility admin to request updates.',
                        })
                      }
                    >
                      {isAmharic ? 'አዘምን' : 'Update'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            {isAmharic ? 'የይለፍ ቃል ለውጥ' : 'Change Password'}
          </Typography>
          <Stack spacing={1}>
            {message ? (
              <Typography color={message.type === 'error' ? 'error.main' : 'success.main'} variant="body2">
                {message.text}
              </Typography>
            ) : null}
            <input
              type="password"
              placeholder={isAmharic ? 'የአሁኑ የይለፍ ቃል' : 'Current password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
            />
            <input
              type="password"
              placeholder={isAmharic ? 'አዲስ የይለፍ ቃል' : 'New password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
            />
            <input
              type="password"
              placeholder={isAmharic ? 'አዲስ የይለፍ ቃል ያረጋግጡ' : 'Confirm new password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
            />
            <Button variant="contained" onClick={changePassword}>
              {isAmharic ? 'የይለፍ ቃል ቀይር' : 'Change Password'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            {isAmharic ? 'የድንገተኛ ቅንብሮች' : 'Emergency Settings'}
          </Typography>
          <Stack spacing={1}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">
                {isAmharic
                  ? 'የድንገተኛ መዳረሻ ሁነታ — በድንገተኛ አደጋ ጊዜ ማንኛውም ሐኪም ለ24 ሰዓት አስፈላጊ መረጃዎን እንዲያይ ይፈቅዳል።'
                  : 'Emergency Access Mode — Allows ANY doctor to see your critical information for 24 hours.'}
              </Typography>
              <Chip label={(profile?.isEmergencyFlag ? (isAmharic ? 'በሥራ ላይ' : 'ON') : (isAmharic ? 'ጠፍቷል' : 'OFF'))} />
              <Button
                size="small"
                variant="contained"
                onClick={async () => {
                  try {
                    if (!profile?.id) return;
                    await apiClient.patch(`/patient/${profile.id}`, { isEmergencyFlag: !Boolean(profile.isEmergencyFlag) });
                    await load();
                    setMessage({
                      type: 'success',
                      text: isAmharic ? 'ተቀይሯል።' : 'Updated.',
                    });
                  } catch (e: any) {
                    setMessage({
                      type: 'error',
                      text: e?.response?.data?.error || (isAmharic ? 'ማዘመን አልተሳካም።' : 'Failed to update.'),
                    });
                  }
                }}
              >
                {profile?.isEmergencyFlag ? (isAmharic ? 'አጥፋ' : 'DEACTIVATE') : (isAmharic ? 'አንቃ' : 'ACTIVATE')}
              </Button>
            </Box>
            <Divider />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">
                {isAmharic
                  ? `የድንገተኛ አደጋ መጠናኛ — ${profile?.encryptedData?.emergencyContact?.name || '-'} - ${profile?.encryptedData?.emergencyContact?.phone || '-'}`
                  : `Emergency Contact — ${profile?.encryptedData?.emergencyContact?.name || '-'} - ${profile?.encryptedData?.emergencyContact?.phone || '-'}`}
              </Typography>
              <Button size="small">
                {isAmharic ? 'አዘምን' : 'Update'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Typography variant="body2" color="text.secondary">
        {isAmharic
          ? 'ማሳሰቢያ: ታካሚዎች የግል ወይም የሕክምና መረጃን ማስተካከል አይችሉም።'
          : 'Note: patients cannot edit personal or medical information.'}
      </Typography>
    </Box>
  );
};

