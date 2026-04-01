import { http } from "@/api/http.service";
import { API_ENDPOINTS } from "@/core/constants/endpoints";
import { 
  LoginPayload, 
  LoginResponse, 
  RegisterPayload, 
  RegisterResponse 
} from "../types";

export const authService = {
  login: async (data: LoginPayload): Promise<LoginResponse> => {
    const { data: response } = await http.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
    return response;
  },

  register: async (data: RegisterPayload): Promise<RegisterResponse> => {
    const { data: response } = await http.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
    return response;
  }
};