import { useMutation, useQueryClient } from "@tanstack/react-query";
import { boardService } from "../services/board.service";
import { useBoardsStore } from "../store/board.store";
import { boardKeys } from "./useBoards";
import { Card } from "../types/board.types";

export const useCardActions = (boardId: string | undefined) => {
  const queryClient = useQueryClient();
  const store = useBoardsStore();

  /**
   * 1. CREAR CARD (INSTANTÁNEO)
   */
  const createCardMutation = useMutation({
    mutationFn: (payload: { columnId: number; title: string }) =>
      boardService.createCard(payload.columnId, payload.title, "", "medium"),
    
    onMutate: async (newCard) => {
      if (!boardId) return;
      await queryClient.cancelQueries({ queryKey: boardKeys.detail(boardId) });

      const tempCard: Card = {
        id: Math.floor(Math.random() * -1000), // ID temporal para UI
        title: newCard.title,
        column: newCard.columnId,
        order: 999,
        description: "",
        priority: "medium",
        is_completed: false,
      };

      // Update instantáneo en Zustand
      store.addCard(newCard.columnId, tempCard);
      return { tempCard };
    },
    onError: () => {
      if (boardId) queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
    onSuccess: () => {
      if (boardId) queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    }
  });

  /**
   * 2. ACTUALIZAR CARD (OPTIMISTA)
   */
  const updateCardMutation = useMutation({
    mutationFn: ({ cardId, payload }: { cardId: number; columnId: number; payload: Partial<Card> }) =>
      boardService.updateCard(cardId, payload),
    
    onMutate: async (vars) => {
      if (!boardId) return;
      await queryClient.cancelQueries({ queryKey: boardKeys.detail(boardId) });

      // Actualizar Zustand inmediatamente
      store.updateCard(vars.columnId, vars.cardId, vars.payload);
    },
    onError: () => {
      if (boardId) queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
    onSuccess: () => {
      if (boardId) queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    }
  });

  /**
   * 3. ELIMINAR CARD (INSTANTÁNEO)
   */
  const deleteCardMutation = useMutation({
    mutationFn: (vars: { cardId: number; columnId: number }) => 
      boardService.deleteCard(vars.cardId),
    
    onMutate: async (vars) => {
      if (!boardId) return;
      await queryClient.cancelQueries({ queryKey: boardKeys.detail(boardId) });

      // Eliminar de Zustand inmediatamente
      store.removeCard(vars.columnId, vars.cardId);
    },
    onError: () => {
      if (boardId) queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
    onSuccess: () => {
      if (boardId) queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    }
  });

  /**
   * 4. MOVER CARD
   */
  const moveCardMutation = useMutation({
    mutationFn: ({ cardId, columnId, order }: { cardId: number; columnId: number; fromColumnId: number; order: number }) =>
      boardService.moveCard(cardId, columnId, order),
    
    onMutate: async (vars) => {
      if (!boardId) return;
      await queryClient.cancelQueries({ queryKey: boardKeys.detail(boardId) });
      
      // Mover en Zustand inmediatamente
      store.moveCard(vars.fromColumnId, vars.cardId, vars.columnId, vars.order);
    },
    onError: () => {
      if (boardId) queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
    onSuccess: () => {
      if (boardId) queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    }
  });

  return {
    createCard: createCardMutation.mutate,
    updateCard: updateCardMutation.mutate,
    deleteCard: deleteCardMutation.mutate, // Agregado
    moveCard: moveCardMutation.mutate,
    isPending: 
      createCardMutation.isPending || 
      updateCardMutation.isPending || 
      deleteCardMutation.isPending ||
      moveCardMutation.isPending
  };
};