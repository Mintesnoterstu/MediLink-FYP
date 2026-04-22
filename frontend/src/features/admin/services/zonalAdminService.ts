import { apiClient } from '@/services/apiClient';

export type WoredaOption =
  | 'Jimma'
  | 'Seka'
  | 'Gera'
  | 'Gomma'
  | 'Mana'
  | 'Limmu Kosa'
  | 'Kersa'
  | 'Dedo'
  | 'Omo Nada'
  | 'Sigimo';

export interface CreateWoredaAdminPayload {
  woredaName: WoredaOption;
  fullName: string;
  email: string;
  recoveryEmail: string;
  phoneNumber: string;
  officialTitle: string;
}

export interface CreateCityAdminPayload {
  cityName: 'Jimma City';
  fullName: string;
  email: string;
  recoveryEmail: string;
  phoneNumber: string;
  officialTitle: string;
}

export interface ZoneStats {
  totalWoredas: number;
  totalFacilities: number;
  totalProfessionals: number;
  totalPatients: number;
}

export interface AdminRow {
  id: string;
  woreda_name?: string;
  city?: string;
  full_name: string;
  email: string;
  created_at: string;
  is_active: boolean;
}

export interface AuditRow {
  ts: string;
  action: string;
  details: Record<string, unknown>;
}

export interface CreatedAdminResponse {
  id: string;
  email: string;
  full_name: string;
  role: 'woreda_admin' | 'city_admin';
  temporaryPassword: string;
  emailDelivered: boolean;
  emailError?: string | null;
}

export interface EmailStatusResponse {
  mode: 'smtp' | 'json' | 'none';
  configured: boolean;
  message: string;
}

export const zonalAdminService = {
  createWoredaAdmin(payload: CreateWoredaAdminPayload): Promise<CreatedAdminResponse> {
    return apiClient.post('/admin/woreda', payload).then((r) => r.data);
  },
  createCityAdmin(payload: CreateCityAdminPayload): Promise<CreatedAdminResponse> {
    return apiClient.post('/admin/city', payload).then((r) => r.data);
  },
  getWoredaAdmins(): Promise<AdminRow[]> {
    return apiClient.get('/admin/woredas').then((r) => r.data || []);
  },
  getCityAdmins(): Promise<AdminRow[]> {
    return apiClient.get('/admin/city').then((r) => r.data || []);
  },
  getStatistics(): Promise<ZoneStats> {
    return apiClient.get('/admin/statistics').then((r) => r.data);
  },
  getAuditLogs(): Promise<AuditRow[]> {
    return apiClient.get('/admin/audit').then((r) => r.data || []);
  },
  getEmailStatus(): Promise<EmailStatusResponse> {
    return apiClient.get('/admin/email-status').then((r) => r.data);
  },
};
