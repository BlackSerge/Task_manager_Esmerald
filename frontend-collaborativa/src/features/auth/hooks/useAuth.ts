import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";
import { 
  LoginPayload, 
  LoginResponse, 
  RegisterPayload, 
  RegisterResponse 
} from "../types";

export const useLogin = (): UseMutationResult<LoginResponse, Error, LoginPayload> => {
  const setAuth = useAuthStore((state) => state.setAuth);
  
  return useMutation({
    mutationFn: (credentials: LoginPayload) => authService.login(credentials),
    onSuccess: (data) => {
      if (data.user && data.access) {
        setAuth(data.user, data.access);
      }
    }
  });
};

export const useRegister = (): UseMutationResult<RegisterResponse, Error, RegisterPayload> => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (data) => {
      if (data.user && data.access) {
        setAuth(data.user, data.access);
      }
    }
  });
};