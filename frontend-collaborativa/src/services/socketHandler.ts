// src/services/socketHandler.ts
import { useBoardsStore } from "@/store/boardsStore";
import { SocketEvent } from "./events.types";
import { Board } from "@/features/boards/types";

/**
 * Type Guard estricto para validar si el objeto es un Board (sincronización inicial).
 * Verifica la estructura sin usar 'any'.
 */
function isInitialBoardData(data: unknown): data is Board {
  if (typeof data !== "object" || data === null) return false;
  
  // Cast temporal para validación de propiedades
  const board = data as Partial<Board>;
  
  return (
    typeof board.id === "number" &&
    typeof board.title === "string" &&
    Array.isArray(board.columns) &&
    !("type" in data) // El objeto Board inicial del backend no tiene 'type'
  );
}

export const handleSocketNotification = (rawData: unknown): void => {
  const store = useBoardsStore.getState();

  // 1. Manejo del objeto inicial (Sync Completa)
  if (isInitialBoardData(rawData)) {
    console.log("📦 [SocketHandler]: Recibida sincronización inicial del tablero");
    store.updateBoard(rawData);
    return;
  }

  // 2. Manejo de eventos específicos (Notificaciones parciales)
  const event = rawData as SocketEvent;

  if (!event.type) {
    console.warn("⚠️ [SocketHandler]: Mensaje recibido sin propiedad 'type':", rawData);
    return;
  }

  switch (event.type) {
    case "BOARD_SYNC":
    case "BOARD_CREATED":
      store.updateBoard(event.payload);
      break;

    case "COLUMN_CREATED":
      store.addColumn(event.payload.boardId, event.payload.column);
      break;

    case "CARD_CREATED":
      store.addCard(event.payload.columnId, event.payload.card);
      break;

    case "COLUMN_DELETED":
      store.removeColumn(event.payload.boardId, event.payload.columnId);
      break;

    case "CARD_DELETED":
      store.removeCard(event.payload.columnId, event.payload.cardId);
      break;

    default: {
      // Verificación de exhaustividad para TypeScript
      const _exhaustiveCheck: never = event;
      console.warn("[SocketHandler]: Evento no soportado:", _exhaustiveCheck);
    }
  }
};