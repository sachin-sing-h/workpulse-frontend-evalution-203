export type UserRole = "admin" | "employee";

export interface User {
  id: string; // UUID
  email: string;
  name: string;
  role: 'admin' | 'employee';
  organization_id: string; // UUID
  status?: string;
  last_seen?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type SessionStatus = "active" | "stopped";

export interface Session {
  id: string;
  user_id: string;
  project_id: string | null;
  start_time: string;
  end_time: string | null;
  total_active_seconds: number;
  total_idle_seconds: number;
  last_activity_at: string | null;
  status: 'active' | 'stopped';
  version: number;
  created_at: string;
  updated_at: string;
}

export type ActivityType = "active" | "idle";

export interface Activity {
  id: string;
  session_id: string;
  activity_type: ActivityType;
  duration_seconds: number;
  url?: string;
  timestamp?: string;
  client_activity_id?: string | null;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  organization_id: string;
  created_at: string;
  created_by: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface AuthData {
  access_token: string;
  user: User;
}

export type AuthResponse = ApiResponse<AuthData>;

export interface DailyReport {
  date: string;
  total_active_seconds: number;
  total_idle_seconds: number;
  sessions: Session[];
}

export interface OrganizationReportItem {
  id: string;
  organization_id: string;
  user_id: string;
  date: string;
  total_work_seconds: number;
  active_seconds: number;
  idle_seconds: number;
  productivity_score: string;
  user: User & {
    status: string;
    last_seen: string;
  };
}
