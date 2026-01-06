// src/features/boards/hooks/useMoveCardMutation.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { boardService } from "../services/board.service";
import { boardKeys } from "./useBoards";
import { Board, Card } from "../types/board.types";
import { getColumnStatusConfig } from "@/shared/utils/column.utils";

export const useMoveCardMutation = (boardId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    // Casteamos a string para el servicio, manejando el caso undefined
    mutationFn: (params: { cardId: number; columnId: number; order: number }) =>
      boardService.moveCard(params.cardId, params.columnId, params.order),

    onMutate: async (variables) => {
      if (!boardId) return;

      const queryKey = boardKeys.detail(boardId);
      await queryClient.cancelQueries({ queryKey });
      const previousBoard = queryClient.getQueryData<Board>(queryKey);

      if (previousBoard) {
        queryClient.setQueryData<Board>(queryKey, (old) => {
          if (!old) return old;

          const newColumns = old.columns.map((col, idx) => {
            const filteredCards = col.cards?.filter(c => c.id !== variables.cardId) || [];
            
            if (col.id === variables.columnId) {
              const movingCard = old.columns
                .flatMap(c => c.cards || [])
                .find(c => c.id === variables.cardId);

              if (movingCard) {
                // Se usa el idx y el total para saber si es la última columna (Done)
                const config = getColumnStatusConfig(col.title, idx, old.columns.length);
                const updatedCard: Card = { 
                  ...movingCard, 
                  is_completed: config.isDone,
                  order: variables.order 
                };

                const newCards = [...filteredCards];
                newCards.splice(variables.order, 0, updatedCard);
                return { ...col, cards: newCards };
              }
            }
            return { ...col, cards: filteredCards };
          });

          // RECALCULO DE MÉTRICAS: Esto es lo que lee el BoardCard
          const allCards = newColumns.flatMap(c => c.cards || []);
          const total = allCards.length;
          const completed = allCards.filter(c => c.is_completed).length;
          const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

          return { 
            ...old, 
            columns: newColumns,
            total_cards: total,
            completed_cards: completed,
            progress_percentage: progress
          };
        });
      }
      return { previousBoard };
    },

    onSuccess: () => {
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
        // Importante: Invalidamos la lista global para que el BoardCard se entere
        queryClient.invalidateQueries({ queryKey: boardKeys.all });
      }
    },

    onError: (_err, _var, context) => {
      if (context?.previousBoard && boardId) {
        queryClient.setQueryData(boardKeys.detail(boardId), context.previousBoard);
      }
    },
  });
};