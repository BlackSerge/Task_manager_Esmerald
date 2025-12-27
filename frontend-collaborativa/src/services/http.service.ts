// src/services/http.service.ts
import axios from "axios";
import { useAuthStore } from "@/store/authStore";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ,
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true, // Úsalo solo si usas Cookies/Session en Django, no es necesario para SimpleJWT por defecto
});

// Interceptor de Petición
http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Respuesta
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status, config } = error.response || {};

    // Si es 401 y NO es la ruta de login del backend
    if (status === 401 && !config.url?.includes("/token/")) {
      const { logout } = useAuthStore.getState();
      
      logout();

      // Solo redireccionamos si no estamos ya en login para evitar bucles
      if (!window.location.pathname.includes('/login')) {
        // Usamos replace para no ensuciar el historial
        window.location.replace("/login?error=expired");
      }
    }

    return Promise.reject(error);
  }
);