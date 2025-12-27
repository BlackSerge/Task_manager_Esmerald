// src/features/boards/hooks/useSocketSync.ts
import { useEffect, useRef } from "react";
import { socketService } from "@/services/sockets";
import { handleSocketNotification } from "@/services/socketHandler";
import { useAuthStore } from "@/store/authStore"; 

export const useSocketSync = (boardId: string | undefined): void => {
  const token = useAuthStore((state) => state.token);
  // Guardamos el último ID conectado para evitar bucles en modo estricto de React
  const lastConnectedBoard = useRef<string | null>(null);

  useEffect(() => {
    // Si no hay parámetros necesarios, abortamos
    if (!boardId || !token) return;
    
    // Evitamos re-conexiones si ya estamos en el tablero correcto
    if (lastConnectedBoard.current === boardId) return;

    const url = `${import.meta.env.VITE_WS_URL}/ws/board/${boardId}/?token=${token}`;

    console.log(`🔌 [SocketHook]: Intentando conectar al tablero ${boardId}`);
    
    socketService.connect(url);
    const unsubscribe = socketService.subscribe(handleSocketNotification);
    
    lastConnectedBoard.current = boardId;

    return () => {
      // Cleanup: Cuando el usuario sale del detalle del tablero
      console.log(`🧹 [SocketHook]: Limpiando recursos del tablero ${boardId}`);
      unsubscribe();
      socketService.disconnect();
      lastConnectedBoard.current = null;
    };
  }, [boardId, token]);
};