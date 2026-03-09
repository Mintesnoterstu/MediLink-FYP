import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Container,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Storage,
  LocalHospital,
  People,
  Assignment,
  Security,
  ContactMail,
} from '@mui/icons-material';
import { useUI } from '@/contexts/UIContext';

export const AboutPage: React.FC = () => {
  const { language } = useUI();
  const isAmharic = language === 'am';

  const hero = {
    title: { en: 'About MediLink', am: 'ስለ ሜድሊንክ' },
    subtitle: {
      en: 'A secure health platform for patients, doctors, and administrators',
      am: 'ለታካሚዎች፣ ለሐኪሞች እና ለአስተዳዳሪዎች ደህንነቱ የተጠበቀ የጤና መድረክ',
    },
  };

  const whatIs = {
    en: 'MediLink is a digital health platform that connects patients with healthcare providers. It gives patients control over their medical data through a consent-based system. Every access is logged and visible to patients.',
    am: 'ሜድሊንክ ታካሚዎችን ከጤና ባለሙያዎች ጋር የሚያገናኝ ዲጂታል የጤና መድረክ ነው። በፈቃድ ላይ በተመሠረተ ሥርዓት ታካሚዎች የሕክምና መረጃቸውን እንዲቆጣጠሩ ያስችላቸዋል። እያንዳንዱ መዳረሻ ተመዝግቦ ለታካሚዎች ይታያል።',
  };

  const howItWorks = [
    {
      step: { en: 'Step 1: Register at a Facility', am: 'ደረጃ 1: በተቋም መመዝገብ' },
      text: {
        en: 'Visit any health facility with your ID. Facility staff will register you in-person and create your account.',
        am: 'በመታወቂያዎ ወደ ማንኛውም የጤና ተቋም ይሂዱ። የተቋሙ ሠራተኞች በአካል ይመዘግቡዎታል እና መለያዎን ይፈጥራሉ።',
      },
    },
    {
      step: { en: 'Step 2: Receive Ethiopian Health ID', am: 'ደረጃ 2: የኢትዮጵያ የጤና መታወቂያ መቀበል' },
      text: {
        en: 'You get a unique Ethiopian Health ID. You can now log in and view your medical records (view only - you cannot edit them).',
        am: 'ልዩ የኢትዮጵያ የጤና መታወቂያ ይሰጥዎታል። አሁን መግባት እና የሕክምና መዝገቦችዎን ማየት ይችላሉ (ለማየት ብቻ - ማርትዕ አይችሉም)።',
      },
    },
    {
      step: { en: 'Step 3: Control Your Data', am: 'ደረጃ 3: መረጃዎን ይቆጣጠሩ' },
      text: {
        en: 'Grant or revoke consent to doctors. See who viewed your data. Approve or dispute any changes made by doctors.',
        am: 'ለሐኪሞች ፈቃድ ይስጡ ወይም ይሻሩ። ማን መረጃዎን እንደተመለከተ ይመልከቱ። በሐኪሞች የተደረጉ ማናቸውንም ለውጦች ያጽድቁ ወይም ይቃወሙ።',
      },
    },
  ];

  const keyFeatures = [
    {
      title: { en: 'Patient-Controlled Consent', am: 'በታካሚ የሚቆጣጠረ ፈቃድ' },
      text: {
        en: 'You decide which doctors can see your data. Grant or revoke access anytime.',
        am: 'የትኞቹ ሐኪሞች መረጃዎን ማየት እንደሚችሉ እርስዎ ይወስናሉ። በማንኛውም ጊዜ ፈቃድ ይስጡ ወይም ይሻሩ።',
      },
    },
    {
      title: { en: 'Auto-Revoke Security', am: 'ራስ-ሰር የፈቃድ ማሻሻያ' },
      text: {
        en: 'Any doctor update requires your approval. Consent is automatically revoked after changes until you approve.',
        am: 'ማንኛውም የሐኪም ዝማኔ ማጽደቅዎን ይጠይቃል። እስኪያጸድቁ ድረስ ከለውጦች በኋላ ፈቃድ በራስ-ሰር ይሻራል።',
      },
    },
    {
      title: { en: 'Complete Audit Trail', am: 'ሙሉ የኦዲት ዱካ' },
      text: {
        en: 'Every access to your data is logged. You can see who viewed what and when.',
        am: 'እያንዳንዱ የመረጃዎ መዳረሻ ተመዝግቧል። ማን ምን እንደተመለከተ እና መቼ እንደሆነ ማየት ይችላሉ።',
      },
    },
    {
      title: { en: 'No Admin Access', am: 'አስተዳዳሪ መዳረሻ የለም' },
      text: {
        en: 'Administrators manage the system but CANNOT view patient data. Only doctors with your consent can see your records.',
        am: 'አስተዳዳሪዎች ሥርዓቱን ያስተዳድራሉ ነገር ግን የታካሚ መረጃን ማየት አይችሉም። በፈቃድዎ ያላቸው ሐኪሞች ብቻ መዝገቦችዎን ማየት ይችላሉ።',
      },
    },
  ];

  const whoCanUse = [
    {
      role: { en: 'For Patients', am: 'ለታካሚዎች' },
      text: {
        en: 'View your medical records, control who sees your data, see access history, approve or dispute doctor changes',
        am: 'የሕክምና መዝገቦችዎን ይመልከቱ፣ መረጃዎን ማን እንደሚያይ ይቆጣጠሩ፣ የመዳረሻ ታሪክ ይመልከቱ፣ የሐኪም ለውጦችን ያጽድቁ ወይም ይቃወሙ',
      },
    },
    {
      role: { en: 'For Doctors/Nurses', am: 'ለሐኪሞች/ነርሶች' },
      text: {
        en: 'Access patient data only with consent, add diagnoses and prescriptions, request consent from patients',
        am: 'የታካሚ መረጃ ማግኘት የሚችሉት በፈቃድ ብቻ ነው፣ ምርመራ እና ማዘዣ ያክሉ፣ ከታካሚዎች ፈቃድ ይጠይቁ',
      },
    },
    {
      role: { en: 'For Administrators', am: 'ለአስተዳዳሪዎች' },
      text: {
        en: 'Manage facilities and health professionals, register patients, oversee the system - but NEVER view patient data',
        am: 'ተቋማትን እና የጤና ባለሙያዎችን ያስተዳድሩ፣ ታካሚዎችን ይመዝግቡ፣ ሥርዓቱን ይቆጣጠሩ - ነገር ግን የታካሚ መረጃን በፍጹም አይመልከቱ',
      },
    },
  ];

  const securityBullets = [
    { en: 'Two-factor authentication for all users', am: 'ለሁሉም ተጠቃሚዎች ሁለት-ደረጃ ማረጋገጫ' },
    { en: 'AES-256 encryption for all patient data', am: 'ለሁሉም የታካሚ መረጃዎች AES-256 ምስጠራ' },
    { en: 'TLS 1.3 for data in transit', am: 'በሚተላለፉበት ጊዜ ለመረጃዎች TLS 1.3' },
    { en: 'Complete audit trail - every access is logged', am: 'ሙሉ የኦዲት ዱካ - እያንዳንዱ መዳረሻ ተመዝግቧል' },
    { en: 'No admin can view patient data', am: 'ማንም አስተዳዳሪ የታካሚ መረጃ ማየት አይችልም' },
  ];

  const jimmaStats = [
    { en: '10 Woredas', am: '10 ወረዳዎች' },
    { en: '86 Health Facilities', am: '86 የጤና ተቋማት' },
    { en: '456 Health Professionals', am: '456 የጤና ባለሙያዎች' },
    { en: '234,567+ Patients', am: 'ከ234,567 በላይ ታካሚዎች' },
  ];

  const contact = {
    email: 'support@medilink.et',
    emergency: '907',
    address: { en: 'Jimma University, Jimma, Ethiopia', am: 'ጅማ ዩኒቨርሲቲ፣ ጅማ፣ ኢትዮጵያ' },
  };

  const disclaimer = {
    en: 'This platform is for educational purposes only. Not a substitute for professional medical advice. For emergencies, call 907.',
    am: 'ይህ መድረክ ለትምህርታዊ ዓላማ ብቻ ነው። ለሙያዊ የሕክምና ምክር ምትክ አይደለም። ለድንገተኛ አደጋ፣ 907 ይደውሉ።',
  };

  const L = (obj: { en: string; am: string }) => (isAmharic ? obj.am : obj.en);

  return (
    <Box>
      {/* Section 1: Hero */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4eb6f2 0%, #4A90E2 55%, #1F2937 100%)',
          color: 'white',
          py: 7,
          textAlign: 'center',
        }}
      >
        <Container>
          <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
            {L(hero.title)}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            {L(hero.subtitle)}
          </Typography>
        </Container>
      </Box>

      <Container sx={{ py: 6 }}>
        {/* Section 2: What is MediLink */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom fontWeight={700} sx={{ color: '#4A90E2', mb: 2 }}>
            {isAmharic ? 'ሜድሊንክ ምንድነው?' : 'What is MediLink?'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, maxWidth: 800 }}>
            {L(whatIs)}
          </Typography>
        </Box>

        {/* Section 3: How It Works */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom fontWeight={700} sx={{ color: '#4A90E2', mb: 3 }}>
            {isAmharic ? 'እንዴት ይሠራል?' : 'How It Works'}
          </Typography>
          <Grid container spacing={3}>
            {howItWorks.map((step, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#4A90E2' }}>
                      {L(step.step)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {L(step.text)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Section 4: Key Features */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom fontWeight={700} sx={{ color: '#4A90E2', mb: 3 }}>
            {isAmharic ? 'ዋና ባህሪያት' : 'Key Features'}
          </Typography>
          <Grid container spacing={3}>
            {keyFeatures.map((f, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Storage sx={{ color: '#4A90E2', fontSize: 24 }} />
                      <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#4A90E2' }}>
                        {L(f.title)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {L(f.text)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Section 5: Who Can Use */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom fontWeight={700} sx={{ color: '#4A90E2', mb: 3 }}>
            {isAmharic ? 'ሜድሊንክን ማን መጠቀም ይችላል?' : 'Who Can Use MediLink?'}
          </Typography>
          <Grid container spacing={3}>
            {whoCanUse.map((u, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      {idx === 0 && <People sx={{ color: '#4A90E2', fontSize: 28 }} />}
                      {idx === 1 && <LocalHospital sx={{ color: '#4A90E2', fontSize: 28 }} />}
                      {idx === 2 && <Assignment sx={{ color: '#4A90E2', fontSize: 28 }} />}
                      <Typography variant="h6" fontWeight={600} sx={{ color: '#4A90E2' }}>
                        {L(u.role)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {L(u.text)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Section 6: Security & Privacy */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom fontWeight={700} sx={{ color: '#4A90E2', mb: 3 }}>
            {isAmharic ? 'ደህንነት እና ግላዊነት' : 'Security & Privacy'}
          </Typography>
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <CardContent>
              <List disablePadding>
                {securityBullets.map((b, idx) => (
                  <ListItem key={idx} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Security sx={{ color: '#4A90E2', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText primary={L(b)} primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Section 7: Jimma Zone Coverage */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom fontWeight={700} sx={{ color: '#4A90E2', mb: 3 }}>
            {isAmharic ? 'የጅማ ዞን ሽፋን' : 'Jimma Zone Coverage'}
          </Typography>
          <Grid container spacing={2}>
            {jimmaStats.map((s, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="body1" fontWeight={600} sx={{ color: '#4A90E2' }}>
                      {L(s)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Section 8: Contact & Support */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom fontWeight={700} sx={{ color: '#4A90E2', mb: 3 }}>
            {isAmharic ? 'አግኙ እና ድጋፍ' : 'Contact & Support'}
          </Typography>
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <ContactMail sx={{ color: '#4A90E2', fontSize: 32 }} />
                <Typography variant="h6" fontWeight={600} sx={{ color: '#4A90E2' }}>
                  {isAmharic ? 'እውቂያ መረጃ' : 'Contact Information'}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {isAmharic ? 'ኢሜይል' : 'Email'}: {contact.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isAmharic ? 'ድንገተኛ' : 'Emergency'}: {contact.emergency}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isAmharic ? 'አድራሻ' : 'Address'}: {L(contact.address)}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Section 9: Disclaimer */}
        <Box>
          <Card sx={{ border: '1px solid', borderColor: 'warning.main', borderRadius: 3, bgcolor: 'warning.light' }}>
            <CardContent>
              <Typography variant="body2">
                {L(disclaimer)}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};
