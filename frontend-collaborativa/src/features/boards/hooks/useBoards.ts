import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { boardService } from "../services/board.service";
import { useBoardsStore } from "../store/board.store";
import { Board, Column, Card ,PriorityLevel } from "../types/board.types";

export const boardKeys = {
  all: ['boards'] as const,
  lists: () => [...boardKeys.all, 'list'] as const,
  details: () => [...boardKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...boardKeys.details(), id] as const,
};

// 1. Obtener lista de tableros (BoardListSerializer)
export const useBoards = () => {
  const setBoards = useBoardsStore((state) => state.setBoards);

  return useQuery<Board[], Error>({
    queryKey: boardKeys.all,
    queryFn: async () => {
      const boards = await boardService.getBoards();
      setBoards(boards);
      return boards;
    },
  });
};

// 💡 2. Obtener detalle (BoardDetailSerializer - TRAE COLUMNAS)
export const useBoardDetail = (id: string | undefined) => {
  const updateBoard = useBoardsStore((state) => state.updateBoard);

  return useQuery<Board, Error>({
    queryKey: boardKeys.detail(id || ""),
    queryFn: async () => {
      if (!id) throw new Error("ID requerido");
      const board = await boardService.getBoardDetail(id);
      updateBoard(board); // Sincroniza con Zustand
      return board;
    },
    enabled: !!id,
  });
};

// 3. Crear un tablero
export const useCreateBoard = () => {
  const queryClient = useQueryClient();
  const addBoard = useBoardsStore((state) => state.addBoard);

  return useMutation<Board, Error, string>({
    mutationFn: boardService.createBoard,
    onSuccess: (newBoard) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
      addBoard(newBoard);
    },
  });
};

// 4. Crear una columna
export const useCreateColumn = () => {
  const queryClient = useQueryClient();
  const addColumn = useBoardsStore((state) => state.addColumn);

  return useMutation<Column, Error, { boardId: number; title: string }>({
    mutationFn: ({ boardId, title }) => boardService.createColumn(boardId, title),
    onSuccess: (newColumn, variables) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
      addColumn(variables.boardId, newColumn);
    },
  });
};


export const useCreateCard = () => {
  const queryClient = useQueryClient();
  const addCard = useBoardsStore((state) => state.addCard);

  return useMutation<Card, Error, { columnId: number; title: string; description?: string; priority: PriorityLevel }>({
    mutationFn: ({ columnId, title, description, priority }) =>
      boardService.createCard(columnId, title, description || "", priority),
    
    onSuccess: (newCard, variables) => {
     
      const cardToStore = {
        ...newCard,
        priority: newCard.priority || variables.priority
      };

      // Invalidamos para asegurar frescura de datos
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
      
      // Actualizamos el store con la tarjeta "asegurada"
      addCard(variables.columnId, cardToStore);
    },
  });
};

export const useUpdateColumn = () => {
  const queryClient = useQueryClient();
  return useMutation<Column, Error, { boardId: number; columnId: number; title: string }>({
    mutationFn: ({ columnId, title }) => boardService.updateColumn(columnId, title),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(String(variables.boardId)) });
    },
  });
};

export const useUpdateCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Card, Error, { boardId: number; cardId: number; payload: Partial<Card> }>({
    mutationFn: ({ cardId, payload }) => boardService.updateCard(cardId, payload),
    
    // Al empezar la mutación podrías hacer algo, pero el hook de DND ya hizo el movimiento en el store.
    
    onSuccess: (_, variables) => {
      // Confirmamos los datos con el servidor en segundo plano
      queryClient.invalidateQueries({ 
        queryKey: boardKeys.detail(String(variables.boardId)) 
      });
    },

    onError: (error, variables) => {
      
      console.error("Error al mover tarjeta, revirtiendo...", error);
      
      queryClient.invalidateQueries({ 
        queryKey: boardKeys.detail(String(variables.boardId)) 
      });

     
    },
  });
};

// 6. Eliminar una columna
export const useDeleteColumn = () => {
  const queryClient = useQueryClient();
  const removeColumn = useBoardsStore((state) => state.removeColumn);

  return useMutation<void, Error, { boardId: number; columnId: number }>({
    mutationFn: ({ columnId }) => boardService.deleteColumn(columnId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
      removeColumn(variables.boardId, variables.columnId);
    },
  });
};

// 7. Eliminar una tarjeta
export const useDeleteCard = () => {
  const queryClient = useQueryClient();
  const removeCard = useBoardsStore((state) => state.removeCard);

  return useMutation<void, Error, { columnId: number; cardId: number }>({
    mutationFn: ({ cardId }) => boardService.deleteCard(cardId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
      removeCard(variables.columnId, variables.cardId);
    },
  });
};