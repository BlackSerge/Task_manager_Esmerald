export interface Message {
  id: number;
  username: string;
  content: string;
  created_at: string;
  edited_at: string | null;
}

export interface ChatEvent {
  type: "broadcast_message";
  id: number;
  user: string;    
  content: string; 
  created_at: string;
}