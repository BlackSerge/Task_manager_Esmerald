import { STORAGE_KEYS } from "./storage.constans";
export const storageService = {
  getToken: (): string | null => {
    const authData = localStorage.getItem(STORAGE_KEYS.AUTH_STORAGE);
    if (!authData) return null;

    try {
      const parsed = JSON.parse(authData);
      const token = parsed.state?.token;
      
      return typeof token === 'string' ? token : null;
    } catch (error) {
      console.error("❌ [StorageService]: Error al parsear el token", error);
      return null;
    }
  },

  clearAll: (): void => {
    localStorage.clear();
  }
};