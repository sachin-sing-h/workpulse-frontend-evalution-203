import apiClient from './client';
import { ApiResponse, User } from '../types';

export const userService = {
  getEmployees: async () => {
    const response = await apiClient.get<ApiResponse<User[]>>('/users/employees');
    return response.data.data;
  },
};
