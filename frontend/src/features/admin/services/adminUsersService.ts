import { apiClient } from '@/services/apiClient';

export type AdminUserUpdate = {
  fullName?: string;
  phone?: string | null;
};

export const adminUsersService = {
  async updateUser(userId: string, payload: AdminUserUpdate) {
    const res = await apiClient.put(`/admin/users/${userId}`, payload);
    return res.data;
  },
  async setUserStatus(userId: string, isActive: boolean) {
    const res = await apiClient.put(`/admin/users/${userId}/status`, { isActive });
    return res.data;
  },
  async suspendUser(userId: string) {
    const res = await apiClient.put(`/admin/users/${userId}/suspend`);
    return res.data;
  },
  async resetPassword(userId: string) {
    const res = await apiClient.post(`/admin/users/${userId}/reset-password`);
    return res.data as { success: boolean; tempPassword: string; user: { id: string; email: string; full_name: string } };
  },
};

