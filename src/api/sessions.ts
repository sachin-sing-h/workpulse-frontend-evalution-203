import apiClient from './client';
import { Session, Activity, ApiResponse } from '../types';

export const sessionService = {
  startSession: async (projectId?: string) => {
    const response = await apiClient.post<ApiResponse<Session>>('/sessions/start', {
      project_id: projectId,
      start_time: new Date().toISOString(),
    });
    return response.data.data;
  },

  stopSession: async (sessionId: string, endTime?: string) => {
    const response = await apiClient.post<ApiResponse<Session>>(`/sessions/${sessionId}/stop`, {
      end_time: endTime || new Date().toISOString()
    });
    return response.data.data;
  },

  getActiveSession: async () => {
    const response = await apiClient.get<ApiResponse<Session>>('/sessions/active');
    return response.data.data || null;
  },

  sendActivity: async (sessionId: string, activity: Omit<Activity, 'id' | 'session_id' | 'client_activity_id' | 'created_at' | 'updated_at'>) => {
    const response = await apiClient.post(`/sessions/${sessionId}/activity`, activity);
    return response.data;
  },

  bulkSyncActivities: async (sessionId: string, activities: Omit<Activity, 'id' | 'session_id' | 'created_at' | 'updated_at'>[]) => {
    const response = await apiClient.post(`/sessions/${sessionId}/activity/bulk`, { activities });
    return response.data;
  },
};
