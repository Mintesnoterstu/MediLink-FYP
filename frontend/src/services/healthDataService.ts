import {
  PatientData,
  Appointment,
  SymptomAnalysis,
  AIRecommendation,
  Medication,
  VitalSigns,
} from '@/types';
import { apiClient } from '@/services/apiClient';

export const healthDataService = {
  async getPatientData(patientId: string): Promise<PatientData> {
    try {
      const response = await apiClient.get(`/patients/${patientId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to load patient data');
    }
  },

  async updatePatientData(patientId: string, data: Partial<PatientData>): Promise<PatientData> {
    try {
      const response = await apiClient.patch(`/patients/${patientId}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update patient data');
    }
  },

  async getAppointments(patientId: string): Promise<Appointment[]> {
    try {
      const response = await apiClient.get('/appointments');
      return (response.data || [])
        .filter((apt: any) => apt.patient_id === patientId)
        .map(
          (apt: any): Appointment => ({
            id: apt.id,
            patientId: apt.patient_id,
            providerId: apt.doctor_id,
            providerName: apt.provider_name || 'Assigned provider',
            date: apt.appointment_date,
            time: new Date(apt.appointment_date).toLocaleTimeString(),
            type: apt.reason || 'consultation',
            status: apt.status,
            notes: apt.notes || undefined,
          }),
        );
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to load appointments');
    }
  },

  async createAppointment(appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
    try {
      const response = await apiClient.post('/appointments', appointment);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create appointment');
    }
  },

  async updateAppointment(appointment: Appointment): Promise<Appointment> {
    try {
      const response = await apiClient.patch(`/appointments/${appointment.id}`, appointment);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update appointment');
    }
  },

  async getSymptomAnalyses(patientId: string): Promise<SymptomAnalysis[]> {
    void patientId;
    return [];
  },

  async getAIRecommendations(patientId: string): Promise<AIRecommendation[]> {
    void patientId;
    return [];
  },

  async updateMedication(medication: Medication): Promise<Medication> {
    try {
      const response = await apiClient.patch(`/medications/${medication.id}`, medication);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update medication');
    }
  },

  async addMedication(medication: Omit<Medication, 'id'>): Promise<Medication> {
    try {
      const response = await apiClient.post('/medications', medication);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add medication');
    }
  },

  async removeMedication(medicationId: string): Promise<void> {
    try {
      await apiClient.delete(`/medications/${medicationId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to remove medication');
    }
  },

  async addVitalSigns(vitals: VitalSigns): Promise<void> {
    try {
      await apiClient.post('/vital-signs', vitals);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add vital signs');
    }
  },
};

