export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  is_verified: boolean;
  avatar_url: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileInput {
  name?: string;
  avatar_url?: string;
}
