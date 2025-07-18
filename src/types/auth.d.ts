export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  username: string;
  fullName: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
}
