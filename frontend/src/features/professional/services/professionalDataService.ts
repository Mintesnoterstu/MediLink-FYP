import { apiClient } from '@/services/apiClient';

export interface ProfessionalPatientSearchResult {
  id: string;
  ethiopian_health_id: string;
  full_name: string;
  has_active_consent: boolean;
}

export const professionalDataService = {
  async searchPatients(query: string): Promise<ProfessionalPatientSearchResult[]> {
    const response = await apiClient.get('/patients/search', {
      params: { q: query },
    });
    return response.data;
  },

  async requestConsent(patientId: string, reason?: string) {
    const response = await apiClient.post('/professionals/consents/request', {
      patientId,
      reason: reason || '',
    });
    return response.data;
  },

  async getPatientDataWithConsent(patientId: string) {
    const response = await apiClient.get(`/patients/${patientId}`);
    return response.data;
  },

  async createHealthRecord(payload: {
    patientId: string;
    recordType: string;
    recordDate?: string;
    encryptedData: Record<string, unknown>;
  }) {
    const response = await apiClient.post('/professionals/records', payload);
    return response.data;
  },
};

