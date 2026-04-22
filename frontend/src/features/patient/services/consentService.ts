import { apiClient } from '@/services/apiClient';

export interface PendingConsentRequest {
  id: string;
  patient_id: string;
  doctor_id: string;
  doctor_name?: string | null;
  facility_name?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  reason?: string | null;
}

export interface ConsentRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  status: 'pending' | 'active' | 'revoked' | 'expired';
  scope: Record<string, unknown>;
  granted_at?: string | null;
  expires_at?: string | null;
  revoked_at?: string | null;
}

export const consentService = {
  async getPendingRequests(): Promise<PendingConsentRequest[]> {
    const response = await apiClient.get('/patient/consents/requests');
    return response.data;
  },

  async getActiveConsents(): Promise<ConsentRecord[]> {
    const response = await apiClient.get('/patient/consents/active');
    return response.data;
  },

  async getConsentHistory(): Promise<ConsentRecord[]> {
    const response = await apiClient.get('/patient/consents/history');
    return response.data;
  },

  async grantConsent(args: {
    requestId: string;
    scope?: Record<string, unknown>;
    durationDays?: number;
  }) {
    const response = await apiClient.post(`/consents/grant/${args.requestId}`, {
      scope: args.scope,
      durationDays: args.durationDays,
    });
    return response.data;
  },

  async grantConsentForPatient(args: {
    requestId: string;
    scope?: Record<string, unknown>;
    durationDays?: number;
  }) {
    const response = await apiClient.post(`/patient/consents/grant/${args.requestId}`, {
      scope: args.scope,
      durationDays: args.durationDays,
    });
    return response.data;
  },

  async revokeConsent(args: { consentId: string }) {
    const response = await apiClient.delete(`/patient/consents/${args.consentId}/revoke`);
    return response.data;
  },

  async getAccessAudit() {
    const response = await apiClient.get('/patient/audit');
    return response.data;
  },

  async approveRecord(recordId: string) {
    const response = await apiClient.post(`/patient/consents/records/${recordId}/approve`);
    return response.data;
  },

  async disputeRecord(recordId: string, reason: string) {
    const response = await apiClient.post(`/patient/consents/records/${recordId}/dispute`, { reason });
    return response.data;
  },

  async denyConsentRequest(requestId: string) {
    const response = await apiClient.post(`/patient/consents/deny/${requestId}`);
    return response.data;
  },

  async getPendingApprovals() {
    const response = await apiClient.get('/patient/consents/approvals/pending');
    return response.data;
  },
};

