import axios from 'axios';
import { User, UserRole } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const DEV_MODE = import.meta.env.DEV || !import.meta.env.VITE_API_BASE_URL;

const TEST_USERS = {
  'patient@medilink.test': {
    password: 'patient123',
    role: 'patient' as UserRole,
    name: 'Test Patient',
    zone: 'Jimma',
  },
  'provider@medilink.test': {
    password: 'provider123',
    role: 'provider' as UserRole,
    name: 'Dr. Test Provider',
    professionalType: 'doctor' as const,
    facility: 'Jimma Hospital',
    licenseNumber: 'MED-2025-4567',
    zone: 'Jimma',
  },
  'admin@medilink.test': {
    password: 'admin123',
    role: 'admin' as UserRole,
    name: 'Test Zonal Admin',
    adminLevel: 'zonal' as const,
    zone: 'Jimma',
  },
  'woredaadmin@medilink.test': {
    password: 'admin123',
    role: 'admin' as UserRole,
    name: 'Test Woreda Admin',
    adminLevel: 'woreda' as const,
    zone: 'Jimma',
    woreda: 'Seka',
  },
  'cityadmin@medilink.test': {
    password: 'admin123',
    role: 'admin' as UserRole,
    name: 'Test City Admin',
    adminLevel: 'city' as const,
    zone: 'Jimma',
    city: 'Jimma City',
  },
  'facilityadmin@medilink.test': {
    password: 'admin123',
    role: 'admin' as UserRole,
    name: 'Test Facility Admin',
    adminLevel: 'facility' as const,
    zone: 'Jimma',
    facility: 'Jimma Hospital',
  },
};

export const authService = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    if (DEV_MODE) {
      const testUser = TEST_USERS[email as keyof typeof TEST_USERS];
      if (testUser && testUser.password === password) {
        const user: User = {
          id: `user-${Date.now()}`,
          email,
          name: testUser.name,
          role: testUser.role,
          language: 'en',
          createdAt: new Date().toISOString(),
          adminLevel: (testUser as any).adminLevel,
          zone: (testUser as any).zone,
          woreda: (testUser as any).woreda,
          city: (testUser as any).city,
          facility: (testUser as any).facility,
          professionalType: (testUser as any).professionalType,
          licenseNumber: (testUser as any).licenseNumber,
        };
        const token = `mock-token-${Date.now()}`;
        return { user, token };
      }
      throw new Error('Invalid email or password');
    }

    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  async register(
    email: string,
    password: string,
    name: string,
    role: UserRole
  ): Promise<{ user: User; token: string }> {
    if (DEV_MODE) {
      const user: User = {
        id: `user-${Date.now()}`,
        email,
        name,
        role,
        language: 'en',
        createdAt: new Date().toISOString(),
      };
      const token = `mock-token-${Date.now()}`;
      return { user, token };
    }

    try {
      const response = await api.post('/auth/register', { email, password, name, role });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    try {
      const response = await api.patch(`/auth/users/${userId}`, userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Update failed');
    }
  },

  async resetPassword(email: string): Promise<void> {
    try {
      await api.post('/auth/reset-password', { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  },
};

