import { Board, Column, Card } from "@/features/boards/types";

export type SocketEvent =
  | { type: "BOARD_CREATED"; payload: Board }
  | { type: "COLUMN_CREATED"; payload: { boardId: string; column: Column } }
  | { type: "CARD_CREATED"; payload: { listId: string; card: Card } }
  | { type: "COLUMN_DELETED"; payload: { boardId: string; columnId: string } }
  | { type: "CARD_DELETED"; payload: { listId: string; cardId: string } }; 