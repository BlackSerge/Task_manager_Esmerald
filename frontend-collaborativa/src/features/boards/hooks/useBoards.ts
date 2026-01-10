// src/features/boards/hooks/useBoards.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { boardService } from "../services/board.service";
import { useBoardsStore } from "../store/board.store";
import { Board, Column, Card, PriorityLevel } from "../types/board.types";

export const boardKeys = {
  all: ['boards'] as const,
  lists: () => [...boardKeys.all, 'list'] as const,
  details: () => [...boardKeys.all, 'detail'] as const,
  // 💡 Forzamos que el ID siempre sea string para evitar fallos de coincidencia de cache
  detail: (id: string | number) => [...boardKeys.details(), String(id)] as const,
};

// --- HOOKS DE CONSULTA ---

export const useBoards = () => {
  const setBoards = useBoardsStore((state) => state.setBoards);

  return useQuery<Board[], Error>({
    queryKey: boardKeys.all,
    queryFn: async () => {
      const boards = await boardService.getBoards();
      if (boards && Array.isArray(boards)) {
        setBoards(boards);
      }
      return boards;
    },
    staleTime: 1000 * 60 * 5, 
  });
};

export const useBoardDetail = (id: string | undefined) => {
  const updateBoard = useBoardsStore((state) => state.updateBoard);

  return useQuery<Board, Error>({
    queryKey: boardKeys.detail(id || ""),
    queryFn: async () => {
      if (!id) throw new Error("ID requerido");
      const board = await boardService.getBoardDetail(id);
      updateBoard(board); 
      return board;
    },
    enabled: !!id,
    staleTime: 0,
  });
};

// --- HOOKS DE MUTACIÓN ---

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

export const useCreateColumn = () => {
  const queryClient = useQueryClient();
  const addColumn = useBoardsStore((state) => state.addColumn);

  return useMutation<Column, Error, { boardId: number; title: string }>({
    mutationFn: ({ boardId, title }) => boardService.createColumn(boardId, title),
    onSuccess: (newColumn, variables) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(variables.boardId) });
      addColumn(variables.boardId, newColumn);
    },
  });
};

export const useCreateCard = () => {
  const queryClient = useQueryClient();
  const addCard = useBoardsStore((state) => state.addCard);

  return useMutation<Card, Error, { boardId: number; columnId: number; title: string; description?: string; priority: PriorityLevel }>({
    mutationFn: ({ columnId, title, description, priority }) =>
      boardService.createCard(columnId, title, description || "", priority),
    onSuccess: (newCard, variables) => {
      const cardToStore = { ...newCard, priority: newCard.priority || variables.priority };
      
      // 🎯 Sincronización crucial
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(variables.boardId) });
      addCard(variables.columnId, cardToStore);
    },
  });
};

export const useUpdateColumn = () => {
  const queryClient = useQueryClient();
  return useMutation<Column, Error, { boardId: number; columnId: number; title: string }>({
    mutationFn: ({ columnId, title }) => boardService.updateColumn(columnId, title),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(variables.boardId) });
    },
  });
};

export const useUpdateCard = (boardIdContext?: number) => { 
  const queryClient = useQueryClient();
  const updateCardStore = useBoardsStore((state) => state.updateCard);

  return useMutation<Card, Error, { boardId: number; cardId: number; payload: Partial<Card> }>({
    mutationFn: ({ cardId, payload }) => boardService.updateCard(cardId, payload),
    onSuccess: (updatedCard, variables) => {
      const bId = variables.boardId || boardIdContext;

      // Actualizamos store local primero (Optimistic UI parcial)
      updateCardStore(updatedCard.column, updatedCard.id, updatedCard);
      
      // Invalidamos para que React Query traiga la verdad del servidor
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
      if (bId) {
        queryClient.invalidateQueries({ queryKey: boardKeys.detail(bId) });
      }
    },
    onError: (error, variables) => {
      console.error("Error al actualizar tarjeta:", error);
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(variables.boardId) });
    },
  });
};

export const useDeleteColumn = () => {
  const queryClient = useQueryClient();
  const removeColumn = useBoardsStore((state) => state.removeColumn);

  return useMutation<void, Error, { boardId: number; columnId: number }>({
    mutationFn: ({ columnId }) => boardService.deleteColumn(columnId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(variables.boardId) });
      removeColumn(variables.boardId, variables.columnId);
    },
  });
};

export const useDeleteCard = () => {
  const queryClient = useQueryClient();
  const removeCard = useBoardsStore((state) => state.removeCard);

  return useMutation<void, Error, { boardId: number; columnId: number; cardId: number }>({
    mutationFn: ({ cardId }) => boardService.deleteCard(cardId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(variables.boardId) });
      removeCard(variables.columnId, variables.cardId);
    },
  });
};

export const useMoveCard = (boardId: string) => {
  const queryClient = useQueryClient();
  const moveCardStore = useBoardsStore((state) => state.moveCard);

  return useMutation({
    mutationFn: (params: { cardId: number; columnId: number; order: number; fromColumnId: number }) =>
      boardService.moveCard(params.cardId, params.columnId, params.order),
    onSuccess: (_, variables) => {
      // 1. Actualizamos localmente para feedback instantáneo
      moveCardStore(variables.fromColumnId, variables.cardId, variables.columnId, variables.order);
      // 2. Invalidamos AMBAS llaves para que BoardCard y BoardDetail se refresquen
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
  });
};