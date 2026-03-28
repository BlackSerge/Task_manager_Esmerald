
export interface AuthUser {
  id: number;
  username: string;
  email: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean; 
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
  _setHydrated: () => void;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  password2: string;
}

export interface RegisterResponse {
  user: AuthUser;
  access?: string;  
  refresh?: string;
  message?: string; 
}

export interface ApiErrorResponse {
  detail?: string;
  username?: string[];
  password?: string[];
  email?: string[];
  message?: string;
}
