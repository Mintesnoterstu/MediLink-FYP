import { apiClient } from '@/services/apiClient';

export interface ProfessionalPatientSearchResult {
  id: string;
  ethiopian_health_id: string;
  full_name: string;
  has_active_consent: boolean;
}

export interface ProfessionalMyPatient {
  id: string;
  ethiopian_health_id: string;
  full_name: string;
  scope: Record<string, unknown> | string;
  expires_at: string | null;
  last_access?: string | null;
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

  async requestConsentByHealthId(ethiopianHealthId: string, reason?: string) {
    const response = await apiClient.post('/professional/consent/request', {
      ethiopianHealthId,
      reason: reason || '',
    });
    return response.data;
  },

  async getPendingConsentRequests() {
    const response = await apiClient.get('/professional/consents/pending');
    return response.data;
  },

  async cancelPendingConsentRequest(requestId: string) {
    const response = await apiClient.delete(`/professional/consents/pending/${requestId}`);
    return response.data;
  },

  async getPatientDataWithConsent(patientId: string) {
    const response = await apiClient.get(`/professional/patient/${patientId}`);
    return response.data;
  },

  async getMyPatients(): Promise<ProfessionalMyPatient[]> {
    const response = await apiClient.get('/professional/patients');
    return response.data;
  },

  async getPatientDashboard(patientId: string) {
    const response = await apiClient.get(`/professional/patient/${patientId}/dashboard`);
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

  async addDiagnosis(patientId: string, encryptedData: Record<string, unknown>, recordDate?: string) {
    const response = await apiClient.post(`/professional/patient/${patientId}/diagnosis`, { encryptedData, recordDate });
    return response.data;
  },

  async addPrescription(patientId: string, encryptedData: Record<string, unknown>, recordDate?: string) {
    const response = await apiClient.post(`/professional/patient/${patientId}/prescription`, { encryptedData, recordDate });
    return response.data;
  },

  async orderLab(patientId: string, encryptedData: Record<string, unknown>, recordDate?: string) {
    const response = await apiClient.post(`/professional/patient/${patientId}/lab`, { encryptedData, recordDate });
    return response.data;
  },

  async addClinicalNote(patientId: string, encryptedData: Record<string, unknown>, recordDate?: string) {
    const response = await apiClient.post(`/professional/patient/${patientId}/note`, { encryptedData, recordDate });
    return response.data;
  },

  async saveVitals(patientId: string, encryptedData: Record<string, unknown>, recordDate?: string) {
    const response = await apiClient.post(`/professional/patient/${patientId}/vitals`, { encryptedData, recordDate });
    return response.data;
  },

  async saveSymptoms(patientId: string, encryptedData: Record<string, unknown>, recordDate?: string) {
    const response = await apiClient.post(`/professional/patient/${patientId}/symptoms`, { encryptedData, recordDate });
    return response.data;
  },

  async saveExamination(patientId: string, encryptedData: Record<string, unknown>, recordDate?: string) {
    const response = await apiClient.post(`/professional/patient/${patientId}/examination`, { encryptedData, recordDate });
    return response.data;
  },

  async saveTreatment(patientId: string, encryptedData: Record<string, unknown>, recordDate?: string) {
    const response = await apiClient.post(`/professional/patient/${patientId}/treatment`, { encryptedData, recordDate });
    return response.data;
  },

  async saveClinicalNotes(patientId: string, encryptedData: Record<string, unknown>, recordDate?: string) {
    const response = await apiClient.post(`/professional/patient/${patientId}/notes`, { encryptedData, recordDate });
    return response.data;
  },

  async saveCompletePatientData(patientId: string, payload: Record<string, unknown>) {
    const response = await apiClient.post(`/professional/patient/${patientId}/complete`, payload);
    return response.data;
  },
};

