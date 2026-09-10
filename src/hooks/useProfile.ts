import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../services/api/user.api';
import {
  UserProfile,
  UpdateUserPayload,
  UpdatePreferencesPayload,
  UserPreferences,
} from '../types/user.types';
import { invalidateProfileEverywhere } from '../utils/profileCacheSync';
import { compressImage } from '../utils/imageCompression';

/**
 * useCurrentUser Hook (Day 35 Profile Hub)
 * StaleTime: 5 minutes (matches backend user:profile:{id} Redis TTL)
 */
export function useCurrentUser() {
  const query = useQuery<UserProfile, Error>({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      return await userApi.getMe();
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error ? query.error.message : null,
    refetch: query.refetch,
  };
}

/**
 * useUpdateProfile Mutation Hook
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  const mutation = useMutation<UserProfile, Error, UpdateUserPayload>({
    mutationFn: async (payload: UpdateUserPayload) => {
      return await userApi.updateProfile(payload);
    },
    onSuccess: (updated) => {
      invalidateProfileEverywhere(queryClient, updated);
    },
  });

  return {
    updateProfile: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error ? mutation.error.message : null,
    reset: mutation.reset,
  };
}

/**
 * useUploadAvatar Hook with real upload progress tracking (Hard Problem #4)
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const uploadAvatar = useCallback(
    async (rawUri: string): Promise<string> => {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0.05);

      try {
        // 1. Client-side compression (<300KB band)
        const compressed = await compressImage(rawUri, {
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.8,
        });

        // 2. Real upload progress tracking wired from axios
        const result = await userApi.uploadAvatar(compressed.uri, (percent) => {
          setUploadProgress(Math.min(percent / 100, 0.95));
        });

        setUploadProgress(1.0);


        invalidateProfileEverywhere(queryClient, { avatar_url: result.avatarUrl });

        // Fade out progress indicator after brief moment
        setTimeout(() => {
          setUploadProgress(null);
          setIsUploading(false);
        }, 300);

        return result.avatarUrl;
      } catch (err: any) {
        setIsUploading(false);
        setUploadProgress(null);
        const errMsg = err?.message || 'Avatar upload failed. Please try again.';
        setError(errMsg);
        throw new Error(errMsg);
      }
    },
    [queryClient]
  );

  return {
    uploadAvatar,
    uploadProgress,
    isUploading,
    error,
  };
}

/**
 * useDeleteAccount Hook (Hard Problem #3)
 */
export function useDeleteAccount() {
  const mutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      await userApi.deleteAccount();
    },
  });

  return {
    deleteAccount: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error ? mutation.error.message : null,
  };
}

/**
 * useUpdatePreferences Hook (Immediate Preference Persistence)
 */
export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  const mutation = useMutation<UserPreferences, Error, UpdatePreferencesPayload>({
    mutationFn: async (payload: UpdatePreferencesPayload) => {
      return await userApi.updatePreferences(payload);
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });

  return {
    updatePreferences: mutation.mutateAsync,
    isSaving: mutation.isPending,
  };
}
