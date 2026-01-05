// src/features/boards/hooks/useSocketSync.ts
import { useEffect } from 'react';
import { socketService } from '../services/socket/socket.service';
import { storageService } from '@/core/services/storage/storage.service';
import { useAuthStore } from '@/features/auth/store/auth.store';

export const useSocketSync = (boardId: string | undefined) => {
  // Suscribirse a la hidratación para saber cuándo el token ya está en memoria
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    // 1. Esperar a que el boardId exista y el store esté cargado
    if (!boardId || !isHydrated) return;

    const wsBase = import.meta.env.VITE_WS_URL;
    const token = storageService.getToken();

    if (!token) {
      console.warn("⚠️ [useSocketSync]: No hay token disponible para el socket");
      return;
    }

    if (!wsBase) {
      console.error("❌ [useSocketSync]: VITE_WS_URL no definido");
      return;
    }

    const fullUrl = `${wsBase}/ws/board/${boardId}/?token=${token}`;
    
    console.log("🔌 [useSocketSync]: Iniciando conexión...");
    socketService.connect(fullUrl);

    return () => {
      socketService.disconnect();
    };
  }, [boardId, isHydrated]); // Re-ejecutar cuando se hidrate o cambie el board
};