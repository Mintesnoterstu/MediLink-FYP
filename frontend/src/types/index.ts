// User and Authentication Types
// NOTE: Keep base roles stable to avoid breaking existing UI/routes.
export type UserRole = 'patient' | 'provider' | 'admin';

// Jimma Zone admin hierarchy (for role === 'admin')
export type AdminLevel = 'zonal' | 'woreda' | 'city' | 'facility';

// Health professional types (for role === 'provider')
export type HealthProfessionalType = 'doctor' | 'nurse';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  language: 'en' | 'am';
  createdAt: string;

  // Optional fields to model Jimma Zone hierarchy without breaking existing mocks
  adminLevel?: AdminLevel;
  zone?: string; // e.g., "Jimma"
  woreda?: string; // e.g., "Seka"
  city?: string; // e.g., "Jimma City"
  facility?: string; // e.g., "Jimma Hospital"

  professionalType?: HealthProfessionalType;
  licenseNumber?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

// Health Data Types
export interface PatientData {
  id: string;
  userId: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  medicalHistory: MedicalRecord[];
  currentMedications: Medication[];
  allergies: Allergy[];
  vitalSigns: VitalSigns[];
  emergencyContacts: EmergencyContact[];
  location?: string;
  appointments?: Appointment[];
  consentRecords?: ConsentRecord[];
  notificationPreferences?: NotificationPreferences;
}

export interface MedicalRecord {
  id: string;
  date: string;
  providerId: string;
  providerName: string;
  diagnosis: string;
  notes: string;
  attachments?: string[];
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  pharmacy?: string;
  reminderEnabled: boolean;
}

export interface Allergy {
  id: string;
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction: string;
}

export interface VitalSigns {
  date: string;
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  bloodSugar?: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

// Symptom Tracking Types
export interface Symptom {
  id: string;
  name: string;
  nameAmharic?: string;
  severity: number; // 1-10
  location?: string;
  duration: string;
  notes?: string;
}

export interface SymptomAnalysis {
  id: string;
  symptoms: Symptom[];
  possibleConditions: ConditionProbability[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  confidence: number; // 0-1
  timestamp: string;
}

export interface ConditionProbability {
  condition: string;
  conditionAmharic?: string;
  probability: number;
  description: string;
}

// AI Service Types
export interface AIRecommendation {
  id: string;
  type: 'symptom' | 'medication' | 'lifestyle' | 'emergency';
  title: string;
  message: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
}

export interface AIConversation {
  id: string;
  messages: AIMessage[];
  patientContext: Partial<PatientData>;
  timestamp: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  confidence?: number;
}

// Appointment Types
export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  providerName: string;
  date: string;
  time: string;
  type: 'consultation' | 'follow-up' | 'emergency';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

// Consent Types
export interface ConsentRecord {
  id: string;
  providerId: string;
  providerName: string;
  permissions: ConsentPermission[];
  grantedAt: string;
  expiresAt?: string;
  revokedAt?: string;
}

export interface ConsentPermission {
  type: 'records' | 'medications' | 'vitals' | 'symptoms';
  access: 'read' | 'write';
}

// UI Types
export type Theme = 'light' | 'dark';
export type Language = 'en' | 'am';

export interface UIState {
  theme: Theme;
  language: Language;
  notifications: Notification[];
  isLoading: boolean;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// Emergency Types
export interface EmergencyAlert {
  id: string;
  type: 'ai-detected' | 'manual' | 'vital-signs';
  severity: 'high' | 'critical';
  location?: string;
  details: string;
  timestamp: string;
  resolved: boolean;
}

// Medication Adherence Types
export interface MedicationAdherence {
  medicationId: string;
  medicationName: string;
  adherenceRate: number; // 0-100 percentage
  missedDoses: number;
  totalDoses: number;
  lastTaken?: string;
  nextDose?: string;
}

// Health Trend Types
export interface HealthTrend {
  metric: string;
  dataPoints: Array<{
    date: string;
    value: number;
  }>;
  trend: 'improving' | 'stable' | 'declining';
  unit?: string;
}

// Notification Preferences
export interface NotificationPreferences {
  appointmentReminders: boolean;
  medicationReminders: boolean;
  healthAlerts: boolean;
  aiRecommendations: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

// Public Portal Types
export interface Disease {
  id: string;
  name: string;
  nameAmharic?: string;
  category: DiseaseCategory;
  description: string;
  descriptionAmharic?: string;
  symptoms: string[];
  symptomsAmharic?: string[];
  causes: string[];
  causesAmharic?: string[];
  prevention: string[];
  preventionAmharic?: string[];
  treatment: string[];
  treatmentAmharic?: string[];
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  prevalence?: RegionalPrevalence;
  seasonal?: string[];
  seasonalAmharic?: string[];
  bodyRegions: string[];
  progressionTimeline?: DiseaseStage[];
  visualAssets?: DiseaseVisuals;
}

export type DiseaseCategory =
  | 'infectious'
  | 'chronic'
  | 'respiratory'
  | 'maternal-child'
  | 'tropical'
  | 'common-ailments'
  | 'autoimmune';

export interface DiseaseStage {
  stage: string;
  duration: string;
  symptoms: string[];
  severity: 'mild' | 'moderate' | 'severe';
}

export interface DiseaseVisuals {
  bodyMapRegions: string[];
  symptomIcons: string[];
  infographics: string[];
  flowcharts: string[];
}

export interface RegionalPrevalence {
  region: string;
  prevalence: 'low' | 'medium' | 'high';
  seasonalVariation?: Record<string, number>;
}

export interface VerifiedRemedy {
  id: string;
  name: string;
  nameAmharic?: string;
  nameOromo?: string;
  nameTigrinya?: string;
  category: RemedyCategory;
  bodyPart?: string;
  healthGoal?: string;
  description: string;
  descriptionAmharic?: string;
  preparation: string;
  preparationAmharic?: string;
  dosage: string;
  dosageAmharic?: string;
  indications: string[];
  indicationsAmharic?: string[];
  contraindications: string[];
  contraindicationsAmharic?: string[];
  verificationLevel: VerificationLevel;
  ministryApproved: boolean;
  scientificEvidence: EvidenceLevel;
  safetyWarnings: string[];
  safetyWarningsAmharic?: string[];
  medicationInteractions: string[];
  regionalVariations?: string[];
  culturalContext: string;
  culturalContextAmharic?: string;
  modernCorrelation?: string;
}

export type RemedyCategory =
  | 'herbal'
  | 'traditional-practices'
  | 'food-medicine'
  | 'spiritual'
  | 'modern-traditional'
  | 'traditional'
  | 'modern';

export type VerificationLevel = 'verified' | 'under-review' | 'unverified';
export type EvidenceLevel = 'strong' | 'moderate' | 'anecdotal' | 'none';

export interface AICapability {
  id: string;
  title: string;
  description: string;
  accuracy: number;
  limitations: string[];
  useCases: string[];
}

export interface PerformanceStats {
  totalQueries: number;
  accuracyRate: number;
  averageConfidence: number;
  userSatisfaction: number;
  responseTime: number;
}

export interface CaseStudy {
  id: string;
  title: string;
  scenario: string;
  aiAnalysis: string;
  outcome: string;
  anonymized: boolean;
}

export interface PlatformStats {
  usersHelped: number;
  aiAccuracy: number;
  diseasesCovered: number;
  remediesVerified: number;
  activeUsers: number;
}

