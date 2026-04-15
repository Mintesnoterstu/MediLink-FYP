import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Button,
  Chip,
} from '@mui/material';
import { Search, ExpandMore } from '@mui/icons-material';
import { useUI } from '@/contexts/UIContext';
import { useNavigate } from 'react-router-dom';

type HelpSection = {
  id: string;
  titleEn: string;
  titleAm: string;
  chips?: string[];
  contentEn: string[];
  contentAm: string[];
  quickLinks?: Array<{ labelEn: string; labelAm: string; path: string }>;
};

export const HelpPage: React.FC = () => {
  const { language } = useUI();
  const isAm = language === 'am';
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const sections: HelpSection[] = [
    {
      id: 'getting-started',
      titleEn: 'Getting Started',
      titleAm: 'መጀመሪያ መጀመር',
      chips: ['login', '2FA', 'register'],
      contentEn: [
        'Patients must register at a health facility (in-person ID verification).',
        'Use Login to access your role dashboard.',
        'Enable two-factor authentication (2FA) to protect your account.',
      ],
      contentAm: [
        'ታካሚዎች በጤና ተቋም ውስጥ በአካል ተገኝተው (መታወቂያ ማረጋገጥ) መመዝገብ አለባቸው።',
        'ወደ የሚናዎ ዳሽቦርድ ለመግባት ግባ (Login) ይጠቀሙ።',
        'መለያዎን ለመጠበቅ ሁለት-ደረጃ ማረጋገጫ (2FA) ያንቁ።',
      ],
    },
    {
      id: 'patients',
      titleEn: 'For Patients',
      titleAm: 'ለታካሚዎች',
      chips: ['consent', 'records', 'audit'],
      contentEn: [
        'View your medical records (read-only). You cannot edit medical data directly.',
        'Grant / revoke consent to doctors.',
        'See access history (who viewed your data and when).',
        'Approve or dispute changes made by doctors.',
        'Emergency mode: temporary access for urgent care (time-limited).',
        'If something is wrong, submit a correction request instead of editing.',
      ],
      contentAm: [
        'የሕክምና መዝገቦችዎን ለማየት ብቻ (read-only) ይችላሉ። መረጃውን በቀጥታ መቀየር አይችሉም።',
        'ለሐኪሞች ፈቃድ ይስጡ / ፈቃድ ያስወግዱ።',
        'የመዳረሻ ታሪክ ይመልከቱ (ማን መቼ እንደተመለከተ)።',
        'ሐኪሞች ያደረጉትን ለውጥ ያጽድቁ ወይም ይከራከሩ።',
        'ድንገተኛ ሁኔታ: ጊዜ-የተገደበ መዳረሻ ለአስቸኳይ እንክብካቤ።',
        'ትክክል ያልሆነ ነገር ካዩ መቀየር ሳይሆን “ማስተካከያ ጥያቄ” ያስገቡ።',
      ],
      quickLinks: [
        { labelEn: 'Go to My Records', labelAm: 'ወደ መዝገቦቼ', path: '/dashboard/records' },
        { labelEn: 'Go to Consent Management', labelAm: 'ወደ ፈቃድ አስተዳደር', path: '/dashboard/consent' },
        { labelEn: 'Go to Access History', labelAm: 'ወደ መዳረሻ ታሪክ', path: '/dashboard/access-history' },
      ],
    },
    {
      id: 'professionals',
      titleEn: 'For Health Professionals (Doctors/Nurses)',
      titleAm: 'ለጤና ባለሙያዎች (ሐኪሞች/ነርሶች)',
      chips: ['consent', 'records'],
      contentEn: [
        'You can only view patients who granted you active consent.',
        'Request consent when needed.',
        'Add diagnoses, prescriptions, lab orders, and clinical notes.',
        'Important: Any update may require patient approval (consent can be auto-revoked by policy).',
      ],
      contentAm: [
        'ንቁ ፈቃድ የሰጡዎትን ታካሚዎች ብቻ ማየት ይችላሉ።',
        'የሚያስፈልግ ጊዜ ፈቃድ ይጠይቁ።',
        'ምርመራ፣ መድሀኒት፣ ላብ ትዕዛዝ እና ክሊኒካል ማስታወሻ ያስገቡ።',
        'አስፈላጊ፡ ማንኛውም ዝማኔ የታካሚ ማጽደቅ ሊፈልግ ይችላል (ፖሊሲ ምክንያት ፈቃድ በራስ-ሰር ሊሻር ይችላል)።',
      ],
    },
    {
      id: 'admins',
      titleEn: 'For Administrators',
      titleAm: 'ለአስተዳዳሪዎች',
      chips: ['security', 'stats'],
      contentEn: [
        'No admin can view patient medical data. Dashboards show anonymous counts/statistics only.',
        'Facility admin: create doctor/nurse accounts and register patients in-person.',
        'Woreda/City admin: register facilities and create facility admins.',
        'Zonal admin: create woreda/city admins.',
      ],
      contentAm: [
        'ማንኛውም አስተዳዳሪ የታካሚ የሕክምና መረጃ ማየት አይችልም። ዳሽቦርድ የሚያሳየው ቁጥር/ስታቲስቲክስ ብቻ ነው።',
        'የተቋም አስተዳዳሪ: ሐኪም/ነርስ መለያዎችን መፍጠር እና ታካሚ በአካል መመዝገብ።',
        'የወረዳ/ከተማ አስተዳዳሪ: ተቋማትን መመዝገብ እና የተቋም አስተዳዳሪዎችን መፍጠር።',
        'የዞን አስተዳዳሪ: የወረዳ/ከተማ አስተዳዳሪዎችን መፍጠር።',
      ],
    },
    {
      id: 'faq-support',
      titleEn: 'FAQ & Support',
      titleAm: 'መልሶች እና ድጋፍ',
      chips: ['support'],
      contentEn: [
        'Emergency: call 907 (Ambulance).',
        'If you suspect unauthorized access, revoke consent immediately and report via your dashboard.',
        'For technical issues, contact support@medilink.et.',
      ],
      contentAm: [
        'ድንገተኛ: 907 ይደውሉ (አምቡላንስ)።',
        'ያልተፈቀደ መዳረሻ ካለ በፍጥነት ፈቃድ ያስወግዱ እና በዳሽቦርድ ይሪፖርቱ።',
        'ቴክኒካል ችግር ካለ support@medilink.et ያግኙ።',
      ],
    },
  ];

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return sections;
    return sections.filter((s) => {
      const hay = [
        s.titleEn,
        s.titleAm,
        ...(s.contentEn || []),
        ...(s.contentAm || []),
        ...(s.chips || []),
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [q, sections]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={900} gutterBottom>
        {isAm ? 'እርዳታ' : 'Help'} / {isAm ? 'Help' : 'እርዳታ'}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {isAm
          ? 'መመሪያዎች፣ መፍትሄዎች እና እርዳታ ለሁሉም ተጠቃሚዎች።'
          : 'Guides, troubleshooting, and usage instructions for all users.'}
      </Typography>

      <TextField
        fullWidth
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={isAm ? 'ፈልግ… (ምሳሌ፡ ፈቃድ, መዝገብ)' : 'Search… (e.g., consent, records)'}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      <Stack spacing={2}>
        {filtered.map((s) => (
          <Accordion key={s.id} defaultExpanded={s.id === 'patients'}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="h6" fontWeight={800}>
                  {isAm ? s.titleAm : s.titleEn}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  / {isAm ? s.titleEn : s.titleAm}
                </Typography>
                {s.chips?.slice(0, 3).map((c) => (
                  <Chip key={c} size="small" label={c} variant="outlined" />
                ))}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                {(isAm ? s.contentAm : s.contentEn).map((p, idx) => (
                  <Typography key={idx} variant="body2" sx={{ lineHeight: 1.8 }}>
                    • {p}
                  </Typography>
                ))}

                {s.quickLinks && s.quickLinks.length > 0 && (
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {s.quickLinks.map((l) => (
                      <Button
                        key={l.path}
                        variant="contained"
                        size="small"
                        onClick={() => navigate(l.path)}
                      >
                        {isAm ? l.labelAm : l.labelEn}
                      </Button>
                    ))}
                  </Box>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}

        {filtered.length === 0 && (
          <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="body1" fontWeight={700}>
              {isAm ? 'ምንም አልተገኘም' : 'No results found'} / {isAm ? 'No results found' : 'ምንም አልተገኘም'}
            </Typography>
          </Box>
        )}
      </Stack>
    </Container>
  );
};

