//Para que el TypeScript estricto funcione correctamente en el SocketHandler, necesitamos definir la forma de los mensajes que llegan desde el servidor.
// src/services/events.types.ts
import { Board, Column, Card } from "@/features/boards/types";

export type SocketEventType = 
  | "BOARD_SYNC"
  | "BOARD_CREATED" 
  | "COLUMN_CREATED" 
  | "CARD_CREATED" 
  | "COLUMN_DELETED" 
  | "CARD_DELETED";

export type SocketEvent =
  | { type: "BOARD_SYNC"; payload: Board }
  | { type: "BOARD_CREATED"; payload: Board }
  | { type: "COLUMN_CREATED"; payload: { boardId: number; column: Column } }
  | { type: "CARD_CREATED"; payload: { columnId: number; card: Card } }
  | { type: "COLUMN_DELETED"; payload: { boardId: number; columnId: number } }
  | { type: "CARD_DELETED"; payload: { columnId: number; cardId: number } };