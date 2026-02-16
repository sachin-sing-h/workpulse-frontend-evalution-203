import apiClient from './client';
import { AuthResponse, UserRole, AuthData } from '../types';

export const authService = {
  register: async (data: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    organization_name?: string;
    organization_id?: string;
  }): Promise<AuthData> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data.data;
  },

  login: async (data: {
    email: string;
    password: string;
    organization_id: string;
  }): Promise<AuthData> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data.data;
  },

  logout: () => {
    localStorage.removeItem('wp_token');
    localStorage.removeItem('wp_user');
  },
};
