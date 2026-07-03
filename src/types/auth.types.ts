export interface AuthUser {
  id: string;
  phone: string;
  name: string | null;
  role: 'user' | 'worker';
  avatarUrl: string | null;
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
