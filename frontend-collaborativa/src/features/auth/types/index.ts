export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthUser {
  id: number;      // Cambiado de string a number para coincidir con Django
  username: string;
  email: string;
}

export interface LoginResponse {
  access: string;  // SimpleJWT usa 'access', no 'token'
  refresh: string;
  user: AuthUser;
}

export interface RegisterResponse {
  access: string;  // Asegúrate de que tu RegisterView devuelva 'access'
  user: AuthUser;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  password2: string; // Cambiado de password_confirm a password2
}


export interface ApiErrorResponse {
  detail?: string;
  message?: string;
  [key: string]: string | string[] | undefined;
}

export interface ApiError {
  response?: {
    data?: ApiErrorResponse;
    status?: number;
  };
  message: string;
}
