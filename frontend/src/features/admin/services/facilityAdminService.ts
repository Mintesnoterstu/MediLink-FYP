import { apiClient } from '@/services/apiClient';
import { CreateDoctorPayload } from '@/components/admin/CreateDoctorForm';
import { CreateNursePayload } from '@/components/admin/CreateNurseForm';
import { RegisterPatientPayload } from '@/components/admin/RegisterPatientForm';

export const facilityAdminService = {
  createDoctor(payload: CreateDoctorPayload) {
    return apiClient.post('/admin/doctor', payload).then((r) => r.data);
  },
  createNurse(payload: CreateNursePayload) {
    return apiClient.post('/admin/nurse', payload).then((r) => r.data);
  },
  checkDuplicate(params: { kebeleIdNumber?: string; phoneNumber?: string; fullName?: string; dateOfBirth?: string }) {
    return apiClient
      .get('/admin/patient/check-duplicate', {
        params: {
          kebeleId: params.kebeleIdNumber || '',
          phone: params.phoneNumber || '',
          fullName: params.fullName || '',
          dateOfBirth: params.dateOfBirth || '',
        },
      })
      .then((r) => r.data);
  },
  registerPatient(payload: RegisterPatientPayload) {
    return apiClient.post('/admin/patient/register', payload).then((r) => r.data);
  },
  getDoctors() {
    return apiClient.get('/admin/doctors').then((r) => r.data || []);
  },
  getNurses() {
    return apiClient.get('/admin/nurses').then((r) => r.data || []);
  },
  getPatients() {
    return apiClient.get('/admin/patients').then((r) => r.data || []);
  },
  getStatistics() {
    return apiClient.get('/admin/facility-statistics').then((r) => r.data);
  },
  getAudit() {
    return apiClient.get('/admin/facility-audit').then((r) => r.data || []);
  },
};
