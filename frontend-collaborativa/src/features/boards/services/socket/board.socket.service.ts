export type RawSocketData = Record<string, unknown>;
export type SocketListener = (data: RawSocketData) => void;

class SocketService {
  private socket: WebSocket | null = null;
  private listeners: Set<SocketListener> = new Set();
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private currentUrl: string | null = null;
  private isExplicitlyClosed = false;

  public connect(url: string): void {
    if (!url || url.includes('undefined')) {
      return;
    }

    if (this.socket?.readyState === WebSocket.CONNECTING) return;
    if (this.socket?.readyState === WebSocket.OPEN && this.currentUrl === url) return;

    this.cleanup();
    this.currentUrl = url;
    this.isExplicitlyClosed = false;

    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
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

      this.socket.onerror = () => {
        if (this.socket?.readyState !== WebSocket.CLOSED) {
          console.error("[SocketService]: Connection error");
        }
      };
      
    } catch (err) {
      console.error("[SocketService]: Critical instantiation failure", err);
      this.scheduleReconnect(url);
    }
  }

  public send<T extends object>(payload: T): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
    }
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const parsed = JSON.parse(event.data as string) as RawSocketData;
      this.listeners.forEach((listener) => listener(parsed));
    } catch (error) {
      console.error("[SocketService]: JSON parse error", error);
    }
  }

  private handleClose(event: CloseEvent, url: string): void {
    this.socket = null;
    
    if (!this.isExplicitlyClosed && event.code !== 1000) {
      this.scheduleReconnect(url);
    }
  }

  private scheduleReconnect(url: string): void {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = setTimeout(() => {
      this.connect(url);
    }, 5000); 
  }

  public subscribe(listener: SocketListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public disconnect(): void {
    this.isExplicitlyClosed = true;
    this.cleanup();
    this.currentUrl = null;
    
    if (this.socket) {
      this.socket.onclose = null; 
      this.socket.close(1000, "Normal closure");
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