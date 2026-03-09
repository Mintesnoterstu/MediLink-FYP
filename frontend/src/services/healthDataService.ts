import axios from 'axios';
import {
  PatientData,
  Appointment,
  SymptomAnalysis,
  AIRecommendation,
  Medication,
  VitalSigns,
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Development mode: Use mock data when API is not available
const DEV_MODE = import.meta.env.DEV || !import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mock data for development
const mockPatientData: PatientData = {
  id: 'patient-1',
  userId: 'user-1',
  age: 35,
  gender: 'male',
  medicalHistory: [
    {
      id: 'record-1',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      providerId: 'provider-1',
      providerName: 'Dr. Alemayehu',
      diagnosis: 'Hypertension',
      notes: 'Blood pressure elevated, prescribed medication',
    },
  ],
  currentMedications: [
    {
      id: 'med-1',
      name: 'Amlodipine',
      dosage: '5mg',
      frequency: 'Once daily',
      startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      reminderEnabled: true,
    },
  ],
  allergies: [],
  vitalSigns: [
    {
      date: new Date().toISOString(),
      bloodPressure: '130/85',
      heartRate: 78,
      temperature: 36.8,
      weight: 75,
    },
    {
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      bloodPressure: '135/88',
      heartRate: 82,
      temperature: 36.9,
      weight: 76,
    },
  ],
  emergencyContacts: [
    {
      id: 'contact-1',
      name: 'Emergency Contact',
      relationship: 'Family',
      phone: '+251911234567',
      isPrimary: true,
    },
  ],
  location: 'Addis Ababa, Ethiopia',
};

const mockAppointments: Appointment[] = [
  {
    id: 'apt-1',
    patientId: 'patient-1',
    providerId: 'provider-1',
    providerName: 'Dr. Alemayehu',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    time: '10:00 AM',
    type: 'consultation',
    status: 'scheduled',
  },
  {
    id: 'apt-2',
    patientId: 'patient-1',
    providerId: 'provider-1',
    providerName: 'Dr. Alemayehu',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    time: '2:00 PM',
    type: 'follow-up',
    status: 'completed',
    notes: 'Follow-up appointment completed',
  },
];

const mockAIRecommendations: AIRecommendation[] = [
  {
    id: 'rec-1',
    type: 'lifestyle',
    title: 'Blood Pressure Management',
    message: 'Continue monitoring your blood pressure daily. Maintain a low-salt diet and regular exercise.',
    confidence: 0.85,
    priority: 'high',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'rec-2',
    type: 'medication',
    title: 'Medication Adherence',
    message: 'Take your medication at the same time each day for best results.',
    confidence: 0.9,
    priority: 'high',
    timestamp: new Date().toISOString(),
  },
];

export const healthDataService = {
  async getPatientData(patientId: string): Promise<PatientData> {
    // Development mode: Return mock data
    if (DEV_MODE) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return { ...mockPatientData, userId: patientId };
    }

    try {
      const response = await api.get(`/patients/${patientId}`);
      return response.data;
    } catch (error: any) {
      // Fallback to mock data on error
      console.warn('API failed, using mock data:', error.message);
      return { ...mockPatientData, userId: patientId };
    }
  },

  async updatePatientData(patientId: string, data: Partial<PatientData>): Promise<PatientData> {
    try {
      const response = await api.patch(`/patients/${patientId}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update patient data');
    }
  },

  async getAppointments(patientId: string): Promise<Appointment[]> {
    // Development mode: Return mock data
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockAppointments.filter(apt => apt.patientId === patientId);
    }

    try {
      const response = await api.get(`/patients/${patientId}/appointments`);
      return response.data;
    } catch (error: any) {
      // Fallback to mock data on error
      console.warn('API failed, using mock appointments:', error.message);
      return mockAppointments.filter(apt => apt.patientId === patientId);
    }
  },

  async createAppointment(appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
    try {
      const response = await api.post('/appointments', appointment);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create appointment');
    }
  },

  async updateAppointment(appointment: Appointment): Promise<Appointment> {
    try {
      const response = await api.patch(`/appointments/${appointment.id}`, appointment);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update appointment');
    }
  },

  async getSymptomAnalyses(patientId: string): Promise<SymptomAnalysis[]> {
    // Development mode: Return empty array
    if (DEV_MODE) {
      return [];
    }

    try {
      const response = await api.get(`/patients/${patientId}/symptom-analyses`);
      return response.data;
    } catch (error: any) {
      console.warn('API failed, returning empty symptom analyses:', error.message);
      return [];
    }
  },

  async getAIRecommendations(patientId: string): Promise<AIRecommendation[]> {
    // Development mode: Return mock data
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockAIRecommendations;
    }

    try {
      const response = await api.get(`/patients/${patientId}/ai-recommendations`);
      return response.data;
    } catch (error: any) {
      // Fallback to mock data on error
      console.warn('API failed, using mock recommendations:', error.message);
      return mockAIRecommendations;
    }
  },

  async updateMedication(medication: Medication): Promise<Medication> {
    try {
      const response = await api.patch(`/medications/${medication.id}`, medication);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update medication');
    }
  },

  async addMedication(medication: Omit<Medication, 'id'>): Promise<Medication> {
    try {
      const response = await api.post('/medications', medication);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add medication');
    }
  },

  async removeMedication(medicationId: string): Promise<void> {
    try {
      await api.delete(`/medications/${medicationId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to remove medication');
    }
  },

  async addVitalSigns(vitals: VitalSigns): Promise<void> {
    try {
      await api.post('/vital-signs', vitals);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add vital signs');
    }
  },
};

