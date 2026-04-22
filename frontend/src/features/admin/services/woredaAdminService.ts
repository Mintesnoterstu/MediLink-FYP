import { apiClient } from '@/services/apiClient';
import { CreateFacilityAdminPayload } from '@/components/admin/CreateFacilityAdminForm';
import { RegisterFacilityPayload } from '@/components/admin/RegisterFacilityForm';
import { FacilityAdminRow } from '@/components/admin/FacilityAdminsList';
import { FacilityRow } from '@/components/admin/FacilitiesList';

export interface LocalStats {
  totalFacilities: number;
  totalProfessionals: number;
  totalPatients: number;
}

export interface AuditRow {
  ts: string;
  action: string;
  details: Record<string, unknown>;
}

export const woredaAdminService = {
  createFacilityAdmin(payload: CreateFacilityAdminPayload) {
    return apiClient.post('/admin/facility-admin', payload).then((r) => r.data);
  },
  registerFacility(payload: RegisterFacilityPayload) {
    return apiClient.post('/admin/facility/register', payload).then((r) => r.data);
  },
  getFacilityAdmins(): Promise<FacilityAdminRow[]> {
    return apiClient.get('/admin/facility-admins').then((r) => r.data || []);
  },
  getFacilities(): Promise<FacilityRow[]> {
    return apiClient.get('/admin/facilities').then((r) => r.data || []);
  },
  getStatistics(): Promise<LocalStats> {
    return apiClient.get('/admin/woreda-statistics').then((r) => r.data);
  },
  getAudit(): Promise<AuditRow[]> {
    return apiClient.get('/admin/woreda-audit').then((r) => r.data || []);
  },
};
