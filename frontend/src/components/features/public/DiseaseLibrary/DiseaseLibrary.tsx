import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Tabs,
  Tab,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  InputAdornment,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Stack,
  IconButton,
} from '@mui/material';
import {
  Search,
  LocalHospital,
  CheckCircle,
  Info,
  ExpandMore,
  FilterList,
  Clear,
  Warning,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { PrimaryButton } from '@/components/ui';
import { Disease, DiseaseCategory, RegionalPrevalence } from '@/types';
import { BodyMap } from '@/components/ui/body-map/BodyMap';
import { DiseaseSymptomsVideoSection } from './DiseaseSymptomsVideoSection';

interface DiseaseLibraryProps {
  diseases?: Disease[];
  visualAssets?: Record<string, any>;
  searchQuery?: string;
  categoryFilter?: DiseaseCategory;
  regionalData?: RegionalPrevalence[];
  onDiseaseSelect?: (disease: Disease) => void;
  language?: 'en' | 'am';
  userLocation?: string;
}

const diseaseCategories: Array<{ value: DiseaseCategory; label: string; labelAm: string }> = [
  { value: 'infectious', label: 'Infectious Diseases', labelAm: 'ተላላፊ በሽታዎች' },
  { value: 'silent', label: 'Silent Diseases', labelAm: 'ድብቅ በሽታዎች' },
  { value: 'chronic', label: 'Chronic Conditions', labelAm: 'ዘላቂ ሁኔታዎች' },
  { value: 'respiratory', label: 'Respiratory Illnesses', labelAm: 'የመተንፈሻ በሽታዎች' },
  { value: 'maternal-child', label: 'Maternal & Child Health', labelAm: 'የእናት እና ልጅ ጤና' },
  { value: 'tropical', label: 'Tropical Diseases', labelAm: 'የሙቀት ሰፈር በሽታዎች' },
  { value: 'common-ailments', label: 'Common Ailments', labelAm: 'ተራ በሽታዎች' },
  { value: 'autoimmune', label: 'Autoimmune Diseases', labelAm: 'ራስን በራስ የሚከላከሉ በሽታዎች' },
];

const severityLevels = [
  { value: 'all', label: 'All Severities' },
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
  { value: 'critical', label: 'Critical' },
];

const urgencyLevels = [
  { value: 'all', label: 'All Urgency Levels' },
  { value: 'emergency', label: 'Emergency (Immediate Care)' },
  { value: 'chronic', label: 'Chronic (Long-term Management)' },
  { value: 'acute', label: 'Acute (Short-term Treatment)' },
  { value: 'self-limiting', label: 'Self-limiting (Resolves on its own)' },
];

const seasonalOptions = [
  { value: 'all', label: 'All Seasons' },
  { value: 'rainy', label: 'Rainy Season' },
  { value: 'dry', label: 'Dry Season' },
  { value: 'year-round', label: 'Year-round' },
];

const mockDiseases: Disease[] = [
  {
    id: '1',
    name: 'Malaria',
    nameAmharic: 'አንደኛ ዓይነት ትኩሳት',
    category: 'infectious',
    description: 'A mosquito-borne infectious disease caused by Plasmodium parasites.',
    symptoms: ['Fever', 'Chills', 'Headache', 'Fatigue', 'Nausea'],
    causes: ['Mosquito bites', 'Plasmodium parasites'],
    prevention: ['Use mosquito nets', 'Wear protective clothing', 'Use insect repellent'],
    treatment: ['Antimalarial medications', 'Rest', 'Fluid intake'],
    severity: 'severe',
    prevalence: { region: 'Ethiopia', prevalence: 'high' },
    seasonal: ['Rainy season'],
    bodyRegions: ['head', 'chest', 'abdomen'],
    videoUrl: null as any,
    descriptionAmharic: 'በፕላስሞዲየም ተባዮች ምክንያት በትንኝ የሚተላለፍ በሽታ።',
    symptomsAmharic: ['ትኩሳት', 'ብርድ ብርድ', 'ራስ ምታት', 'ድካም', 'ማቅለሽለሽ'],
    causesAmharic: ['የትንኝ ንክሻ', 'ፕላስሞዲየም ተባዮች'],
    preventionAmharic: ['የትንኝ መረብ መጠቀም', 'መከላከያ ልብስ መልበስ', 'ነፍሳት መከላከያ መጠቀም'],
    treatmentAmharic: ['ፀረ-ወባ መድሀኒቶች', 'ማረፍ', 'ፈሳሽ መጠጣት'],
  },
  {
    id: '2',
    name: 'Diabetes',
    nameAmharic: 'ስኳር በሽታ',
    category: 'chronic',
    description: 'A chronic condition that affects how your body processes blood sugar.',
    videoUrl: 'https://www.youtube.com/embed/YlIO_XSAkFk',
    symptoms: ['Increased thirst', 'Frequent urination', 'Fatigue', 'Blurred vision'],
    causes: ['Genetics', 'Lifestyle factors', 'Obesity'],
    prevention: ['Healthy diet', 'Regular exercise', 'Weight management'],
    treatment: ['Medication', 'Diet control', 'Exercise', 'Monitoring'],
    severity: 'moderate',
    prevalence: { region: 'Ethiopia', prevalence: 'medium' },
    bodyRegions: ['abdomen', 'leftLeg', 'rightLeg'],
    descriptionAmharic: 'የሰውነት የደም ስኳር አቀናባሪነትን የሚጎዳ ዘላቂ በሽታ።',
    symptomsAmharic: ['ከፍተኛ ጥማት', 'ተደጋጋሚ ሽንት', 'ድካም', 'ብዥ ያለ እይታ'],
    causesAmharic: ['የዘር ውርስ', 'የአኗኗር ሁኔታ', 'ከመጠን በላይ ክብደት'],
    preventionAmharic: ['ጤናማ አመጋገብ', 'መደበኛ እንቅስቃሴ', 'ክብደት መቆጣጠር'],
    treatmentAmharic: ['መድሀኒት', 'አመጋገብ መቆጣጠር', 'እንቅስቃሴ', 'ክትትል'],
  },
  {
    id: '3',
    name: 'Hypertension',
    nameAmharic: 'የደም ግፊት',
    category: 'chronic',
    description: 'High blood pressure (Hypertension) is a chronic cardiovascular condition affecting the circulatory system and multiple organ systems.',
    symptoms: [
      'Persistent headaches (especially back of head)',
      'Blurred vision',
      'Buzzing or ringing sounds (tinnitus)',
      'Facial flushing',
      'Nosebleeds',
      'Chest pain or pressure',
      'Palpitations',
      'Irregular heartbeat',
      'Shortness of breath',
      'Dizziness',
      'Lightheadedness',
      'Confusion',
      'Unsteadiness',
      'Feeling faint',
      'Fatigue',
      'Weakness',
      'Numbness or tingling in hands/feet',
    ],
    causes: [
      'Genetics and family history',
      'Age (risk increases with age)',
      'Obesity and overweight',
      'Lack of physical activity',
      'High salt intake',
      'Excessive alcohol consumption',
      'Tobacco use',
      'Chronic stress',
      'Certain medical conditions (kidney disease, diabetes)',
    ],
    prevention: [
      'Maintain healthy weight',
      'Regular exercise (at least 30 minutes daily)',
      'Reduce salt intake',
      'Eat a balanced diet rich in fruits and vegetables',
      'Limit alcohol consumption',
      'Quit smoking',
      'Manage stress through relaxation techniques',
      'Regular blood pressure monitoring',
      'Follow medication regimen if prescribed',
    ],
    treatment: [
      'Lifestyle modifications (diet, exercise)',
      'Blood pressure medications (ACE inhibitors, diuretics, beta-blockers)',
      'Regular monitoring and follow-up',
      'Weight management',
      'Stress management',
      'Quitting smoking and limiting alcohol',
    ],
    severity: 'moderate',
    prevalence: { region: 'Ethiopia', prevalence: 'high' },
    videoUrl: 'https://www.youtube.com/embed/rIIg3xeF6jc',
    bodyRegions: [
      'head',
      'eyes',
      'ears',
      'face',
      'chest',
      'heart',
      'lungs',
      'brain',
      'leftArm',
      'rightArm',
      'abdomen',
      'kidneys',
      'leftLeg',
      'rightLeg',
    ],
    progressionTimeline: [
      {
        stage: 'Stage 1 (Mild)',
        duration: 'Early stage',
        symptoms: ['Occasional headaches', 'Mild dizziness'],
        severity: 'mild' as const,
      },
      {
        stage: 'Stage 2 (Moderate)',
        duration: 'Progressive stage',
        symptoms: ['Frequent headaches', 'Vision problems', 'Chest discomfort'],
        severity: 'moderate' as const,
      },
      {
        stage: 'Stage 3 (Severe)',
        duration: 'Advanced stage',
        symptoms: ['Severe headaches', 'Chest pain', 'Difficulty breathing', 'Confusion'],
        severity: 'severe' as const,
      },
    ],
    visualAssets: {
      bodyMapRegions: ['head', 'chest', 'heart', 'kidneys', 'eyes'],
      symptomIcons: ['headache', 'chest-pain', 'dizziness'],
      infographics: ['blood-pressure-chart', 'risk-factors'],
      flowcharts: ['diagnosis-flowchart', 'treatment-decision-tree'],
    },
  },
  {
    id: '4',
    name: 'Type 2 Diabetes',
    nameAmharic: 'ዓይነት 2 የስኳር በሽታ',
    category: 'silent',
    description: 'A slow-developing diabetes type that may have mild symptoms early, causing high blood sugar over time.',
    descriptionAmharic: 'ቀስ በቀስ የሚያድግ ዓይነት 2 የስኳር በሽታ፣ በመጀመሪያ ቀላል ምልክቶች ሊኖሩ ይችላሉ።',
    symptoms: ['Increased thirst', 'Frequent urination', 'Fatigue', 'Blurred vision', 'Slow wound healing'],
    symptomsAmharic: ['ከፍተኛ ጥማት', 'ተደጋጋሚ ሽንት', 'ድካም', 'ብዥ ያለ እይታ', 'ቁስሎች የማይድኑ'],
    causes: ['Insulin resistance', 'Obesity', 'Sedentary lifestyle', 'Family history'],
    causesAmharic: ['ኢንሱሊን መቋቋም', 'ክብደት መጨመር', 'እንቅስቃሴ ማነስ', 'የቤተሰብ ታሪክ'],
    prevention: ['Healthy diet', 'Regular exercise', 'Maintain healthy weight', 'Regular checkups'],
    preventionAmharic: ['ጤናማ አመጋገብ', 'መደበኛ እንቅስቃሴ', 'ተገቢ ክብደት', 'መደበኛ ምርመራ'],
    treatment: ['Lifestyle changes', 'Oral medications', 'Blood sugar monitoring'],
    treatmentAmharic: ['የአኗኗር ለውጥ', 'መድሀኒት', 'የደም ስኳር መከታተል'],
    severity: 'moderate',
    bodyRegions: ['abdomen', 'pancreas', 'eyes', 'kidneys'],
    videoUrl: null as any,
  },
  {
    id: '5',
    name: 'Osteoporosis',
    nameAmharic: 'የአጥንት መሰባበር',
    category: 'silent',
    description: 'A condition where bones become weak and brittle, often without early symptoms until a fracture occurs.',
    descriptionAmharic: 'አጥንቶች ደካማ እና በቀላሉ የሚሰበሩበት በሽታ፣ እስከ መሰበር ድረስ ምልክት ሊታይ አይችልም።',
    symptoms: ['Back pain', 'Loss of height', 'Stooped posture', 'Fractures'],
    symptomsAmharic: ['የጀርባ ህመም', 'ቁመት መቀነስ', 'ጀርባ መታጠፍ', 'አጥንት መሰበር'],
    causes: ['Age', 'Low calcium/vitamin D', 'Smoking', 'Sedentary lifestyle'],
    causesAmharic: ['ዕድሜ', 'ዝቅተኛ ካልሲየም/ቫይታሚን ዲ', 'ማጨስ', 'እንቅስቃሴ ማነስ'],
    prevention: ['Calcium & vitamin D', 'Weight-bearing exercise', 'Avoid smoking'],
    preventionAmharic: ['ካልሲየም እና ቫይታሚን ዲ', 'ክብደት የሚሸከም እንቅስቃሴ', 'ማጨስ መቆም'],
    treatment: ['Medications', 'Supplements', 'Fall prevention'],
    treatmentAmharic: ['መድሀኒቶች', 'ማሟያዎች', 'ውድቀት መከላከል'],
    severity: 'moderate',
    bodyRegions: ['spine', 'hips', 'wrists'],
    videoUrl: null as any,
  },
  {
    id: '6',
    name: 'Chronic Kidney Disease (CKD)',
    nameAmharic: 'የኩላሊት ዘላቂ በሽታ',
    category: 'silent',
    description: 'Long-term loss of kidney function that can progress silently until advanced stages.',
    descriptionAmharic: 'የኩላሊት ስራ በረዘመ ጊዜ የሚቀንስ በሽታ፣ ብዙ ጊዜ በመጀመሪያ ምልክት አይኖርበትም።',
    symptoms: ['Swelling (legs/face)', 'Fatigue', 'Loss of appetite', 'Changes in urination'],
    symptomsAmharic: ['እብጠት (እግር/ፊት)', 'ድካም', 'መብላት መቀነስ', 'የሽንት ለውጥ'],
    causes: ['Diabetes', 'Hypertension', 'Kidney infections', 'Genetic conditions'],
    causesAmharic: ['ስኳር በሽታ', 'የደም ግፊት', 'የኩላሊት ኢንፌክሽን', 'የዘር ችግር'],
    prevention: ['Control blood pressure', 'Control blood sugar', 'Avoid nephrotoxic drugs', 'Regular screening'],
    preventionAmharic: ['የደም ግፊት መቆጣጠር', 'የደም ስኳር መቆጣጠር', 'ኩላሊትን የሚጎዱ መድሀኒቶች መቆጠብ', 'መደበኛ ምርመራ'],
    treatment: ['Diet changes', 'Medications', 'Dialysis in advanced stages'],
    treatmentAmharic: ['አመጋገብ ለውጥ', 'መድሀኒቶች', 'በከፍተኛ ደረጃ ዳያሊሲስ'],
    severity: 'severe',
    bodyRegions: ['kidneys', 'abdomen', 'leftLeg', 'rightLeg'],
    videoUrl: null as any,
  },
  {
    id: '7',
    name: 'Hepatitis B and C',
    nameAmharic: 'የጉበት ኢንፌክሽን (ሄፐታይቲስ B/C)',
    category: 'silent',
    description: 'Viral infections that affect the liver; may be silent for years and lead to cirrhosis.',
    descriptionAmharic: 'ጉበትን የሚያጠቁ ቫይረሶች፣ ለዓመታት ምልክት ሳይኖር ሊቆዩ ይችላሉ።',
    symptoms: ['Fatigue', 'Jaundice', 'Abdominal pain', 'Dark urine'],
    symptomsAmharic: ['ድካም', 'የዓይን/ቆዳ መቢጫ', 'የሆድ ህመም', 'ጥቁር ሽንት'],
    causes: ['Blood exposure', 'Unprotected sex', 'Shared needles', 'Mother-to-child transmission'],
    causesAmharic: ['የደም መጋለጥ', 'ጥበቃ የሌለው ወሲብ', 'መርፌ ማጋራት', 'ከእናት ወደ ልጅ መተላለፍ'],
    prevention: ['Vaccination (HBV)', 'Safe sex', 'Avoid needle sharing', 'Screening'],
    preventionAmharic: ['ክትባት (HBV)', 'ደህንነቱ የተጠበቀ ወሲብ', 'መርፌ አትጋሩ', 'ምርመራ'],
    treatment: ['Antiviral therapy', 'Regular monitoring', 'Lifestyle changes'],
    treatmentAmharic: ['ፀረ-ቫይረስ ሕክምና', 'መደበኛ ክትትል', 'የአኗኗር ለውጥ'],
    severity: 'severe',
    bodyRegions: ['abdomen', 'liver'],
    videoUrl: null as any,
  },
  {
    id: '8',
    name: 'High Cholesterol',
    nameAmharic: 'ከፍተኛ ኮሌስትሮል',
    category: 'silent',
    description: 'High blood cholesterol can silently increase risk of heart disease and stroke.',
    descriptionAmharic: 'ከፍተኛ ኮሌስትሮል ብዙ ጊዜ ምልክት ሳይኖር የልብ በሽታና ስትሮክ አደጋ ያስጨምራል።',
    symptoms: ['Often none', 'Sometimes chest pain (with heart disease)', 'Fatty deposits (rare)'],
    symptomsAmharic: ['ብዙ ጊዜ ምልክት የለም', 'አንዳንዴ የደረት ህመም', 'ስብ ማቀመጥ (አንዳንድ ጊዜ)'],
    causes: ['High-fat diet', 'Genetics', 'Obesity', 'Lack of exercise'],
    causesAmharic: ['ከፍተኛ ስብ ያለ ምግብ', 'የዘር ውርስ', 'ክብደት መጨመር', 'እንቅስቃሴ ማነስ'],
    prevention: ['Healthy diet', 'Exercise', 'Avoid smoking', 'Regular checks'],
    preventionAmharic: ['ጤናማ አመጋገብ', 'እንቅስቃሴ', 'ማጨስ መቆም', 'መደበኛ ምርመራ'],
    treatment: ['Diet changes', 'Statins', 'Manage risk factors'],
    treatmentAmharic: ['አመጋገብ ለውጥ', 'መድሀኒት (statins)', 'አደጋ ምክንያቶች መቆጣጠር'],
    severity: 'moderate',
    bodyRegions: ['heart', 'bloodVessels'],
    videoUrl: null as any,
  },
  {
    id: '9',
    name: 'Sleep Apnea',
    nameAmharic: 'የእንቅልፍ መቆራረጥ (Sleep Apnea)',
    category: 'silent',
    description: 'A sleep disorder where breathing repeatedly stops and starts during sleep.',
    descriptionAmharic: 'በእንቅልፍ ጊዜ መተንፈስ የሚቆራረጥ ችግር።',
    symptoms: ['Loud snoring', 'Daytime sleepiness', 'Morning headaches', 'Poor concentration'],
    symptomsAmharic: ['ከፍተኛ ማስነጠስ', 'በቀን እንቅልፍ መጣት', 'የጠዋት ራስ ምታት', 'ትኩረት መቀነስ'],
    causes: ['Obesity', 'Airway anatomy', 'Alcohol/sedatives', 'Smoking'],
    causesAmharic: ['ክብደት መጨመር', 'የአየር መንገድ መዋቅር', 'አልኮል/ማስታገሻ መድሀኒት', 'ማጨስ'],
    prevention: ['Weight management', 'Sleep position', 'Avoid alcohol before sleep'],
    preventionAmharic: ['ክብደት መቆጣጠር', 'የእንቅልፍ አቀማመጥ', 'ከእንቅልፍ በፊት አልኮል መቆጠብ'],
    treatment: ['CPAP therapy', 'Lifestyle changes', 'Oral devices'],
    treatmentAmharic: ['CPAP ሕክምና', 'የአኗኗር ለውጥ', 'የአፍ መሳሪያዎች'],
    severity: 'moderate',
    bodyRegions: ['throat', 'lungs', 'brain'],
    videoUrl: null as any,
  },
  {
    id: '10',
    name: 'Glaucoma',
    nameAmharic: 'ግላኮማ',
    category: 'silent',
    description: 'An eye disease that can slowly damage the optic nerve and cause vision loss.',
    descriptionAmharic: 'የዓይን ነርቭን በቀስታ የሚጎዳ እና እይታ ሊጠፋ የሚያደርግ በሽታ።',
    symptoms: ['Often none early', 'Blurred vision', 'Eye pain (some types)', 'Halos around lights'],
    symptomsAmharic: ['መጀመሪያ ላይ ምልክት የለም', 'ብዥ ያለ እይታ', 'የዓይን ህመም (አንዳንድ)', 'ብርሃን ዙሪያ ክብ ማየት'],
    causes: ['High eye pressure', 'Age', 'Family history'],
    causesAmharic: ['ከፍተኛ የዓይን ግፊት', 'ዕድሜ', 'የቤተሰብ ታሪክ'],
    prevention: ['Regular eye exams', 'Early detection'],
    preventionAmharic: ['መደበኛ የዓይን ምርመራ', 'ቀደምት መወቅ'],
    treatment: ['Eye drops', 'Laser treatment', 'Surgery'],
    treatmentAmharic: ['የዓይን ነጠብጣብ መድሀኒት', 'ሌዘር ሕክምና', 'ቀዶ ጥገና'],
    severity: 'severe',
    bodyRegions: ['eyes'],
    videoUrl: null as any,
  },
  {
    id: '11',
    name: 'Hypothyroidism',
    nameAmharic: 'የታይሮይድ እጥረት',
    category: 'silent',
    description: 'An underactive thyroid gland leading to slowed metabolism.',
    descriptionAmharic: 'የታይሮይድ ጉበት በቂ ሆርሞን ካልሰጠ ሲከሰት የሚከሰት ችግር።',
    symptoms: ['Fatigue', 'Weight gain', 'Cold intolerance', 'Dry skin'],
    symptomsAmharic: ['ድካም', 'ክብደት መጨመር', 'ብርድ መቋቋም መቀነስ', 'ደረቅ ቆዳ'],
    causes: ['Autoimmune (Hashimoto)', 'Iodine deficiency', 'Thyroid surgery'],
    causesAmharic: ['ራስን በራስ መከላከል (Hashimoto)', 'የአዮዲን እጥረት', 'የታይሮይድ ቀዶ ጥገና'],
    prevention: ['Adequate iodine', 'Early testing when symptoms'],
    preventionAmharic: ['በቂ አዮዲን', 'ምልክት ካለ ቀደምት ምርመራ'],
    treatment: ['Thyroid hormone replacement'],
    treatmentAmharic: ['የታይሮይድ ሆርሞን መተካት'],
    severity: 'moderate',
    bodyRegions: ['neck', 'wholeBody'],
    videoUrl: null as any,
  },
  {
    id: '12',
    name: 'Fatty Liver Disease',
    nameAmharic: 'የጉበት ስብ መከማቸት',
    category: 'silent',
    description: 'Fat accumulation in the liver, often linked to obesity and metabolic syndrome.',
    descriptionAmharic: 'በጉበት ውስጥ ስብ መከማቸት፣ ብዙ ጊዜ ከክብደት እና ከስኳር ጋር የተያያዘ።',
    symptoms: ['Often none', 'Fatigue', 'Right upper abdominal discomfort'],
    symptomsAmharic: ['ብዙ ጊዜ ምልክት የለም', 'ድካም', 'ቀኝ የላይ ሆድ ምቾት ማጣት'],
    causes: ['Obesity', 'Diabetes', 'High triglycerides', 'Alcohol (some types)'],
    causesAmharic: ['ክብደት መጨመር', 'ስኳር በሽታ', 'ከፍተኛ ስብ ነገሮች', 'አልኮል (አንዳንድ)'],
    prevention: ['Healthy weight', 'Balanced diet', 'Exercise', 'Limit alcohol'],
    preventionAmharic: ['ተገቢ ክብደት', 'ተመጣጠነ ምግብ', 'እንቅስቃሴ', 'አልኮል መገደብ'],
    treatment: ['Weight loss', 'Diet changes', 'Treat metabolic risk factors'],
    treatmentAmharic: ['ክብደት መቀነስ', 'አመጋገብ ለውጥ', 'የአደጋ ምክንያቶች ሕክምና'],
    severity: 'moderate',
    bodyRegions: ['abdomen', 'liver'],
    videoUrl: null as any,
  },
  // Chronic diseases
  {
    id: '13',
    name: 'Asthma',
    nameAmharic: 'አስም',
    category: 'chronic',
    description: 'A chronic condition where airways become inflamed and narrow, causing wheezing and breathing difficulty.',
    descriptionAmharic: 'የአየር መንገድ ሲቃጠል እና ሲጠበብ የሚመጣ ዘላቂ በሽታ።',
    symptoms: ['Wheezing', 'Shortness of breath', 'Chest tightness', 'Coughing'],
    symptomsAmharic: ['ማስነጠስ', 'የትንፋሽ ማጠር', 'የደረት መጨናነቅ', 'ሳል'],
    causes: ['Allergens', 'Smoke', 'Cold air', 'Respiratory infections'],
    causesAmharic: ['አለርጂ', 'ጭስ', 'ቀዝቃዛ አየር', 'የመተንፈሻ ኢንፌክሽን'],
    prevention: ['Avoid triggers', 'Use prescribed inhalers', 'Regular checkups'],
    preventionAmharic: ['ቀስቅሴዎችን መቆጠብ', 'ኢንሄለር መጠቀም', 'መደበኛ ምርመራ'],
    treatment: ['Inhalers', 'Medications', 'Action plan'],
    treatmentAmharic: ['ኢንሄለር', 'መድሀኒቶች', 'የአስም እቅድ'],
    severity: 'moderate',
    bodyRegions: ['chest', 'lungs', 'throat'],
    videoUrl: null as any,
  },
  {
    id: '14',
    name: 'Epilepsy',
    nameAmharic: 'የንቅልፍ ጭንቀት / ኤፒሌፕሲ',
    category: 'chronic',
    description: 'A neurological condition causing recurrent seizures.',
    descriptionAmharic: 'ተደጋጋሚ የመንቀጥቀጥ ችግር የሚያስከትል የነርቭ በሽታ።',
    symptoms: ['Seizures', 'Loss of awareness', 'Confusion after episodes'],
    symptomsAmharic: ['መንቀጥቀጥ', 'ማስታወቂያ መጥፋት', 'ከተከሰተ በኋላ መታወክ'],
    causes: ['Brain injury', 'Genetics', 'Infections', 'Unknown (sometimes)'],
    causesAmharic: ['የአእምሮ ጉዳት', 'የዘር ውርስ', 'ኢንፌክሽኖች', 'አንዳንዴ ያልታወቀ'],
    prevention: ['Prevent head injuries', 'Treat infections early'],
    preventionAmharic: ['የራስ ጉዳት መከላከል', 'ኢንፌክሽን ቀደም ብሎ ሕክምና'],
    treatment: ['Anti-seizure medications', 'Avoid triggers', 'Follow-up care'],
    treatmentAmharic: ['ፀረ-መንቀጥቀጥ መድሀኒቶች', 'ቀስቅሴ መቆጠብ', 'ክትትል'],
    severity: 'severe',
    bodyRegions: ['brain', 'head'],
    videoUrl: null as any,
  },
  {
    id: '15',
    name: 'Rheumatoid Arthritis',
    nameAmharic: 'ሩማቶይድ አርትራይተስ',
    category: 'chronic',
    description: 'An autoimmune-related joint inflammation causing pain and swelling.',
    descriptionAmharic: 'መገጣጠሚያዎችን የሚያቃጥል እና ህመም የሚያመጣ ራስን በራስ የሚከላከል በሽታ።',
    symptoms: ['Joint pain', 'Swelling', 'Morning stiffness', 'Fatigue'],
    symptomsAmharic: ['የመገጣጠሚያ ህመም', 'እብጠት', 'የጠዋት መደንዘዝ', 'ድካም'],
    causes: ['Immune dysfunction', 'Genetics', 'Smoking'],
    causesAmharic: ['የኢሚዩን መዛባት', 'የዘር ውርስ', 'ማጨስ'],
    prevention: ['No known prevention', 'Early diagnosis', 'Avoid smoking'],
    preventionAmharic: ['የታወቀ መከላከያ የለም', 'ቀደምት ምርመራ', 'ማጨስ መቆም'],
    treatment: ['DMARDs', 'Physical therapy', 'Pain management'],
    treatmentAmharic: ['DMARDs መድሀኒት', 'የአካል ሕክምና', 'ህመም አያያዝ'],
    severity: 'moderate',
    bodyRegions: ['hands', 'feet', 'joints', 'knees'],
    videoUrl: null as any,
  },
  {
    id: '16',
    name: 'Heart Failure',
    nameAmharic: 'የልብ ድካም',
    category: 'chronic',
    description: 'A condition where the heart cannot pump blood effectively.',
    descriptionAmharic: 'ልብ ደምን በቂ ሁኔታ ማፍሰስ ሲችል የሚቀንስ በሽታ።',
    symptoms: ['Shortness of breath', 'Swelling', 'Fatigue', 'Rapid heartbeat'],
    symptomsAmharic: ['የትንፋሽ ማጠር', 'እብጠት', 'ድካም', 'ፈጣን የልብ ምት'],
    causes: ['Hypertension', 'Coronary artery disease', 'Cardiomyopathy'],
    causesAmharic: ['የደም ግፊት', 'የልብ የደም ሥሮች ችግር', 'የልብ ጡንቻ ችግር'],
    prevention: ['Control BP', 'Healthy diet', 'Exercise', 'Avoid smoking'],
    preventionAmharic: ['የደም ግፊት መቆጣጠር', 'ጤናማ አመጋገብ', 'እንቅስቃሴ', 'ማጨስ መቆም'],
    treatment: ['Medications', 'Lifestyle changes', 'Follow-up care'],
    treatmentAmharic: ['መድሀኒት', 'የአኗኗር ለውጥ', 'ክትትል'],
    severity: 'critical',
    bodyRegions: ['heart', 'chest', 'lungs'],
    videoUrl: null as any,
  },
  {
    id: '17',
    name: 'COPD',
    nameAmharic: 'ሲኦፒዲ (COPD)',
    category: 'chronic',
    description: 'A long-term lung disease that makes breathing difficult.',
    descriptionAmharic: 'ለረዘመ ጊዜ የሳንባ ችግር የሚያመጣ በሽታ።',
    symptoms: ['Chronic cough', 'Shortness of breath', 'Wheezing'],
    symptomsAmharic: ['ዘላቂ ሳል', 'የትንፋሽ ማጠር', 'ማስነጠስ'],
    causes: ['Smoking', 'Air pollution', 'Occupational dust'],
    causesAmharic: ['ማጨስ', 'የአየር ብክለት', 'የስራ ቦታ አቧራ'],
    prevention: ['Avoid smoking', 'Reduce exposure', 'Vaccination'],
    preventionAmharic: ['ማጨስ መቆም', 'መጋለጥ መቀነስ', 'ክትባት'],
    treatment: ['Inhalers', 'Pulmonary rehab', 'Oxygen (some cases)'],
    treatmentAmharic: ['ኢንሄለር', 'የሳንባ ማጠናከር', 'ኦክሲጅን (አንዳንድ)'],
    severity: 'severe',
    bodyRegions: ['lungs', 'chest'],
    videoUrl: null as any,
  },
  {
    id: '18',
    name: 'Sickle Cell Disease',
    nameAmharic: 'ሲክል ሴል በሽታ',
    category: 'chronic',
    description: 'A genetic blood disorder causing misshapen red blood cells and pain crises.',
    descriptionAmharic: 'የዘር የደም ችግር፣ የደም ሕዋሳት ቅርጽ ሲቀየር ህመም የሚያስከትል።',
    symptoms: ['Pain episodes', 'Anemia', 'Swelling of hands/feet'],
    symptomsAmharic: ['የህመም ግጭት', 'ደም እጥረት', 'የእጅ/እግር እብጠት'],
    causes: ['Inherited gene mutation'],
    causesAmharic: ['የተወረሰ የጂን ለውጥ'],
    prevention: ['Genetic counseling', 'Early screening'],
    preventionAmharic: ['የዘር ምክር', 'ቀደምት ምርመራ'],
    treatment: ['Pain control', 'Hydration', 'Medications', 'Transfusion (some cases)'],
    treatmentAmharic: ['ህመም መቆጣጠር', 'ፈሳሽ', 'መድሀኒት', 'ደም መስጠት (አንዳንድ)'],
    severity: 'severe',
    bodyRegions: ['blood', 'wholeBody'],
    videoUrl: null as any,
  },
  {
    id: '19',
    name: 'HIV/AIDS',
    nameAmharic: 'ኤችአይቪ/ኤድስ',
    category: 'chronic',
    description: 'A virus that attacks the immune system; can be managed with treatment.',
    descriptionAmharic: 'የመከላከያ ሥርዓትን የሚያጠቃ ቫይረስ፣ በሕክምና መቆጣጠር ይቻላል።',
    symptoms: ['Fever', 'Weight loss', 'Recurrent infections', 'Night sweats'],
    symptomsAmharic: ['ትኩሳት', 'ክብደት መቀነስ', 'ተደጋጋሚ ኢንፌክሽን', 'የሌሊት ላብ'],
    causes: ['Unprotected sex', 'Blood exposure', 'Mother-to-child transmission'],
    causesAmharic: ['ጥበቃ የሌለው ወሲብ', 'የደም መጋለጥ', 'ከእናት ወደ ልጅ መተላለፍ'],
    prevention: ['Condom use', 'Testing', 'ART for prevention'],
    preventionAmharic: ['ኮንዶም', 'ምርመራ', 'ART መከላከል'],
    treatment: ['Antiretroviral therapy', 'Regular care'],
    treatmentAmharic: ['ART ሕክምና', 'መደበኛ ክትትል'],
    severity: 'critical',
    bodyRegions: ['immuneSystem', 'wholeBody'],
    videoUrl: null as any,
  },
  {
    id: '20',
    name: 'Tuberculosis',
    nameAmharic: 'ነቀርሳ',
    category: 'chronic',
    description: 'A bacterial infection that mainly affects the lungs.',
    descriptionAmharic: 'በባክቴሪያ የሚመጣ ብዙውን ጊዜ ሳንባን የሚጎዳ በሽታ።',
    symptoms: ['Persistent cough', 'Fever', 'Night sweats', 'Weight loss'],
    symptomsAmharic: ['ዘላቂ ሳል', 'ትኩሳት', 'የሌሊት ላብ', 'ክብደት መቀነስ'],
    causes: ['Mycobacterium tuberculosis (airborne)'],
    causesAmharic: ['TB ባክቴሪያ (በአየር ይተላለፋል)'],
    prevention: ['Early detection', 'Treatment adherence', 'Ventilation'],
    preventionAmharic: ['ቀደምት መወቅ', 'ሕክምና መጠበቅ', 'አየር መንቀሳቀስ'],
    treatment: ['Long-course antibiotics', 'Follow-up'],
    treatmentAmharic: ['ረዘመ ጊዜ አንቲባዮቲክ', 'ክትትል'],
    severity: 'severe',
    bodyRegions: ['lungs', 'chest'],
    videoUrl: null as any,
  },
  {
    id: '21',
    name: 'Typhoid Fever',
    nameAmharic: 'ታይፎይድ ትኩሳት',
    category: 'chronic',
    description: 'A bacterial infection often spread through contaminated food or water.',
    descriptionAmharic: 'በተበከለ ምግብ ወይም ውሃ የሚተላለፍ ባክቴሪያዊ ኢንፌክሽን።',
    symptoms: ['High fever', 'Abdominal pain', 'Diarrhea or constipation', 'Headache'],
    symptomsAmharic: ['ከፍተኛ ትኩሳት', 'የሆድ ህመም', 'ተቅማጥ/መቆለፍ', 'ራስ ምታት'],
    causes: ['Salmonella typhi', 'Poor sanitation'],
    causesAmharic: ['Salmonella typhi', 'የንፅህና እጥረት'],
    prevention: ['Safe water', 'Hand washing', 'Food hygiene', 'Vaccination (some)'],
    preventionAmharic: ['ንጹህ ውሃ', 'እጅ መታጠብ', 'የምግብ ንፅህና', 'ክትባት (አንዳንድ)'],
    treatment: ['Antibiotics', 'Fluids', 'Rest'],
    treatmentAmharic: ['አንቲባዮቲክ', 'ፈሳሽ', 'ማረፍ'],
    severity: 'severe',
    bodyRegions: ['abdomen', 'wholeBody'],
    videoUrl: null as any,
  },
  // Autoimmune diseases
  {
    id: '22',
    name: 'Type 1 Diabetes',
    nameAmharic: 'ዓይነት 1 የስኳር በሽታ',
    category: 'autoimmune',
    description: 'Autoimmune destruction of insulin-producing cells; requires lifelong insulin.',
    descriptionAmharic: 'ኢንሱሊን የሚያመነጩ ሴሎችን ራስን በራስ ሲያጠፋ የሚመጣ በሽታ።',
    symptoms: ['Excessive thirst', 'Frequent urination', 'Weight loss', 'Fatigue'],
    symptomsAmharic: ['ከፍተኛ ጥማት', 'ተደጋጋሚ ሽንት', 'ክብደት መቀነስ', 'ድካም'],
    causes: ['Autoimmune reaction', 'Genetics', 'Viral triggers'],
    causesAmharic: ['የኢሚዩን ተግባር', 'የዘር ውርስ', 'ቫይረስ ቀስቅሴ'],
    prevention: ['No known prevention'],
    preventionAmharic: ['የታወቀ መከላከያ የለም'],
    treatment: ['Insulin therapy', 'Monitoring', 'Healthy diet'],
    treatmentAmharic: ['ኢንሱሊን', 'ክትትል', 'ጤናማ አመጋገብ'],
    severity: 'critical',
    bodyRegions: ['pancreas', 'wholeBody'],
    videoUrl: null as any,
  },
  {
    id: '23',
    name: 'Lupus',
    nameAmharic: 'ሉፐስ',
    category: 'autoimmune',
    description: 'An autoimmune disease that can affect skin, joints, kidneys, and other organs.',
    descriptionAmharic: 'ቆዳ፣ መገጣጠሚያ፣ ኩላሊት እና ሌሎች አካላትን ሊያጠቃ የሚችል ራስን በራስ የሚከላከል በሽታ።',
    symptoms: ['Joint pain', 'Rash', 'Fatigue', 'Fever'],
    symptomsAmharic: ['የመገጣጠሚያ ህመም', 'ቁርጠት/ማቃጠል', 'ድካም', 'ትኩሳት'],
    causes: ['Immune dysfunction', 'Genetics', 'Environmental triggers'],
    causesAmharic: ['የኢሚዩን መዛባት', 'የዘር ውርስ', 'አካባቢ ቀስቅሴ'],
    prevention: ['No known prevention', 'Avoid sun exposure (some cases)'],
    preventionAmharic: ['የታወቀ መከላከያ የለም', 'ፀሐይ መጋለጥ መቆጠብ (አንዳንድ)'],
    treatment: ['Immunosuppressants', 'Anti-inflammatory meds', 'Follow-up care'],
    treatmentAmharic: ['ኢሚዩን መቀነሻ መድሀኒቶች', 'ፀረ-እብጠት መድሀኒቶች', 'ክትትል'],
    severity: 'severe',
    bodyRegions: ['skin', 'joints', 'kidneys'],
    videoUrl: null as any,
  },
  {
    id: '24',
    name: 'Multiple Sclerosis',
    nameAmharic: 'ሙልቲፕል ስክሌሮሲስ',
    category: 'autoimmune',
    description: 'An immune-mediated disease affecting the brain and spinal cord.',
    descriptionAmharic: 'አእምሮና አከርካሪ ነርቭ ላይ የሚጎዳ ራስን በራስ ችግር።',
    symptoms: ['Numbness', 'Weakness', 'Vision problems', 'Balance issues'],
    symptomsAmharic: ['ድንዛዝ', 'ድካም/ድንጋጤ', 'የእይታ ችግር', 'ሚዛን ችግር'],
    causes: ['Immune attack on myelin', 'Genetics', 'Environment'],
    causesAmharic: ['ሚያሊን ላይ የኢሚዩን ጥቃት', 'የዘር ውርስ', 'አካባቢ'],
    prevention: ['No known prevention'],
    preventionAmharic: ['የታወቀ መከላከያ የለም'],
    treatment: ['Disease-modifying therapy', 'Rehab', 'Symptom management'],
    treatmentAmharic: ['DMT መድሀኒት', 'ማጠናከር', 'ምልክት አያያዝ'],
    severity: 'severe',
    bodyRegions: ['brain', 'spine', 'nerves'],
    videoUrl: null as any,
  },
  {
    id: '25',
    name: 'Psoriasis',
    nameAmharic: 'ፖሲያሪያሲስ',
    category: 'autoimmune',
    description: 'A chronic immune-related skin condition causing scaly patches.',
    descriptionAmharic: 'ቆዳ ላይ እብጠትና ቅብ የሚያመጣ ዘላቂ ችግር።',
    symptoms: ['Red scaly patches', 'Itching', 'Skin cracking'],
    symptomsAmharic: ['ቀይ እና ቅብ ያለ ቆዳ', 'እብጠት ማስነሳት', 'ቆዳ መሰንጠቅ'],
    causes: ['Immune dysregulation', 'Genetics', 'Triggers (stress/infections)'],
    causesAmharic: ['የኢሚዩን መዛባት', 'የዘር ውርስ', 'ቀስቅሴ (ጭንቀት/ኢንፌክሽን)'],
    prevention: ['Avoid triggers', 'Skin care'],
    preventionAmharic: ['ቀስቅሴ መቆጠብ', 'የቆዳ እንክብካቤ'],
    treatment: ['Topical therapy', 'Phototherapy', 'Systemic meds'],
    treatmentAmharic: ['የቆዳ መድሀኒት', 'ብርሃን ሕክምና', 'ውስጣዊ መድሀኒት'],
    severity: 'moderate',
    bodyRegions: ['skin'],
    videoUrl: null as any,
  },
  {
    id: '26',
    name: "Hashimoto's Disease",
    nameAmharic: 'ሃሺሞቶ በሽታ',
    category: 'autoimmune',
    description: 'Autoimmune thyroiditis leading to hypothyroidism.',
    descriptionAmharic: 'ታይሮይድን የሚጎዳ ራስን በራስ በሽታ እና የታይሮይድ እጥረት ያመጣል።',
    symptoms: ['Fatigue', 'Weight gain', 'Cold intolerance'],
    symptomsAmharic: ['ድካም', 'ክብደት መጨመር', 'ብርድ መቋቋም መቀነስ'],
    causes: ['Autoimmune attack', 'Genetics'],
    causesAmharic: ['የኢሚዩን ጥቃት', 'የዘር ውርስ'],
    prevention: ['No known prevention'],
    preventionAmharic: ['የታወቀ መከላከያ የለም'],
    treatment: ['Thyroid hormone replacement'],
    treatmentAmharic: ['የታይሮይድ ሆርሞን መተካት'],
    severity: 'moderate',
    bodyRegions: ['neck', 'wholeBody'],
    videoUrl: null as any,
  },
  {
    id: '27',
    name: "Graves' Disease",
    nameAmharic: 'ግሬቭስ በሽታ',
    category: 'autoimmune',
    description: 'An autoimmune condition causing overactive thyroid (hyperthyroidism).',
    descriptionAmharic: 'ታይሮይድ ከመጠን በላይ ሲሰራ የሚመጣ ራስን በራስ በሽታ።',
    symptoms: ['Weight loss', 'Fast heartbeat', 'Anxiety', 'Heat intolerance'],
    symptomsAmharic: ['ክብደት መቀነስ', 'ፈጣን የልብ ምት', 'ጭንቀት', 'ሙቀት መቋቋም መቀነስ'],
    causes: ['Autoimmune antibodies'],
    causesAmharic: ['ኢሚዩን አንቲቦዲ'],
    prevention: ['No known prevention'],
    preventionAmharic: ['የታወቀ መከላከያ የለም'],
    treatment: ['Antithyroid meds', 'Radioiodine', 'Surgery (some)'],
    treatmentAmharic: ['ፀረ-ታይሮይድ መድሀኒት', 'ሬዲዮ-አዮዲን', 'ቀዶ ጥገና (አንዳንድ)'],
    severity: 'severe',
    bodyRegions: ['neck', 'heart', 'wholeBody'],
    videoUrl: null as any,
  },
  {
    id: '28',
    name: 'Celiac Disease',
    nameAmharic: 'ሴሊያክ በሽታ',
    category: 'autoimmune',
    description: 'An immune reaction to gluten causing intestinal damage.',
    descriptionAmharic: 'ግሉተን ላይ የኢሚዩን ምላሽ እና የአንጀት ጉዳት የሚያመጣ በሽታ።',
    symptoms: ['Diarrhea', 'Bloating', 'Weight loss', 'Anemia'],
    symptomsAmharic: ['ተቅማጥ', 'እብጠት', 'ክብደት መቀነስ', 'ደም እጥረት'],
    causes: ['Gluten-triggered immune response'],
    causesAmharic: ['በግሉተን የሚቀሰቀስ የኢሚዩን ምላሽ'],
    prevention: ['No known prevention'],
    preventionAmharic: ['የታወቀ መከላከያ የለም'],
    treatment: ['Gluten-free diet'],
    treatmentAmharic: ['ከግሉተን ነፃ አመጋገብ'],
    severity: 'moderate',
    bodyRegions: ['abdomen', 'intestines'],
    videoUrl: null as any,
  },
  {
    id: '29',
    name: "Sjögren's Syndrome",
    nameAmharic: 'ሾግረን ሲንድሮም',
    category: 'autoimmune',
    description: 'An autoimmune disease causing dry eyes and dry mouth.',
    descriptionAmharic: 'ደረቅ ዓይን እና ደረቅ አፍ የሚያመጣ ራስን በራስ በሽታ።',
    symptoms: ['Dry eyes', 'Dry mouth', 'Fatigue', 'Joint pain'],
    symptomsAmharic: ['ደረቅ ዓይን', 'ደረቅ አፍ', 'ድካም', 'የመገጣጠሚያ ህመም'],
    causes: ['Autoimmune reaction'],
    causesAmharic: ['የኢሚዩን ምላሽ'],
    prevention: ['No known prevention'],
    preventionAmharic: ['የታወቀ መከላከያ የለም'],
    treatment: ['Symptom relief', 'Eye drops', 'Hydration'],
    treatmentAmharic: ['ምልክት መቀነስ', 'የዓይን ነጠብጣብ', 'ፈሳሽ መጠጣት'],
    severity: 'moderate',
    bodyRegions: ['eyes', 'mouth', 'joints'],
    videoUrl: null as any,
  },
  {
    id: '30',
    name: 'Inflammatory Bowel Disease',
    nameAmharic: 'የአንጀት እብጠት (IBD)',
    category: 'autoimmune',
    description: 'Chronic inflammation of the digestive tract (e.g., Crohn’s disease, ulcerative colitis).',
    descriptionAmharic: 'የመፍጫ መንገድ ዘላቂ እብጠት (ለምሳሌ Crohn/ulcerative colitis)።',
    symptoms: ['Abdominal pain', 'Diarrhea', 'Blood in stool', 'Weight loss'],
    symptomsAmharic: ['የሆድ ህመም', 'ተቅማጥ', 'በሽንት ውስጥ ደም', 'ክብደት መቀነስ'],
    causes: ['Immune dysfunction', 'Genetics', 'Environment'],
    causesAmharic: ['የኢሚዩን መዛባት', 'የዘር ውርስ', 'አካባቢ'],
    prevention: ['No known prevention'],
    preventionAmharic: ['የታወቀ መከላከያ የለም'],
    treatment: ['Anti-inflammatory meds', 'Diet changes', 'Follow-up care'],
    treatmentAmharic: ['ፀረ-እብጠት መድሀኒት', 'አመጋገብ ለውጥ', 'ክትትል'],
    severity: 'severe',
    bodyRegions: ['abdomen', 'intestines'],
    videoUrl: null as any,
  },
  {
    id: '31',
    name: "Addison's Disease",
    nameAmharic: 'አዲሰን በሽታ',
    category: 'autoimmune',
    description: 'Adrenal gland insufficiency causing low cortisol.',
    descriptionAmharic: 'የአድሬናል ጉበት ሆርሞን እጥረት የሚያመጣ በሽታ።',
    symptoms: ['Fatigue', 'Weight loss', 'Low blood pressure', 'Skin darkening'],
    symptomsAmharic: ['ድካም', 'ክብደት መቀነስ', 'ዝቅተኛ የደም ግፊት', 'የቆዳ መጨመር'],
    causes: ['Autoimmune adrenalitis', 'Infections (rare)'],
    causesAmharic: ['ራስን በራስ ጥቃት', 'ኢንፌክሽን (አንዳንድ)'],
    prevention: ['No known prevention'],
    preventionAmharic: ['የታወቀ መከላከያ የለም'],
    treatment: ['Hormone replacement therapy'],
    treatmentAmharic: ['ሆርሞን መተካት ሕክምና'],
    severity: 'critical',
    bodyRegions: ['adrenalGlands', 'wholeBody'],
    videoUrl: null as any,
  },
];

export const DiseaseLibrary: React.FC<DiseaseLibraryProps> = ({
  diseases: propDiseases,
  searchQuery: initialSearchQuery,
  categoryFilter: initialCategoryFilter,
  onDiseaseSelect,
  language,
  userLocation: _userLocation,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [categoryFilter, setCategoryFilter] = useState<DiseaseCategory | 'all'>(initialCategoryFilter || 'all');
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBodyRegions, setSelectedBodyRegions] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [seasonalFilter, setSeasonalFilter] = useState<string>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(9);

  const diseases = propDiseases || mockDiseases;

  // Extract all unique symptoms from diseases for autocomplete
  const allSymptoms = useMemo(() => {
    const symptomSet = new Set<string>();
    diseases.forEach((disease) => {
      disease.symptoms.forEach((symptom) => {
        symptomSet.add(symptom);
      });
    });
    return Array.from(symptomSet).sort();
  }, [diseases]);

  const filteredDiseases = useMemo(() => {
    let filtered = diseases;

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((d) => d.category === categoryFilter);
    }

    // Filter by search query (name, description, symptoms)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.nameAmharic?.toLowerCase().includes(query) ||
          d.description.toLowerCase().includes(query) ||
          d.symptoms.some((s) => s.toLowerCase().includes(query)) ||
          d.causes.some((c) => c.toLowerCase().includes(query)),
      );
    }

    // Filter by selected symptoms
    if (selectedSymptoms.length > 0) {
      filtered = filtered.filter((d) =>
        selectedSymptoms.some((symptom) =>
          d.symptoms.some((s) => s.toLowerCase().includes(symptom.toLowerCase())),
        ),
      );
    }

    // Filter by body regions
    if (selectedBodyRegions.length > 0) {
      filtered = filtered.filter((d) =>
        selectedBodyRegions.some((region) => d.bodyRegions.includes(region)),
      );
    }

    // Filter by severity
    if (severityFilter !== 'all') {
      filtered = filtered.filter((d) => d.severity === severityFilter);
    }

    // Filter by urgency (based on severity and category)
    if (urgencyFilter !== 'all') {
      filtered = filtered.filter((d) => {
        if (urgencyFilter === 'emergency') {
          return d.severity === 'critical' || d.severity === 'severe';
        }
        if (urgencyFilter === 'chronic') {
          return d.category === 'chronic';
        }
        if (urgencyFilter === 'acute') {
          return d.category === 'infectious' || d.severity === 'moderate';
        }
        if (urgencyFilter === 'self-limiting') {
          return d.severity === 'mild';
        }
        return true;
      });
    }

    // Filter by seasonal
    if (seasonalFilter !== 'all') {
      filtered = filtered.filter((d) => {
        if (!d.seasonal || d.seasonal.length === 0) {
          return seasonalFilter === 'year-round';
        }
        return d.seasonal.some((season) => {
          const seasonLower = season.toLowerCase();
          if (seasonalFilter === 'rainy') {
            return seasonLower.includes('rainy') || seasonLower.includes('wet');
          }
          if (seasonalFilter === 'dry') {
            return seasonLower.includes('dry');
          }
          return true;
        });
      });
    }

    const computeMatchScore = (d: Disease) => {
      let score = 0;
      const reasons: string[] = [];

      if (selectedBodyRegions.length) {
        const bodyHits = selectedBodyRegions.filter((r) => d.bodyRegions.includes(r)).length;
        if (bodyHits > 0) {
          score += Math.min(bodyHits * 3, 6);
          reasons.push(`Body regions match (${bodyHits})`);
        }
      }

      if (selectedSymptoms.length) {
        const symptomHits = selectedSymptoms.filter((s) =>
          d.symptoms.some((ds) => ds.toLowerCase().includes(s.toLowerCase())),
        ).length;
        if (symptomHits > 0) {
          score += Math.min(symptomHits * 2, 4);
          reasons.push(`Symptom overlap (${symptomHits})`);
        }
      }

      // Mild bonus for severity alignment with urgency filter
      if (urgencyFilter === 'emergency' && (d.severity === 'critical' || d.severity === 'severe')) {
        score += 1;
        reasons.push('Urgency aligned');
      }
      return { score: Math.min(score, 10), reasons };
    };

    return filtered
      .map((d) => ({ disease: d, match: computeMatchScore(d) }))
      .sort((a, b) => b.match.score - a.match.score)
      .map(({ disease, match }) => ({ ...disease, match }));
  }, [
    diseases,
    categoryFilter,
    searchQuery,
    selectedBodyRegions,
    selectedSymptoms,
    severityFilter,
    urgencyFilter,
    seasonalFilter,
  ]);

  React.useEffect(() => {
    setVisibleCount(9);
  }, [searchQuery, categoryFilter, selectedBodyRegions, selectedSymptoms, severityFilter, urgencyFilter, seasonalFilter]);

  const handleDiseaseClick = (disease: Disease) => {
    setSelectedDisease(disease);
    setDialogOpen(true);
    onDiseaseSelect?.(disease);
  };

  const handleBodyRegionSelect = (region: string) => {
    setSelectedBodyRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region],
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setSelectedBodyRegions([]);
    setSelectedSymptoms([]);
    setSeverityFilter('all');
    setUrgencyFilter('all');
    setSeasonalFilter('all');
  };

  const getSeverityColor = (severity: Disease['severity']) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'severe':
        return 'error';
      case 'moderate':
        return 'warning';
      default:
        return 'info';
    }
  };

  const activeFiltersCount =
    (categoryFilter !== 'all' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0) +
    selectedBodyRegions.length +
    selectedSymptoms.length +
    (severityFilter !== 'all' ? 1 : 0) +
    (urgencyFilter !== 'all' ? 1 : 0) +
    (seasonalFilter !== 'all' ? 1 : 0);

  return (
    <Box>
      {/* Hero Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4eb6f2 0%, #4A90E2 60%, #2C3E50 100%)',
          color: 'white',
          py: 6,
          textAlign: 'center',
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          {t('diseases.title')}
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          {t('diseases.subtitle')}
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
        {/* Search and Quick Filters */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Stack spacing={3}>
            {/* Search Bar */}
            <TextField
              fullWidth
              placeholder={t('diseases.searchPlaceholder') || 'Search diseases, symptoms, or conditions...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
                endAdornment:
                  searchQuery.trim() && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchQuery('')}>
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              }}
            />

            {/* Symptom Autocomplete */}
            <Autocomplete
              multiple
              options={allSymptoms}
              value={selectedSymptoms}
              onChange={(_, newValue) => setSelectedSymptoms(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Filter by Symptoms"
                  placeholder="Type to search symptoms..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option}
                    label={option}
                    size="small"
                    sx={{
                      bgcolor: 'primary.light',
                      color: 'white',
                      '& .MuiChip-deleteIcon': {
                        color: 'white',
                      },
                    }}
                  />
                ))
              }
            />

            {/* Category Tabs */}
            <Box>
              <Tabs
                value={categoryFilter}
                onChange={(_, newValue) => setCategoryFilter(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    color: 'text.secondary',
                    fontWeight: 600,
                    textTransform: 'none',
                    minHeight: 48,
                    '&.Mui-selected': {
                      color: 'primary.main',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: 'primary.main',
                    height: 3,
                  },
                }}
              >
                <Tab label={t('diseases.all') || 'All'} value="all" />
                {diseaseCategories.map((cat) => (
                  <Tab
                    key={cat.value}
                    label={language === 'am' ? cat.labelAm : cat.label}
                    value={cat.value}
                  />
                ))}
              </Tabs>
            </Box>

            {/* Advanced Filters Toggle */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Button
                startIcon={<FilterList />}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                sx={{ color: 'primary.main' }}
              >
                Advanced Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </Button>
              {activeFiltersCount > 0 && (
                <Button
                  startIcon={<Clear />}
                  onClick={clearAllFilters}
                  size="small"
                  sx={{ color: 'text.secondary' }}
                >
                  Clear All
                </Button>
              )}
            </Box>

            {/* Advanced Filters Accordion */}
            <Accordion expanded={showAdvancedFilters} onChange={() => setShowAdvancedFilters(!showAdvancedFilters)}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography fontWeight={600}>Additional Filters</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Severity Level</InputLabel>
                      <Select
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value)}
                        label="Severity Level"
                      >
                        {severityLevels.map((level) => (
                          <MenuItem key={level.value} value={level.value}>
                            {level.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Urgency Level</InputLabel>
                      <Select
                        value={urgencyFilter}
                        onChange={(e) => setUrgencyFilter(e.target.value)}
                        label="Urgency Level"
                      >
                        {urgencyLevels.map((level) => (
                          <MenuItem key={level.value} value={level.value}>
                            {level.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Seasonal Pattern</InputLabel>
                      <Select
                        value={seasonalFilter}
                        onChange={(e) => setSeasonalFilter(e.target.value)}
                        label="Seasonal Pattern"
                      >
                        {seasonalOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </Paper>

        {/* Body Map Filter */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={700} sx={{ color: 'primary.main', mb: 2 }}>
            {t('diseases.filterByBodyRegion') || 'Filter by body region'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select multiple regions. Use presets for common scenarios such as respiratory issues (chest, lungs, throat) or digestive problems (stomach, intestines, liver).
          </Typography>
          <BodyMap
            onLocationSelect={handleBodyRegionSelect}
            onSelectionChange={setSelectedBodyRegions}
            selectedLocations={selectedBodyRegions}
          />
          {selectedBodyRegions.length > 0 && (
            <Button
              size="small"
              startIcon={<Clear />}
              onClick={() => setSelectedBodyRegions([])}
              sx={{ mt: 2, color: 'primary.main' }}
            >
              {t('diseases.clearFilter') || 'Clear body region filter'}
            </Button>
          )}
        </Paper>

        {/* Results Count */}
        <Box mb={3}>
          <Typography variant="body1" color="text.secondary">
            Found <strong>{filteredDiseases.length}</strong> disease{filteredDiseases.length !== 1 ? 's' : ''}
            {activeFiltersCount > 0 && ` (filtered from ${diseases.length} total)`}
          </Typography>
        </Box>

        {/* Disease Grid */}
        {filteredDiseases.length === 0 ? (
          <Paper elevation={2} sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t('diseases.noDiseasesFound') || 'No diseases found matching your criteria'}
            </Typography>
            <Button
              variant="outlined"
              onClick={clearAllFilters}
              sx={{ mt: 2 }}
              startIcon={<Clear />}
            >
              Clear All Filters
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredDiseases.slice(0, visibleCount).map((disease: Disease & { match?: { score: number; reasons: string[] } }) => (
              <Grid item xs={12} sm={6} md={4} key={disease.id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '2px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 8,
                      borderColor: 'primary.main',
                    },
                  }}
                  onClick={() => handleDiseaseClick(disease)}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Typography variant="h6" fontWeight={600} sx={{ color: 'primary.main', flex: 1 }}>
                        {language === 'am' && disease.nameAmharic ? disease.nameAmharic : disease.name}
                      </Typography>
                      <Chip
                        label={disease.severity}
                        size="small"
                        color={getSeverityColor(disease.severity)}
                        sx={{ ml: 1 }}
                      />
                    </Box>
                    {disease.match && (
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Chip
                          label={`Relevance ${disease.match.score}/10`}
                          size="small"
                          color={disease.match.score >= 7 ? 'success' : disease.match.score >= 4 ? 'warning' : 'default'}
                        />
                        {disease.match.reasons.slice(0, 1).map((reason) => (
                          <Typography key={reason} variant="caption" color="text.secondary">
                            {reason}
                          </Typography>
                        ))}
                      </Box>
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60 }}>
                      {disease.description.substring(0, 120)}...
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                      {disease.symptoms.slice(0, 3).map((symptom, idx) => (
                        <Chip
                          key={idx}
                          label={symptom}
                          size="small"
                          variant="outlined"
                          sx={{ borderColor: 'primary.light', color: 'primary.main' }}
                        />
                      ))}
                      {disease.symptoms.length > 3 && (
                        <Chip
                          label={`+${disease.symptoms.length - 3} more`}
                          size="small"
                          variant="outlined"
                          sx={{ borderColor: 'primary.light', color: 'primary.main' }}
                        />
                      )}
                    </Box>
                    {disease.seasonal && disease.seasonal.length > 0 && (
                      <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                        <Info fontSize="small" color="info" />
                        <Chip
                          icon={<Info />}
                          label={t('diseases.seasonal') || 'Seasonal'}
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {visibleCount < filteredDiseases.length && (
              <Grid item xs={12}>
                <Box display="flex" justifyContent="center" mt={2}>
                  <Button
                    variant="outlined"
                    onClick={() => setVisibleCount((c) => Math.min(filteredDiseases.length, c + 9))}
                  >
                    {language === 'am' ? 'ተጨማሪ አሳይ' : 'Load more'}
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        )}
      </Box>

      {/* Disease Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        {selectedDisease && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <Typography variant="h5" fontWeight={600} sx={{ color: 'primary.main' }}>
                  {language === 'am' && selectedDisease.nameAmharic
                    ? selectedDisease.nameAmharic
                    : selectedDisease.name}
                </Typography>
                <Chip
                  label={selectedDisease.severity}
                  color={getSeverityColor(selectedDisease.severity)}
                  size="medium"
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" paragraph>
                {selectedDisease.description}
              </Typography>

              <DiseaseSymptomsVideoSection videoUrl={selectedDisease.videoUrl} />

              <Typography variant="h6" gutterBottom mt={2} sx={{ color: 'primary.main' }}>
                {t('diseases.symptoms') || 'Symptoms'}
              </Typography>
              <List dense>
                {selectedDisease.symptoms.map((symptom, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon>
                      <Warning color="warning" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={symptom} />
                  </ListItem>
                ))}
              </List>

              <Typography variant="h6" gutterBottom mt={2} sx={{ color: 'primary.main' }}>
                {t('diseases.causes') || 'Causes'}
              </Typography>
              <List dense>
                {selectedDisease.causes.map((cause, idx) => (
                  <ListItem key={idx}>
                    <ListItemText primary={`• ${cause}`} />
                  </ListItem>
                ))}
              </List>

              <Typography variant="h6" gutterBottom mt={2} sx={{ color: 'primary.main' }}>
                {t('diseases.prevention') || 'Prevention'}
              </Typography>
              <List dense>
                {selectedDisease.prevention.map((prevention, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={prevention} />
                  </ListItem>
                ))}
              </List>

              <Typography variant="h6" gutterBottom mt={2} sx={{ color: 'primary.main' }}>
                {t('diseases.treatment') || 'Treatment'}
              </Typography>
              <List dense>
                {selectedDisease.treatment.map((treatment, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon>
                      <LocalHospital color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={treatment} />
                  </ListItem>
                ))}
              </List>

              {selectedDisease.progressionTimeline && selectedDisease.progressionTimeline.length > 0 && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                    Disease Progression Timeline
                  </Typography>
                  {selectedDisease.progressionTimeline.map((stage, idx) => (
                    <Paper
                      key={idx}
                      elevation={1}
                      sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: 'background.default',
                        borderRadius: 2,
                        borderLeft: '4px solid',
                        borderColor: 'primary.main',
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        {stage.stage} - {stage.duration}
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
                        {stage.symptoms.map((symptom, sIdx) => (
                          <Chip key={sIdx} label={symptom} size="small" variant="outlined" />
                        ))}
                      </Box>
                      <Chip
                        label={`Severity: ${stage.severity}`}
                        size="small"
                        color={
                          stage.severity === 'severe'
                            ? 'error'
                            : stage.severity === 'moderate'
                            ? 'warning'
                            : 'info'
                        }
                      />
                    </Paper>
                  ))}
                </Box>
              )}

              {selectedDisease.bodyRegions && selectedDisease.bodyRegions.length > 0 && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                    Affected Body Regions
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {selectedDisease.bodyRegions.map((region, idx) => (
                      <Chip
                        key={idx}
                        label={region}
                        size="small"
                        sx={{ bgcolor: 'primary.light', color: 'white' }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {selectedDisease.seasonal && selectedDisease.seasonal.length > 0 && (
                <Paper elevation={1} sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    {t('diseases.seasonalAlert') || 'Seasonal Alert'}
                  </Typography>
                  <Typography variant="body2">
                    {t('diseases.commonIn') || 'Common in'}: {selectedDisease.seasonal.join(', ')}
                  </Typography>
                </Paper>
              )}

              {selectedDisease.prevalence && (
                <Paper elevation={1} sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Regional Prevalence in Ethiopia
                  </Typography>
                  <Typography variant="body2">
                    Prevalence: <strong>{selectedDisease.prevalence.prevalence}</strong> in{' '}
                    {selectedDisease.prevalence.region}
                  </Typography>
                </Paper>
              )}

              {/* Hypertension Images Gallery */}
              {selectedDisease.id === '3' && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                    Visual Resources
                  </Typography>
                  <Grid container spacing={2}>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <Grid item xs={12} sm={6} md={4} key={num}>
                        <Box
                          component="img"
                          src={`/HBP${num}.png`}
                          alt={`Hypertension visual ${num}`}
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            const paths = [`/Hypertension/HBP${num}.png`, `/public/HBP${num}.png`, `/dist/HBP${num}.png`];
                            let currentPathIndex = paths.indexOf(img.src.split('/').pop() || '');
                            if (currentPathIndex < paths.length - 1) {
                              img.src = paths[currentPathIndex + 1];
                            } else {
                              img.style.display = 'none';
                            }
                          }}
                          sx={{
                            width: '100%',
                            height: 'auto',
                            borderRadius: 2,
                            border: '2px solid',
                            borderColor: 'primary.main',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: 2,
                            '&:hover': {
                              transform: 'scale(1.05)',
                              boxShadow: 6,
                              borderColor: 'primary.dark',
                            },
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                  <Typography variant="caption" color="text.secondary" mt={1} display="block" textAlign="center">
                    Click images to view full size
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setDialogOpen(false)}>{t('common.close') || 'Close'}</Button>
              <PrimaryButton
                onClick={() => {
                  setDialogOpen(false);
                }}
              >
                {t('diseases.checkSymptoms') || 'Check Symptoms'}
              </PrimaryButton>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};
