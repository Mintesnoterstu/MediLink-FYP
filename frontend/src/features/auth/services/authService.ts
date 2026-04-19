import { User, UserRole } from '@/types';
import { apiClient } from '@/services/apiClient';

export const authService = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data?.requires2fa) {
        const challengeToken = response.data?.challengeToken;
        const devOtp = response.data?.devOtp;
        if (!challengeToken || !devOtp) {
          throw new Error('2FA is required. OTP verification UI is not available.');
        }
        const verifyResponse = await apiClient.post('/auth/verify-2fa', {
          challengeToken,
          otp: devOtp,
        });
        return verifyResponse.data;
      }
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  },

  async register(
    email: string,
    password: string,
    name: string,
    role: UserRole
  ): Promise<{ user: User; token: string }> {
    try {
      const response = await apiClient.post('/auth/register', { email, password, name, role });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  },

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.patch(`/auth/users/${userId}`, userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Update failed');
    }
  },

  async resetPassword(email: string): Promise<void> {
    try {
      await apiClient.post('/auth/reset-password', { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Password reset failed');
    }
  },
};

