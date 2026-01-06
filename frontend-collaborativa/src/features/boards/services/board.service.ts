import { http } from "@/api/http.service";
import { API_ENDPOINTS } from "@/core/constants/endpoints";
import { 
  Board, 
  Column, 
  Card, 
  PriorityLevel, 
  BoardMember, 
  UserRole
} from "../types/board.types";
import { AuthUser } from "@/features/auth/types/auth.types";

// --- Interfaces de apoyo para mapeo ---
interface BoardRaw extends Omit<Board, 'id' | 'owner' | 'members' | 'columns'> {
  id: string | number;
  owner: { id: string | number; username: string; email: string } | null;
  members: Array<{
    user?: { id: string | number; username: string; email: string };
    id?: string | number;
    username?: string;
    email?: string;
    role?: UserRole;
    joined_at?: string;
  }>;
  columns?: Array<ColumnRaw>;
}

interface ColumnRaw extends Omit<Column, 'id' | 'cards'> {
  id: string | number;
  cards?: Array<CardRaw>;
}

interface CardRaw extends Omit<Card, 'id' | 'column'> {
  id: string | number;
  column: string | number;
}

/**
 * Mapeador estricto para transformar la respuesta del backend
 */
const mapBoardResponse = (board: BoardRaw): Board => {
  return {
    ...board,
    id: Number(board.id),
    current_user_role: board.current_user_role ?? 'viewer',
    owner: board.owner 
      ? { ...board.owner, id: Number(board.owner.id) } 
      : { id: 0, username: 'Sin Propietario', email: '' },
    members: (board.members || []).map(m => ({
      user: {
        id: Number(m.user?.id ?? m.id ?? 0),
        username: m.user?.username ?? m.username ?? 'Invitado',
        email: m.user?.email ?? m.email ?? ''
      },
      role: m.role ?? 'viewer',
      joined_at: m.joined_at ?? new Date().toISOString()
    })),
    columns: (board.columns || []).map(col => ({
      ...col,
      id: Number(col.id),
      cards: (col.cards || []).map(card => ({
        ...card,
        id: Number(card.id),
        column: Number(card.column)
      }))
    }))
  } as Board;
};

export const boardService = {
  // --- Gestión de Tableros ---
  
  getBoards: async (): Promise<Board[]> => {
    const { data } = await http.get<{ results?: BoardRaw[] } | BoardRaw[]>(API_ENDPOINTS.BOARDS.BASE);
    const rawList = Array.isArray(data) ? data : (data.results || []);
    return rawList.map(mapBoardResponse);
  },

  getBoardDetail: async (id: string | number): Promise<Board> => {
    const { data } = await http.get<BoardRaw>(API_ENDPOINTS.BOARDS.DETAIL(id));
    return mapBoardResponse(data);
  },

  createBoard: async (title: string): Promise<Board> => {
    const { data } = await http.post<BoardRaw>(API_ENDPOINTS.BOARDS.BASE, { title });
    return mapBoardResponse(data);
  },

  updateBoard: async (id: string | number, title: string): Promise<Board> => {
    const cleanId = String(id).replace(/\/$/, "");
    const { data } = await http.patch<BoardRaw>(`${API_ENDPOINTS.BOARDS.BASE}${cleanId}/`, { title });
    return mapBoardResponse(data);
  },

  deleteBoard: async (id: string | number): Promise<void> => {
    const cleanId = String(id).replace(/\/$/, "");
    await http.delete(`${API_ENDPOINTS.BOARDS.BASE}${cleanId}/`);
  },

  // --- Gestión de Columnas ---

  createColumn: async (boardId: number, title: string): Promise<Column> => {
    const { data } = await http.post<ColumnRaw>(API_ENDPOINTS.COLUMNS.BASE, { 
      board: boardId, 
      title 
    });
    return { ...data, id: Number(data.id), cards: [] };
  },

  updateColumn: async (columnId: number, title: string): Promise<Column> => {
    const { data } = await http.patch<ColumnRaw>(`${API_ENDPOINTS.COLUMNS.BASE}${columnId}/`, { title });
    return { ...data, id: Number(data.id), cards: data.cards?.map(c => ({...c, id: Number(c.id), column: Number(c.column)})) || [] };
  },

  // ✅ NUEVA: Eliminar Columna
  deleteColumn: async (columnId: number): Promise<void> => {
    await http.delete(`${API_ENDPOINTS.COLUMNS.BASE}${columnId}/`);
  },

  // --- Gestión de Tarjetas ---

  createCard: async (
    columnId: number, 
    title: string, 
    description: string, 
    priority: PriorityLevel
  ): Promise<Card> => {
    const { data } = await http.post<CardRaw>(API_ENDPOINTS.CARDS.BASE, { 
      column: columnId, 
      title, 
      description, 
      priority 
    });
    return { ...data, id: Number(data.id), column: Number(data.column) };
  },

  // ✅ NUEVA: Actualizar Tarjeta (Título, descripción, prioridad, etc.)
  updateCard: async (cardId: number, payload: Partial<Card>): Promise<Card> => {
    const { data } = await http.patch<CardRaw>(`${API_ENDPOINTS.CARDS.BASE}${cardId}/`, payload);
    return { ...data, id: Number(data.id), column: Number(data.column) };
  },

  // ✅ NUEVA: Eliminar Tarjeta
  deleteCard: async (cardId: number): Promise<void> => {
    await http.delete(`${API_ENDPOINTS.CARDS.BASE}${cardId}/`);
  },

  moveCard: async (cardId: number, columnId: number, order: number): Promise<void> => {
    await http.patch(`${API_ENDPOINTS.CARDS.BASE}${cardId}/move/`, {
      column_id: columnId,
      new_order: order
    });
  },

  // --- Gestión de Miembros ---

  getBoardMembers: async (boardId: string | number): Promise<BoardMember[]> => {
    const cleanId = String(boardId).replace(/\/$/, "");
    const { data } = await http.get<BoardMember[]>(`${API_ENDPOINTS.BOARDS.BASE}${cleanId}/members/`);
    return (data || []).map(member => ({
      ...member,
      user: { ...member.user, id: Number(member.user.id) }
    }));
  },

  searchUsers: async (query: string, excludeBoardId?: string | number): Promise<AuthUser[]> => {
    const params = new URLSearchParams();
    params.append('q', query);
    if (excludeBoardId) {
      params.append('exclude_board', String(excludeBoardId));
    }
    const { data } = await http.get<AuthUser[]>(`${API_ENDPOINTS.USERS.SEARCH}`, { params });
    return data || [];
  },

  removeMember: async (boardId: string | number, userId: number): Promise<void> => {
    const cleanId = String(boardId).replace(/\/$/, "");
    await http.delete(`${API_ENDPOINTS.BOARDS.BASE}${cleanId}/members/${userId}/`);
  }
};