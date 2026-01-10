import { create } from 'zustand';
import { Message, ChatEvent } from '../types/chat.types';
import { chatService } from '../services/chat.service';

interface ChatState {
  messages: Message[];
  isConnected: boolean;
  isLoading: boolean;
  initChat: (boardId: string) => Promise<void>;
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
      // 1. Historial (Usa MessageSerializer -> username y content)
      const history = await chatService.getMessages(boardId);
      set({ messages: history });

      // 2. Tiempo Real (Usa Consumer -> user y content)
      chatService.connect(
        boardId,
        (event: ChatEvent) => {
          if (event.type === "broadcast_message") {
            set((state) => {
              if (state.messages.some(m => m.id === event.id)) return state;

              const normalizedMessage: Message = {
                id: event.id,
                username: event.user,    
                content: event.content,  
                created_at: event.created_at,
                edited_at: null
              };

              return {
                messages: [...state.messages, normalizedMessage]
              };
            });
          }
        },
        (status) => set({ isConnected: status })
      );
    } catch {
      // Catch vacío para TS Estricto
    } finally {
      set({ isLoading: false });
    }
  },

  disconnect: () => {
    chatService.disconnect();
    set({ isConnected: false, messages: [], isLoading: false });
  },

  sendMessage: (content: string) => {
    if (content.trim()) chatService.send(content);
  }
}));