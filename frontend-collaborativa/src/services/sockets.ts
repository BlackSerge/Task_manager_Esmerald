// src/services/sockets.ts

/** Definimos el tipo de la función que procesará los mensajes */
type MessageHandler = (data: unknown) => void;

class SocketService {
  private socket: WebSocket | null = null;
  private subscribers: MessageHandler[] = [];

  public connect(url: string): void {
    if (this.socket?.readyState === WebSocket.OPEN || this.socket?.readyState === WebSocket.CONNECTING) {
      return;
    }

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log("✅ [SocketService]: Conexión establecida con el servidor");
    };

    this.socket.onmessage = (event: MessageEvent) => {
      try {
        const data: unknown = JSON.parse(event.data);
        this.subscribers.forEach((callback) => callback(data));
      } catch (error) {
        console.error("❌ [SocketService]: Error parseando mensaje JSON:", error);
      }
    };

    this.socket.onerror = (error: Event) => {
      console.error("❌ [SocketService]: Error detectado en el WebSocket:", error);
    };

    this.socket.onclose = (event: CloseEvent) => {
      console.log(`🔌 [SocketService]: Conexión cerrada (Código: ${event.code})`);
      this.socket = null;
    };
  }

  /**
   * Envía datos al servidor. 
   * Usamos Record<string, unknown> para evitar el uso de 'any'.
   */
  public send(data: Record<string, unknown>): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.error("❌ [SocketService]: No se pudo enviar mensaje, socket cerrado.");
    }
  }

  /** Permite que otros archivos escuchen los mensajes que llegan */
  public subscribe(callback: MessageHandler): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== callback);
    };
  }

  /** Cierra la conexión física */
  public disconnect(): void {
    if (this.socket) {
      console.log("🔌 [SocketService]: Cerrando conexión manualmente...");
      this.socket.close();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();