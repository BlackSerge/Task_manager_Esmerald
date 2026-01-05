// src/features/chat/types/chat.types.ts
export interface Message {
  id: number;
  username: string; // "user" en el broadcast del consumer
  content: string;
  created_at: string;
  edited_at: string | null;
}

export interface ChatEvent extends Message {
  type: "broadcast_message";
}