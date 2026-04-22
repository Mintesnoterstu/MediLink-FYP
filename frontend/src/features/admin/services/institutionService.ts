import { apiClient } from '@/services/apiClient';

export interface CreateFacilityPayload {
  name: string;
  nameAm?: string;
  type: string;
  typeAm?: string;
  woredaId: string;
  licenseNumber: string;
}

export const institutionService = {
  async listInstitutions() {
    // Backwards-compatible helper for older admin dashboards
    return apiClient.get('/admin/facilities').then((r) => r.data || []);
  },
  async createFacility(payload: CreateFacilityPayload) {
    // UI demo uses lower-case values; backend expects specific casing.
    const normalizeType = (t: string) => {
      const x = (t || '').trim().toLowerCase();
      if (x === 'hospital') return 'Hospital';
      if (x === 'health center' || x === 'health_center' || x === 'healthcenter') return 'Health Center';
      if (x === 'clinic') return 'Clinic';
      return t;
    };

    return apiClient
      .post('/admin/facility/register', {
        facilityName: payload.name,
        facilityType: normalizeType(payload.type),
        licenseNumber: payload.licenseNumber,
        licenseDocument: null,
        facilityAddress: 'N/A',
        facilityPhone: '0900000000',
        facilityEmail: `facility.${Date.now()}@medilink.demo`,
      })
      .then((r) => r.data);
  },
};

