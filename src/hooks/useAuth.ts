import { useState } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { authApi } from '../services/api/auth.api';
import { userApi } from '../services/api/user.api';
import { phoneSchema, nameSchema } from '../utils/validation';
import { useAuthStore, useUIStore } from '../store';
import { useQuery } from '@tanstack/react-query';

export const useSendOtp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const showToast = useUIStore((state) => state.showToast);

  const sendOtp = async (phone: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const parsed = phoneSchema.safeParse(phone);
      if (!parsed.success) {
        setError((parsed.error as any).errors[0].message);
        setIsLoading(false);
        return;
      }

      const formattedPhone = `+92${parsed.data.substring(parsed.data.length - 10)}`;
      
      await authApi.sendOtp(formattedPhone);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push({ pathname: '/(auth)/otp', params: { phone: formattedPhone } });
    } catch (err: any) {
      const msg = err.response?.status === 429 
        ? "Too many attempts. Try again later." 
        : "Could not send code. Please try again.";
      setError(msg);
      showToast({ type: 'error', title: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return { sendOtp, isLoading, error };
};

export const useVerifyOtp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState(false);
  const router = useRouter();
  
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);
  const setIsNewUser = useAuthStore((state) => state.setIsNewUser);

  const verifyOtp = async (phone: string, otp: string) => {
    setIsLoading(true);
    setError(null);
    setOtpError(false);

    try {
      const response = await authApi.verifyOtp(phone, otp, 'user');
      
      setTokens(response.accessToken, response.refreshToken);
      setUser(response.user);
      setIsNewUser(response.isNewUser);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Delay to let the success cascade animation play
      setTimeout(() => {
        console.log("OTP Response Payload:", JSON.stringify(response));
        const hasValidName = response.user?.name && response.user.name !== 'null' && response.user.name !== '' && response.user.name !== 'New User';
        const needsProfileSetup = response.isNewUser || !hasValidName;
        
        if (needsProfileSetup) {
          router.replace('/(auth)/name');
        } else {
          router.replace('/(tabs)' as any);
        }
      }, 800);
      
    } catch (err: any) {
      const status = err.response?.status;
      let msg = "Something went wrong.";
      if (status === 401) {
        setOtpError(true);
        msg = "Wrong code. Please check your SMS.";
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setTimeout(() => setOtpError(false), 600); // reset after shake
      } else if (status === 410) {
        msg = "Code expired. Please request a new one.";
      } else if (status === 429) {
        msg = "Too many attempts. Please try later.";
      }
      
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return { verifyOtp, isLoading, error, otpError };
};

export const useUpdateName = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const showToast = useUIStore((state) => state.showToast);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const updateName = async (name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const parsed = nameSchema.safeParse(name);
      if (!parsed.success) {
        setError((parsed.error as any).errors[0].message);
        setIsLoading(false);
        return;
      }

      await userApi.updateProfile({ name: parsed.data });
      
      if (user) {
        setUser({ ...user, name: parsed.data });
      }
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.replace('/(auth)/location-permission');
    } catch (err) {
      showToast({ type: 'error', title: "Something went wrong. Your name wasn't saved." });
      // Error isn't blocking, but we might let the user decide to try again or we can force them to try.
      // The spec says: Name save failure is NOT blocking — user can still proceed
      router.replace('/(auth)/location-permission');
    } finally {
      setIsLoading(false);
    }
  };

  return { updateName, isLoading, error };
};

export const useLogout = () => {
  const logoutStore = useAuthStore((state) => state.logout);
  const showToast = useUIStore((state) => state.showToast);

  const logout = () => {
    authApi.logout().catch(() => {}); // Fire and forget
    logoutStore();
    showToast({ type: 'info', title: 'Logged out' });
  };

  return { logout };
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: userApi.getMe,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
