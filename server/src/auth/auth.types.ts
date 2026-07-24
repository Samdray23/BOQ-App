export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  is_verified: boolean;
  google_id: string | null;
  avatar_url: string | null;
  refresh_token: string | null;
  last_login_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  avatarUrl: string | null;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface GoogleAuthInput {
  credential: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}
