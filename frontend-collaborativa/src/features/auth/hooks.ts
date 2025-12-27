import { useMutation } from "@tanstack/react-query";
import { authService } from "./api";
import { LoginPayload, LoginResponse, RegisterPayload, RegisterResponse  } from "./types";

export const useLogin = () =>
  useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: authService.login,
  });


export const useRegister = () =>
  useMutation<RegisterResponse, Error, RegisterPayload>({
    mutationFn: authService.register,
  });