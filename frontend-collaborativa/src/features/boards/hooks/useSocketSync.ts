import { useEffect, useRef } from 'react';
import { socketService } from '../services/socket/board.socket.service';
import { storageService } from '@/core/services/storage/storage.service';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useSocketHandler } from './useSocketHandler'; 

export const useSocketSync = (boardId: string | undefined) => {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const { processMessage } = useSocketHandler();
  
 
  const messageHandlerRef = useRef(processMessage);
  useEffect(() => {
    messageHandlerRef.current = processMessage;
  }, [processMessage]);

  useEffect(() => {
    if (!boardId || boardId === 'undefined' || !isHydrated) return;

    const token = storageService.getToken();
    const wsBase = import.meta.env.VITE_WS_URL;
    if (!token) return;

    const fullUrl = `${wsBase}/ws/board/${boardId}/?token=${token}`;
    
  
    socketService.connect(fullUrl);

    
    const unsubscribe = socketService.subscribe((data) => {
      messageHandlerRef.current(data);
    });

    return () => {
      unsubscribe();
  
    };
  }, [boardId, isHydrated]); 
};