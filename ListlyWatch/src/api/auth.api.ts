import { AuthSession } from '../auth-storage';
import { apiRequest } from './client';

export interface AuthResponse {
  session: AuthSession | null;
  user: { id: string; email?: string } | null;
  requiresEmailConfirmation?: boolean;
}

export function register(email: string, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
