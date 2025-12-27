import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { boardService } from "./api"; 
import { Board, Column, Card } from "./types";

/**
 * Claves de Query centralizadas.
 * Siguiendo Clean Code, esto evita errores de "magic strings" en toda la app.
 */
const BOARD_KEYS = {
  all: ["boards"] as const,
  detail: (id: string) => ["boards", id] as const,
};

// 1. Obtener todos los tableros
export const useBoards = () => {
  return useQuery<Board[], Error>({
    queryKey: BOARD_KEYS.all,
    queryFn: boardService.getBoards,
  });
};

// 2. Crear un tablero
export const useCreateBoard = () => {
  const queryClient = useQueryClient();
  return useMutation<Board, Error, string>({
    mutationFn: (title: string) => boardService.createBoard(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.all });
    },
  });
};

// 3. Crear una lista (Column en Django)
export const useCreateList = () => {
  const queryClient = useQueryClient();
  return useMutation<Column, Error, { boardId: string; title: string }>({
    mutationFn: ({ boardId, title }) => boardService.createList(boardId, title),
    onSuccess: () => {
      // Al invalidar "boards", React Query volverá a pedir el árbol completo,
      // manteniendo la UI sincronizada con la nueva columna.
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.all });
    },
  });
};

// 4. Crear una tarjeta
export const useCreateCard = () => {
  const queryClient = useQueryClient();
  return useMutation<Card, Error, { listId: string; title: string; description?: string }>({
    mutationFn: ({ listId, title, description }) => 
      boardService.createCard(listId, title, description), // Ahora recibe los 3 parámetros
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.all });
    },
  });
};

// 5. Eliminar una lista
export const useDeleteList = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { boardId: string; listId: string }>({
    mutationFn: ({ boardId, listId }) => boardService.deleteList(boardId, listId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.all });
    },
  });
};

// 6. Eliminar una tarjeta
export const useDeleteCard = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { listId: string; cardId: string }>({
    mutationFn: ({ listId, cardId }) => boardService.deleteCard(listId, cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.all });
    },
  });
};