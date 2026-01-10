
import { Board, Column, Card } from "./board.types";

export enum BoardSocketType {
  BOARD_SYNC = "BOARD_SYNC",
  BOARD_UPDATED = "BOARD_UPDATED",
  COLUMN_CREATED = "COLUMN_CREATED",
  COLUMN_DELETED = "COLUMN_DELETED",
  CARD_CREATED = "CARD_CREATED",
  CARD_UPDATED = "CARD_UPDATED",
  CARD_DELETED = "CARD_DELETED",
  CARD_MOVED = "CARD_MOVED" 
}

export type SocketEvent =
  | { type: BoardSocketType.BOARD_SYNC | BoardSocketType.BOARD_UPDATED; payload: Board }
  | { type: BoardSocketType.COLUMN_CREATED; payload: { boardId: number; column: Column } }
  | { type: BoardSocketType.COLUMN_DELETED; payload: { boardId: number; columnId: number } }
  | { type: BoardSocketType.CARD_CREATED; payload: { columnId: number; card: Card } }
  | { type: BoardSocketType.CARD_UPDATED; payload: { cardId: number; columnId: number; card: Partial<Card> } }
  | { type: BoardSocketType.CARD_DELETED; payload: { columnId: number; cardId: number } }
  | { type: BoardSocketType.CARD_MOVED; payload: { cardId: number; fromColumnId: number; toColumnId: number; newOrder: number } };