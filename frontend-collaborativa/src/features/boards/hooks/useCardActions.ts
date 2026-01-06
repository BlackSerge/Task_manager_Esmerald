import { useMutation, useQueryClient } from "@tanstack/react-query";
import { boardService } from "../services/board.service";
import { useBoardsStore } from "../store/board.store";
import { boardKeys } from "./useBoards"; 
import { PriorityLevel, Card } from "../types/board.types";

export const useBoardActions = (boardId?: string) => {
  const queryClient = useQueryClient();
  const store = useBoardsStore();

  // Helper para invalidar ambas fuentes de verdad
  const invalidateBoard = (bId?: string | number) => {
    queryClient.invalidateQueries({ queryKey: boardKeys.all });
    if (bId) {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(String(bId)) });
    }
  };

  // MUTACIÓN: Crear Tarjeta
  const createCard = useMutation({
    mutationFn: (payload: { columnId: number; title: string; priority: PriorityLevel }) =>
      boardService.createCard(payload.columnId, payload.title, "", payload.priority),
    onSuccess: (newCard) => {
      store.addCard(newCard.column, newCard);
      invalidateBoard(boardId);
    },
  });

  // MUTACIÓN: Mover Tarjeta (Orquestada)
  const moveCard = useMutation({
    mutationFn: (params: { cardId: number; fromColumnId: number; toColumnId: number; order: number }) =>
      boardService.moveCard(params.cardId, params.toColumnId, params.order),
    onSuccess: (_, variables) => {
      // Sincronía inmediata en Store para las métricas de BoardCard
      store.moveCard(variables.fromColumnId, variables.cardId, variables.toColumnId, variables.order);
      invalidateBoard(boardId);
    },
  });

  // MUTACIÓN: Actualizar Tarjeta
  const updateCard = useMutation({
    mutationFn: (params: { cardId: number; payload: Partial<Card> }) =>
      boardService.updateCard(params.cardId, params.payload),
    onSuccess: (updatedCard) => {
      store.updateCard(updatedCard.column, updatedCard.id, updatedCard);
      invalidateBoard(boardId);
    },
  });

  return {
    createCard: createCard.mutate,
    moveCard: moveCard.mutate,
    updateCard: updateCard.mutate,
    isLoading: createCard.isPending || moveCard.isPending || updateCard.isPending
  };
};