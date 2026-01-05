// src/features/chat/services/chat.service.ts
import { API_ENDPOINTS } from "@/core/constants/endpoints";
import { http } from "@/api/http.service";
import { storageService } from "@/core/services/storage/storage.service"; // Tu servicio
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

    // Extraemos el token usando tu lógica de storage
    const token = storageService.getToken();
    
    // Construimos la URL con el token para que JWTAuthMiddleware lo valide
    const baseUrl = import.meta.env.VITE_WS_URL;
    const url = `${baseUrl}/ws/chat/${boardId}/?token=${token}`;
    
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log("🚀 [Chat]: Conectado con éxito");
      onStatusChange(true);
    };

    this.socket.onmessage = (event) => {
      const data: ChatEvent = JSON.parse(event.data);
      onMessage(data);
    };

    this.socket.onclose = (e) => {
      console.log("🔌 [Chat]: Desconectado", e.code);
      onStatusChange(false);
    };

    this.socket.onerror = (err) => {
      console.error("❌ [Chat]: Error de conexión", err);
    };
  }

  send(message: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ action: "send_message", message }));
    }
  }

  disconnect(): void {
    this.socket?.close();
    this.socket = null;
  }
}

export const chatService = new ChatService();