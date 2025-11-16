import axios from 'axios';
import { User, UserRole } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Development mode: Mock authentication for testing
const DEV_MODE = import.meta.env.DEV || !import.meta.env.VITE_API_BASE_URL;

// Test credentials for development
const TEST_USERS = {
  'patient@medilink.test': { password: 'patient123', role: 'patient' as UserRole, name: 'Test Patient' },
  'provider@medilink.test': { password: 'provider123', role: 'provider' as UserRole, name: 'Test Provider' },
  'admin@medilink.test': { password: 'admin123', role: 'admin' as UserRole, name: 'Test Admin' },
};

export const authService = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // Development mode: Use mock authentication
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
        };
        const token = `mock-token-${Date.now()}`;
        return { user, token };
      }
      throw new Error('Invalid email or password');
    }

    // Production mode: Use real API
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
    // Development mode: Use mock registration
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

    // Production mode: Use real API
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

