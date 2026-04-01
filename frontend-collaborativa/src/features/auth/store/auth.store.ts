import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AuthState, AuthUser } from "../types";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,

  
      setAuth: (user: AuthUser, token: string) => {
        set({ 
          user, 
          token, 
          isAuthenticated: true 
        });
      },

    
      logout: () => {
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
      },

      _setHydrated: () => {
        set({ isHydrated: true });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      
     
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._setHydrated();
        }
      },
    }
  )
);