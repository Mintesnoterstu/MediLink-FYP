import { apiClient } from '@/services/apiClient';

export interface ProfessionalPatientSearchResult {
  id: string;
  ethiopian_health_id: string;
  full_name: string;
  has_active_consent: boolean;
}

export const professionalDataService = {
  async searchPatients(query: string): Promise<ProfessionalPatientSearchResult[]> {
    const response = await apiClient.get('/professional/patients/search', {
      params: { q: query },
    });
    return response.data;
  },

  async requestConsent(patientId: string, reason?: string) {
    const response = await apiClient.post('/professional/consent/request', {
      patientId,
      reason: reason || '',
    });
    return response.data;
  },

  async getPendingConsentRequests() {
    const response = await apiClient.get('/professional/consents/pending');
    return response.data;
  },

  async getPatientDataWithConsent(patientId: string) {
    const response = await apiClient.get(`/professional/patient/${patientId}`);
    return response.data;
  },

  async getMyPatients() {
    const response = await apiClient.get('/professional/patients');
    return response.data;
  },

  async getPendingApprovals() {
    const response = await apiClient.get('/professional/approvals/pending');
    return response.data;
  },

  async createHealthRecord(payload: {
    patientId: string;
    recordType: string;
    recordDate?: string;
    encryptedData: Record<string, unknown>;
  }) {
    const response = await apiClient.post('/professional/records', payload);
    return response.data;
  },

  async updateHealthRecord(recordId: string, encryptedData: Record<string, unknown>) {
    const response = await apiClient.put(`/professional/records/${recordId}`, { encryptedData });
    return response.data;
  },
};

