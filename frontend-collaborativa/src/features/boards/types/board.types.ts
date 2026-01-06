export type PriorityLevel = 'low' | 'medium' | 'high'; 
export type UserRole = 'admin' | 'editor' | 'viewer';

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
  total_cards?: number;
  completed_cards?: number;
  progress_percentage?: number;
  last_activity?: string;
  created_at: string;
  updated_at: string;
}


export interface BoardMember {
  user: {
    id: number;
    username: string;
    email: string;
  };
  role: UserRole;
  joined_at: string;
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

export interface BoardsStore {
  boards: Board[];
  isLoading: boolean;
  error: string | null;
  setBoards: (boards: Board[]) => void;
  updateBoard: (updatedBoard: Board) => void;
  addBoard: (board: Board) => void;
  addColumn: (boardId: number, column: Column) => void;
  removeColumn: (boardId: number, columnId: number) => void;
  addCard: (columnId: number, card: Card) => void;
  updateCard: (columnId: number, cardId: number, payload: Partial<Card>) => void;
  removeCard: (columnId: number, cardId: number) => void;
  moveCard: (columnId: number, cardId: number, targetColumnId: number, newIndex: number) => void;
  addMemberToBoard: (boardId: number, member: BoardMember) => void;
 
}