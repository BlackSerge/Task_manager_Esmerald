import { API_ENDPOINTS } from "@/core/constants/endpoints";
import { http } from "@/api/http.service";
import { storageService } from "@/core/services/storage/storage.service";
import { Message, ChatEvent } from "../types/chat.types";

export class ChatService {
  private socket: WebSocket | null = null;

  async getMessages(boardId: string): Promise<Message[]> {
    const response = await http.get<Message[]>(API_ENDPOINTS.CHAT.MESSAGES(boardId));
    return response.data;
  }

  connect(
    boardId: string, 
    onMessage: (msg: ChatEvent) => void, 
    onStatusChange: (open: boolean) => void
  ): void {
    if (this.socket) this.disconnect();

    const token = storageService.getToken();
    const baseUrl = import.meta.env.VITE_WS_URL;
    const url = `${baseUrl}/ws/chat/${boardId}/?token=${token}`;
    
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      onStatusChange(true);
    };

    this.socket.onmessage = (event: MessageEvent) => {
      try {
       
        const data = JSON.parse(event.data) as ChatEvent;
        
       
        onMessage(data);
      } catch {
        // Error de parseo manejado silenciosamente
      }
    };

    this.socket.onclose = () => {
      onStatusChange(false);
    };

    this.socket.onerror = () => {
      onStatusChange(false);
    };
  }

  send(message: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      
      this.socket.send(JSON.stringify({ 
        action: "send_message", 
        message: message 
      }));
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const chatService = new ChatService();