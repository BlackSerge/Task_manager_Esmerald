
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