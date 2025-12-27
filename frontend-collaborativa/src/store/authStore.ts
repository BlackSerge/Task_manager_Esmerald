// src/store/authStore.ts
import { create } from "zustand";
import { AuthState, AuthUser } from "@/features/auth/types";
import { storageService } from "@/services/storage.service";

export const useAuthStore = create<AuthState>((set) => ({
  // Inicializamos directamente desde el storageService para persistencia al recargar
  user: storageService.getUser(),
  token: storageService.getToken(),
  isAuthenticated: !!storageService.getToken(),

  setAuth: (user: AuthUser, token: string) => {
    // 1. Persistimos en la capa de infraestructura
    storageService.setToken(token);
    storageService.setUser(user);
    
    // 2. Actualizamos el estado global
    set({ 
      user, 
      token, 
      isAuthenticated: true 
    });
  },

  logout: () => {
    // 1. Limpiamos persistencia
    storageService.clear();
    
    // 2. Limpiamos estado global
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false 
    });
  },
}));