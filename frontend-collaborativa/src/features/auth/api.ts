import { http } from "@/services";
import { LoginPayload, LoginResponse,RegisterPayload, RegisterResponse} from "./types";
import { API_ENDPOINTS } from "@/services";

export const authService = {
  login: async (data: LoginPayload): Promise<LoginResponse> => {
    const response = await http.post<LoginResponse>(API_ENDPOINTS.LOGIN, data);
    return response.data;
  },

  register: async (data: RegisterPayload): Promise<RegisterResponse> => {
    // Asumiendo que definiste API_ENDPOINTS.REGISTER como '/api/auth/register/'
    const response = await http.post<RegisterResponse>(API_ENDPOINTS.REGISTER, data);
    return response.data;
  }
};