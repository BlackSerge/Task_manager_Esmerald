import { http } from "@/services/http.service";
import { API_ENDPOINTS } from "@/services/api.constants";
import { Board, Column, Card } from "./types";

export const boardService = {
  // 1. Obtener todos los tableros
  getBoards: async (): Promise<Board[]> => {
    const { data } = await http.get<Board[]>(API_ENDPOINTS.BOARDS);
    return data;
  },

  // 2. Crear un tablero (Faltaba esta función)
  createBoard: async (title: string): Promise<Board> => {
    const { data } = await http.post<Board>(API_ENDPOINTS.BOARDS, { title });
    return data;
  },

  // 3. Crear una lista (Column en Django)
  createList: async (boardId: string, title: string): Promise<Column> => {
    // Ajustado para enviar el payload que espera Django
    const { data } = await http.post<Column>('/api/columns/', { 
      board: boardId, 
      title 
    });
    return data;
  },

  // 4. Crear una tarjeta (Ahora acepta 3 argumentos)
  createCard: async (listId: string, title: string, description?: string): Promise<Card> => {
    const { data } = await http.post<Card>('/api/cards/', { 
      column: listId, 
      title, 
      description 
    });
    return data;
  },

  // 5. Eliminar lista
  deleteList: async (boardId: string, listId: string): Promise<void> => {
    await http.delete(`/api/columns/${listId}/`);
  },

  // 6. Eliminar tarjeta
  deleteCard: async (listId: string, cardId: string): Promise<void> => {
    await http.delete(`/api/cards/${cardId}/`);
  }
};