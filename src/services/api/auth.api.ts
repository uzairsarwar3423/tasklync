import { apiClient } from './client';
import { SendOtpResponse, VerifyOtpResponse, AuthUser } from '../../types/auth.types';

export const authApi = {
  sendOtp: async (phone: string): Promise<SendOtpResponse> => {
    try {
      const response = await apiClient.post<SendOtpResponse>('/auth/otp/send', { phone });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  verifyOtp: async (phone: string, otp: string, role: 'user' | 'worker' = 'user'): Promise<VerifyOtpResponse> => {
    try {
      const response = await apiClient.post<any>('/auth/otp/verify', { phone, otp, role });
      const payload = response.data?.data || response.data;
      return payload;
    } catch (error) {
      throw error;
    }
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await apiClient.post<{ accessToken: string }>('/auth/token/refresh', { refreshToken });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/user/logout');
  },

  googleOAuthCallback: async (code: string): Promise<VerifyOtpResponse> => {
    const response = await apiClient.post<VerifyOtpResponse>('/oauth/google/callback', { code });
    return response.data;
  },

  getMe: async (): Promise<AuthUser> => {
    const response = await apiClient.get<AuthUser>('/users/me');
    return response.data;
  },

  updateProfile: async (data: { name?: string; email?: string }): Promise<AuthUser> => {
    const response = await apiClient.patch<AuthUser>('/users/me', data);
    return response.data;
  }
};
