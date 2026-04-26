import { apiClient } from '@/services/apiClient';

export const professionalService = {
  async createProfessional(args: {
    email: string;
    fullName: string;
    role: 'doctor' | 'nurse';
    licenseNumber: string;
    password: string;
    phone?: string;
    specialization?: string;
    facilityId?: string;
  }) {
    // Prefer the modern facility-admin endpoints when available.
    // Fallback to /admin/professionals for older demo flows.
    if (args.role === 'doctor') {
      try {
        const res = await apiClient.post('/admin/doctor', {
          fullName: args.fullName,
          licenseNumber: args.licenseNumber,
          licenseDocument: null,
          specialization: 'General Practitioner',
          department: 'Outpatient',
          yearsExperience: 0,
          email: args.email,
          recoveryEmail: args.email,
          phoneNumber: args.phone || '0900000000',
          officialTitle: 'Doctor',
        });
        return res.data;
      } catch {
        // fall through
      }
    }

    if (args.role === 'nurse') {
      try {
        const res = await apiClient.post('/admin/nurse', {
          fullName: args.fullName,
          licenseNumber: args.licenseNumber,
          licenseDocument: null,
          department: 'Outpatient',
          yearsExperience: 0,
          email: args.email,
          recoveryEmail: args.email,
          phoneNumber: args.phone || '0900000000',
          officialTitle: 'Nurse',
        });
        return res.data;
      } catch {
        // fall through
      }
    }

    const res = await apiClient.post('/admin/professionals', {
      email: args.email,
      phone: args.phone,
      fullName: args.fullName,
      role: args.role,
      facilityId: args.facilityId,
      licenseNumber: args.licenseNumber,
      specialization: args.specialization,
      password: args.password,
    });
    return res.data;
  },
};

