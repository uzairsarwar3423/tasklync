import { apiClient } from './client';
import { AuthUser } from '../../types/auth.types';
import {
  UserPreferences,
  UserAddress,
  UpdateUserPayload,
  UpdatePreferencesPayload,
  CreateAddressPayload,
  UpdateAddressPayload,
} from '../../types/user.types';

export const userApi = {
  // 2.1 User Profile
  getMe: async (): Promise<AuthUser> => {
    const response = await apiClient.get<AuthUser>('/users/me');
    return response.data;
  },

  updateProfile: async (payload: UpdateUserPayload): Promise<AuthUser> => {
    const response = await apiClient.patch<AuthUser>('/users/me', payload);
    return response.data;
  },

  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/users/me');
  },

  getUserById: async (id: string): Promise<AuthUser> => {
    const response = await apiClient.get<AuthUser>(`/users/${id}`);
    return response.data;
  },

  // 2.2 User Avatar
  uploadAvatar: async (formData: FormData): Promise<{ avatarUrl: string }> => {
    const response = await apiClient.post<{ avatarUrl: string }>('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 2.3 User Preferences
  getPreferences: async (): Promise<UserPreferences> => {
    const response = await apiClient.get<UserPreferences>('/users/me/preferences');
    return response.data;
  },

  updatePreferences: async (payload: UpdatePreferencesPayload): Promise<UserPreferences> => {
    const response = await apiClient.put<UserPreferences>('/users/me/preferences', payload);
    return response.data;
  },

  // 2.4 Device & Push Notifications
  saveFcmToken: async (token: string): Promise<void> => {
    await apiClient.post('/users/me/fcm-token', { token });
  },

  // 2.5 Worker Blocking
  blockWorker: async (workerId: string): Promise<void> => {
    await apiClient.post(`/users/me/blocks/${workerId}`);
  },

  unblockWorker: async (workerId: string): Promise<void> => {
    await apiClient.delete(`/users/me/blocks/${workerId}`);
  },

  // 2.6 User Addresses & Location Persistence
  getAddresses: async (): Promise<UserAddress[]> => {
    const response = await apiClient.get<any>('/users/me/addresses');
    return response.data?.data || response.data || [];
  },

  createAddress: async (payload: CreateAddressPayload): Promise<UserAddress> => {
    const response = await apiClient.post<any>('/users/me/addresses', payload);
    return response.data?.data || response.data;
  },

  syncCurrentLocation: async (payload: CreateAddressPayload): Promise<UserAddress> => {
    const response = await apiClient.post<any>('/users/me/addresses', payload);
    return response.data?.data || response.data;
  },

  updateAddress: async (id: string, payload: UpdateAddressPayload): Promise<UserAddress> => {
    const response = await apiClient.patch<any>(`/users/me/addresses/${id}`, payload);
    return response.data?.data || response.data;
  },

  deleteAddress: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/me/addresses/${id}`);
  },

  setDefaultAddress: async (id: string): Promise<UserAddress> => {
    const response = await apiClient.patch<any>(`/users/me/addresses/${id}/default`);
    return response.data?.data || response.data;
  },
};
