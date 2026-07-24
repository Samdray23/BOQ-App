export interface UserRow {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  is_verified: number;
  google_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface VerificationTokenRow {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
}

export interface AuthPayload {
  userId: string;
  email: string;
}
