// src/features/chat/store/chat.store.ts
import { create } from 'zustand';
import { Message } from '../types/chat.types';
import { chatService } from '../services/chat.service';

interface ChatState {
  messages: Message[];
  isConnected: boolean;
  isLoading: boolean;
  initChat: (boardId: string) => Promise<void>; // Nueva acción orquestadora
  disconnect: () => void;
  sendMessage: (content: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isConnected: false,
  isLoading: false,

  initChat: async (boardId) => {
    set({ isLoading: true });
    
    try {
      // 1. Persistencia: Cargar mensajes antiguos de la DB
      const history = await chatService.getMessages(boardId);
      set({ messages: history });

      // 2. Tiempo Real: Conectar para nuevos mensajes
      chatService.connect(
        boardId,
        (event) => {
          if (event.type === "broadcast_message") {
            set((state) => ({
              messages: state.messages.some(m => m.id === event.id) 
                ? state.messages 
                : [...state.messages, event]
            }));
          }
        },
        (status) => set({ isConnected: status })
      );
    } catch (error) {
      console.error("Error initializing chat:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  disconnect: () => {
    chatService.disconnect();
    set({ isConnected: false, messages: [], isLoading: false });
  },

  sendMessage: (content) => chatService.send(content)
}));