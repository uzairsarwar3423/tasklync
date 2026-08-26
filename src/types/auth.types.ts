export interface AuthUser {
  id: string;
  phone: string;
  name: string | null;
  email?: string | null | undefined;
  role: 'user' | 'worker';
  avatarUrl: string | null;
  avatar_url?: string | null | undefined;
}

export interface SendOtpResponse {
  success: boolean;
  expiresIn: number;
}

export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  isNewUser: boolean;
}
