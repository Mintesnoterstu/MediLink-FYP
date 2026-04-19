import { apiClient } from '@/services/apiClient';

export interface RegisterPatientInput {
  email: string;
  phone: string;
  fullName: string;
  ethiopianHealthId: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  facilityId?: string;
  encryptedData?: Record<string, unknown>;
}

export const patientRegistrationService = {
  async registerPatient(args: RegisterPatientInput) {
    const response = await apiClient.post('/patients/register', args);
    return response.data;
  },
};

