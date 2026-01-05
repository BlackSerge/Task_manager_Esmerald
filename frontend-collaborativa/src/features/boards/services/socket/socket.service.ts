// Definimos una interfaz para el mensaje crudo que viene del servidor
export type RawSocketData = Record<string, unknown>;
export type SocketListener = (data: RawSocketData) => void;

class SocketService {
  private socket: WebSocket | null = null;
  private listeners: Set<SocketListener> = new Set();
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private currentUrl: string | null = null;
  private isExplicitlyClosed = false;

  public connect(url: string): void {
    // 1. Validar que la URL no sea nula o indefinida (evita errores de .env mal cargados)
    if (!url || url.includes('undefined')) {
      console.error("❌ [SocketService]: URL de conexión inválida. Revisa tu .env");
      return;
    }

    // 2. Evitar reconexiones innecesarias
    if (this.socket?.readyState === WebSocket.CONNECTING) return;
    if (this.socket?.readyState === WebSocket.OPEN && this.currentUrl === url) return;

    // 3. Limpieza de estado previo
    this.cleanup();
    this.currentUrl = url;
    this.isExplicitlyClosed = false;

    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        console.log("🌐 [SocketService]: Conexión establecida exitosamente");
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
      };

      this.socket.onmessage = (event: MessageEvent) => {
        this.handleMessage(event);
      };

      this.socket.onclose = (event: CloseEvent) => {
        this.handleClose(event, url);
      };

      // Usamos el prefijo '_' para indicar a TS que el parámetro es ignorado intencionalmente
      this.socket.onerror = (_error: Event) => {
        if (this.socket?.readyState !== WebSocket.CLOSED) {
          console.error("❌ [SocketService]: Error en el canal de comunicación");
        }
      };
      
    } catch (err) {
      console.error("❌ [SocketService]: Fallo crítico al instanciar WebSocket", err);
      this.scheduleReconnect(url);
    }
  }

  public send<T extends object>(payload: T): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
    } else {
      console.warn("⚠️ [SocketService]: No se puede enviar, el socket está cerrado");
    }
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const parsed = JSON.parse(event.data as string) as RawSocketData;
      // Notificamos a todos los servicios suscritos (como el SocketHandler)
      this.listeners.forEach((listener) => listener(parsed));
    } catch (error) {
      console.error("❌ [SocketService]: Error parseando JSON recibido", error);
    }
  }

  private handleClose(event: CloseEvent, url: string): void {
    this.socket = null;
    
    // Si el cierre no fue manual, intentamos recuperar la conexión
    if (!this.isExplicitlyClosed && event.code !== 1000) {
      console.warn(`[SocketService]: Conexión perdida (Code: ${event.code}). Reintentando en 5s...`);
      this.scheduleReconnect(url);
    }
  }

  private scheduleReconnect(url: string): void {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = setTimeout(() => {
      console.log("🔄 [SocketService]: Intentando reconectar...");
      this.connect(url);
    }, 5000); 
  }

  public subscribe(listener: SocketListener): () => void {
    this.listeners.add(listener);
    // Retornamos una función de des-suscripción para evitar memory leaks
    return () => {
      this.listeners.delete(listener);
    };
  }

  public disconnect(): void {
    this.isExplicitlyClosed = true;
    this.cleanup();
    this.currentUrl = null;
    
    if (this.socket) {
      this.socket.onclose = null; // Evitamos disparar handleClose
      this.socket.close(1000, "Cierre normal de sesión");
      this.socket = null;
    }
  }

  private cleanup(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
}

export const socketService = new SocketService();