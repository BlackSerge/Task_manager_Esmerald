// src/services/storage.service.ts
import { AuthUser } from "@/features/auth/types";
import { STORAGE_KEYS } from "./storage.constans";

export const storageService = {
  // Token Management
  getToken: (): string | null => localStorage.getItem(STORAGE_KEYS.TOKEN),
  setToken: (token: string): void => localStorage.setItem(STORAGE_KEYS.TOKEN, token),
  removeToken: (): void => localStorage.removeItem(STORAGE_KEYS.TOKEN),

  // User Management (Con tipado estricto y manejo de JSON)
  getUser: (): AuthUser | null => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    if (!user) return null;
    try {
      return JSON.parse(user) as AuthUser;
    } catch {
      return null;
    }
  },
  setUser: (user: AuthUser): void => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
  removeUser: (): void => localStorage.removeItem(STORAGE_KEYS.USER),

  // General
  clear: (): void => localStorage.clear(),
};