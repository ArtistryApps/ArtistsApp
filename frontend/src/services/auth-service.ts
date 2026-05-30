import apiClient from '@/utils/api-client';
import type { LoginRequest, SessionResponse } from '@/schemas';

export const authService = {
  async login(credentials: LoginRequest): Promise<SessionResponse> {
    const response = await apiClient.post<SessionResponse>('/auth/login', credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },
};
