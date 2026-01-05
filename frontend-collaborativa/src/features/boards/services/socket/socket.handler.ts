// src/features/boards/services/socket/socket.handler.ts
import { useBoardsStore } from "../../store/board.store";
import { Board, Column, Card ,BoardMember } from "../../types/board.types";
import { socketService } from "./socket.service";

/**
 * Interfaces Estrictas para el Payload
 */
interface BackendEnvelope {
  message?: unknown;
  type?: string;
  action?: string;
  payload?: unknown;
  data?: unknown;
}

interface ColumnPayload {
  boardId?: number | string;
  board_id?: number | string;
  column?: Column;
}

interface CardCreatedPayload {
  columnId: number | string;
  card: Card;
}

interface CardMovedPayload {
  id: number | string;         // ID de la tarjeta
  column: number | string;     // ID de la columna destino
  from_column: number | string; // ID de la columna origen
  order: number;               // Nuevo índice/orden
}

interface MemberAddedPayload {
  boardId: number | string;
  member: BoardMember; // Importado de tus types
}

function isInitialBoardData(data: unknown): data is Board {
  if (typeof data !== "object" || data === null) return false;
  const board = data as Partial<Board>;
  return (
    typeof board.id === "number" && 
    Array.isArray(board.columns) &&
    !("type" in data)
  );
}

export const handleSocketNotification = (rawData: unknown): void => {
  const store = useBoardsStore.getState();

  // 1. Sincronización inicial
  if (isInitialBoardData(rawData)) {
    store.updateBoard(rawData);
    return;
  }

  // 2. Desempaquetado
  let data: unknown = rawData;
  const envelope = rawData as BackendEnvelope;
  if (envelope?.message) {
    data = envelope.message;
  }

  if (isInitialBoardData(data)) {
    store.updateBoard(data);
    return;
  }

  // 3. Procesamiento de Eventos
  const event = data as BackendEnvelope;
  if (!event || typeof event !== 'object') return;

  const eventType = event.type || event.action;
  const payload = event.payload || event.data || event;

  if (!eventType) return;

  // Normalizamos el type a mayúsculas para evitar errores de case-sensitive
  switch (eventType.toUpperCase()) {
    case "BOARD_SYNC":
    case "BOARD.UPDATED":
      store.updateBoard(payload as Board);
      break;

    case "COLUMN_CREATED":
    case "COLUMN.CREATED": {
      const p = payload as ColumnPayload;
      const bId = Number(p.boardId ?? p.board_id);
      const col = p.column ?? (p as unknown as Column);
      if (!isNaN(bId) && col) store.addColumn(bId, col);
      break;
    }

    case "CARD_CREATED": {
      const p = payload as CardCreatedPayload;
      if (p.card && p.columnId) {
        store.addCard(Number(p.columnId), p.card);
      }
      break;
    }
case "MEMBER_ADDED":
    case "MEMBER.ADDED": {
      const p = payload as MemberAddedPayload;
      const bId = Number(p.boardId);
      
      if (!isNaN(bId) && p.member) {
        // Usamos la acción del store que ya creamos
        store.addMemberToBoard(bId, p.member);
      }
      break;
    }
case "CARD_MOVED": {
  const p = payload as CardMovedPayload;
  console.log("📥 [SocketHandler] Moviendo tarjeta:", p);
  
  // Forzamos la conversión a número para evitar fallos de comparación
  store.moveCard(
    Number(p.from_column), 
    Number(p.id), 
    Number(p.column), 
    Number(p.order)
  );
  break;
}


    case "COLUMN_DELETED": {
      const p = payload as { boardId: number | string; columnId: number };
      store.removeColumn(Number(p.boardId), p.columnId);
      break;
    }

    default:
      console.warn(`[SocketHandler]: Evento no soportado: ${eventType}`);
  }
};

socketService.subscribe(handleSocketNotification);