import apiClient from './client';
import { Project, DailyReport, ApiResponse, OrganizationReportItem } from '../types';

export const projectService = {
  getProjects: async () => {
    const response = await apiClient.get<ApiResponse<Project[]>>('/projects');
    return response.data.data || [];
  },

  createProject: async (data: { name: string; description?: string }) => {
    const response = await apiClient.post<ApiResponse<Project>>('/projects', data);
    return response.data.data;
  },
};

export const reportService = {
  getDailyReport: async (date: string) => {
    const response = await apiClient.get<ApiResponse<DailyReport>>(`/reports/daily?date=${date}`);
    return response.data.data;
  },

  getUserReport: async (userId: string, startDate?: string, endDate?: string) => {
    let url = `/reports/user/${userId}`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await apiClient.get<ApiResponse<any>>(url);
    return response.data.data;
  },

  getOrgReport: async () => {
    const response = await apiClient.get<ApiResponse<OrganizationReportItem[]>>(`/reports/organization`);
    return response.data.data;
  },
};
