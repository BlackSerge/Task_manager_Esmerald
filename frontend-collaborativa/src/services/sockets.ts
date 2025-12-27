// src/services/sockets.ts

/** Definimos el tipo de la función que procesará los mensajes */
type MessageHandler = (data: unknown) => void;

class SocketService {
  private socket: WebSocket | null = null;
  private subscribers: MessageHandler[] = [];

  public connect(url: string): void {
    // Si ya existe una conexión abierta o conectando, no duplicamos
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
        // Notificamos a todos los suscriptores (en este caso, al handleSocketNotification)
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

  /** Permite que otros archivos escuchen los mensajes que llegan */
  public subscribe(callback: MessageHandler): () => void {
    this.subscribers.push(callback);
    // Retornamos una función de limpieza para remover el suscriptor
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

// Exportamos una única instancia (Singleton)
export const socketService = new SocketService();