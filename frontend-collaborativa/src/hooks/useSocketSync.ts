// src/features/boards/hooks/useSocketSync.ts
import { useEffect, useRef } from "react";
import { socketService } from "@/services/sockets";
import { handleSocketNotification } from "@/services/socketHandler";
import { useAuthStore } from "@/store/authStore"; 

export const useSocketSync = (boardId: string | undefined): void => {
  const token = useAuthStore((state) => state.token);
  const lastConnectedBoard = useRef<string | null>(null);

  useEffect(() => {
    if (!boardId || !token) return;
    if (lastConnectedBoard.current === boardId) return;

    // 💡 Añadimos un pequeño delay de 100ms
    const timeoutId = setTimeout(() => {
      const url = `${import.meta.env.VITE_WS_URL}/ws/board/${boardId}/?token=${token}`;
      socketService.connect(url);
      lastConnectedBoard.current = boardId;
    }, 100);

    const unsubscribe = socketService.subscribe(handleSocketNotification);

    return () => {
      clearTimeout(timeoutId); // Limpiamos el timeout
      unsubscribe();
      socketService.disconnect();
      lastConnectedBoard.current = null;
    };
  }, [boardId, token]);
};