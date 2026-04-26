import { apiClient } from '@/services/apiClient';

export const recordService = {
  async addMedicalRecord(args: {
    patientId: string;
    recordType: string;
    recordDate?: string;
    encryptedData: Record<string, unknown>;
  }) {
    const res = await apiClient.post('/professional/records', args);
    return res.data;
  },
  async updateMedicalRecord(args: { recordId: string; encryptedData: Record<string, unknown> }) {
    const res = await apiClient.put(`/professional/records/${args.recordId}`, { encryptedData: args.encryptedData });
    return res.data;
  },
};

