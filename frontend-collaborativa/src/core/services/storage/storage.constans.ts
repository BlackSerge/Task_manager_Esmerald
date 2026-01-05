// src/core/services/storage/storage.constants.ts
export const STORAGE_KEYS = {
  TOKEN: 'portfolio_token', // Por si usas algo manual
  USER: 'portfolio_user',   // Por si usas algo manual
  AUTH_STORAGE: 'auth-storage', // ✅ Esta debe coincidir con el 'name' en el persist de Zustand
} as const;