// src/features/boards/services/socket/events.types.ts
import { Board, Column, Card } from "../../types/board.types";

// src/features/boards/services/socket/events.types.ts
export type SocketEventType =
  | { type: "BOARD_SYNC" | "BOARD_CREATED" | "board.updated"; payload: Board } 
  | { type: "COLUMN_CREATED"; payload: { boardId: number; column: Column } }
  | { type: "COLUMN_DELETED"; payload: { boardId: number; columnId: number } }
  | { type: "CARD_CREATED"; payload: { columnId: number; card: Card } }
  | { type: "CARD_UPDATED"; payload: { cardId: number; card: Partial<Card>; } }    // 👈 Agregado
  | { type: "CARD_DELETED"; payload: { columnId: number; cardId: number } };
  
  