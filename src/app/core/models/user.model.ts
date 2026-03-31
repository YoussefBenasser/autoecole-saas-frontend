export interface AuthResponse {
  token: string;
  role: string;
  email: string;
  tenantId?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type UserRole = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'MONITOR' | 'STUDENT';
