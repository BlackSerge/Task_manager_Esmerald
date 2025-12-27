// En lugar de funciones sueltas, agruparemos todo en un objeto de servicio. Esto facilita el testeo y la organización. 
// Además, utilizaremos el cliente http que ya configuramos con interceptores de token.

import { http } from "@/services/http.service";
import { API_ENDPOINTS } from "./api.constants"; // Asumiendo que centralizas URLs
import { Board ,Card ,Column } from "@/features/boards/types";

export const boardService = {
  getBoards: async (): Promise<Board[]> => {
    const { data } = await http.get<Board[]>(API_ENDPOINTS.BOARDS);
    return data;
  },

 createBoard: async (title: string): Promise<Board> => {
    const response = await http.post<Board>("/boards/", { title });
    return response.data;
  },

  createList: async (boardId: string, title: string): Promise<Column> => {
    const { data } = await http.post<Column>(API_ENDPOINTS.COLUMNS(boardId), { title });
    return data;
  },

  createColumn: async (boardId: string, title: string): Promise<Column> => {
    const response = await http.post<Column>(`/boards/${boardId}/columns/`, { title });
    return response.data;
  },

  // ✅ Renombrado de deleteList a deleteColumn
  deleteColumn: async (boardId: string, columnId: string): Promise<void> => {
    await http.delete(`/boards/${boardId}/columns/${columnId}/`);
  },

  createCard: async (listId: string, title: string, description?: string): Promise<Card> => {
    const { data } = await http.post<Card>(API_ENDPOINTS.CARDS(listId), { title, description });
    return data;
  },

  deleteList: async (boardId: string, listId: string): Promise<void> => {
    await http.delete(`/boards/${boardId}/lists/${listId}/`);
  },

  deleteCard: async (listId: string, cardId: string): Promise<void> => {
    await http.delete(`/lists/${listId}/cards/${cardId}/`);
  }
};