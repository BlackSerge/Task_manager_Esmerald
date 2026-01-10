import { useBoardsStore } from "../../store/board.store";
import { Board, Card } from "../../types/board.types";
import { socketService } from "./board.socket.service";

/**
 * Definición de tipos de eventos específicos del Backend
 */
type SocketEventType = 
  | "BOARD.UPDATED" 
  | "BOARD_SYNC" 
  | "CARD_MOVED" 
  | "CARD.MOVED" 
  | "CARD.CREATED" 
  | "CARD_CREATED" 
  | "ERROR";

interface CardMovedPayload {
  card_id: number;
  from_col: number;
  to_col: number;
  order: number;
}

interface CardCreatedPayload {
  column_id: number;
  card: Card;
}

interface BackendMessage {
  type?: SocketEventType;
  payload?: Board | CardMovedPayload | CardCreatedPayload | string | Record<string, unknown>;
}

/**
 * Type Guard para validar si el objeto es un Board completo
 */
function isBoard(data: unknown): data is Board {
  if (!data || typeof data !== "object") return false;
  const b = data as Board;
  return typeof b.id === "number" && Array.isArray(b.columns);
}

/**
 * Type Guard para el payload de movimiento
 */
function isCardMovedPayload(payload: unknown): payload is CardMovedPayload {
  if (!payload || typeof payload !== "object") return false;
  const p = payload as CardMovedPayload;
  return typeof p.card_id === "number" && typeof p.from_col === "number";
}

/**
 * Lógica principal de despacho de eventos
 */
export const handleSocketNotification = (rawData: unknown): void => {
  const store = useBoardsStore.getState();

  // 1. Verificación de Snapshot Directo
  if (isBoard(rawData)) {
    store.updateBoard(rawData);
    return;
  }

  // 2. Procesamiento de Mensajes con "Envelope" (Tipo + Payload)
  const message = rawData as BackendMessage;
  const eventType = (message.type || "").toUpperCase() as SocketEventType;
  const payload = message.payload;

  if (!eventType) return;

  switch (eventType) {
    /**
     * Sincronización de Tablero: Actualiza métricas y estructura completa.
     * Invocado tras cambios de permisos, ediciones de títulos o borrados.
     */
    case "BOARD.UPDATED":
    case "BOARD_SYNC":
      if (isBoard(payload)) {
        store.updateBoard(payload);
      }
      break;

    /**
     * Movimiento de Tarjetas: Actualización optimística en el Store.
     * Mapea la nomenclatura de Django (snake_case) al Store.
     */
    case "CARD_MOVED":
    case "CARD.MOVED":
      if (isCardMovedPayload(payload)) {
        store.moveCard(
          payload.from_col,
          payload.card_id,
          payload.to_col,
          payload.order
        );
      }
      break;

    /**
     * Creación de Tarjetas: Inserción inmediata en la columna.
     */
    case "CARD_CREATED":
    case "CARD.CREATED": {
      const p = payload as CardCreatedPayload;
      if (p?.card && p?.column_id) {
        store.addCard(Number(p.column_id), p.card);
      }
      break;
    }

    case "ERROR":
      console.error("❌ [WebSocket Service Layer]:", payload);
      break;

    default:
      // Si el payload es un Board pero el tipo no coincide, lo intentamos sincronizar
      if (isBoard(payload)) {
        store.updateBoard(payload);
      }
      break;
  }
};

// Registro del handler en el servicio de infraestructura
socketService.subscribe(handleSocketNotification);