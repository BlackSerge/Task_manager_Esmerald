
export type PriorityLevel = 'low' | 'medium' | 'high'; 
export type UserRole = 'admin' | 'editor' | 'viewer';

export interface BoardMember {
  user: {
    id: number;
    username: string;
    email: string;
  };
  role: UserRole;
  joined_at: string;
}

export interface Card {
  id: number;
  title: string;
  description: string;
  order: number;
  column: number; 
  is_completed: boolean;
  priority: PriorityLevel;
  created_at?: string;
  updated_at?: string;
  owner_id?: number; 
  owner?: BoardMember;
}

export interface Column {
  id: number;
  title: string;
  order: number;
  board: number;
  cards: Card[];
}

export interface Board {
  id: number;
  title: string;
  current_user_role: UserRole; 
  columns: Column[];
  columns_count?: number;
  owner: BoardMember['user']; 
  owner_id?: number; 
  members: BoardMember[]; 
  total_cards: number;
  completed_cards: number;
  progress_percentage: number;
  last_activity?: string;
  created_at: string;
  updated_at: string;
}

export interface InviteMemberDto {
  user_id: number;
  role?: UserRole;
}

export interface CreateCardPayload {
  title: string;
  description: string;
  priority: PriorityLevel;
}

export interface MoveCardPayload {
  cardId: number;
  columnId: number;
  order: number;
}

// WebSocket Event Types
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
