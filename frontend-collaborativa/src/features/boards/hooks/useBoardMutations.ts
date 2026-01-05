import { useMutation, useQueryClient } from "@tanstack/react-query";
import { boardService } from "../services/board.service";
import { boardKeys } from "./useBoards";

/**
 * Hook para gestionar la mutación de movimiento de tarjetas.
 * Cumple con el principio de responsabilidad única: solo se encarga de la persistencia.
 */
export const useMoveCardMutation = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { cardId: number; columnId: number; order: number }) =>
      boardService.moveCard(params.cardId, params.columnId, params.order),
    
    onSuccess: () => {
     
      queryClient.invalidateQueries({ 
        queryKey: boardKeys.detail(boardId) 
      });
    },
    onError: (error) => {
      console.error("Error al mover la tarjeta:", error);
    }
  });
};