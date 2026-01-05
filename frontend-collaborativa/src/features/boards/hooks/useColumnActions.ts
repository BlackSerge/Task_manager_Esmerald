// src/features/boards/hooks/useColumnActions.ts
import { 
  useDeleteColumn, 
  useUpdateColumn, 
  useCreateCard,
  useDeleteCard,
  useUpdateCard 
} from "./useBoards";
import { socketService } from "@/features/boards/services/socket/socket.service";
import { Card } from "../types/board.types";

/**
 * Interface local: Solo se usa en este hook para la creación de tarjetas.
 * Mantiene el tipado estricto basado en la entidad Card sin ensuciar types.ts
 */
export interface CreateCardDTO extends Pick<Card, 'title' | 'priority'> {
  description?: string; 
}

export const useColumnActions = (boardId: string, columnId: number) => {
  const { mutate: deleteColumn } = useDeleteColumn();
  const { mutate: updateColumn } = useUpdateColumn();
  const { mutate: deleteCard } = useDeleteCard();
  const { mutate: updateCard } = useUpdateCard();
  const { mutate: createCard, isPending: isCreatingCard } = useCreateCard();

  return {
    isCreatingCard,

    deleteColumn: () => 
      deleteColumn({ boardId: Number(boardId), columnId }),
    
    updateColumn: (title: string) => {
      updateColumn({ boardId: Number(boardId), columnId, title });
      socketService.send({ 
        type: "COLUMN_UPDATED", 
        payload: { columnId, title } 
      });
    },

    deleteCard: (cardId: number) => 
      deleteCard({ columnId, cardId }),

    updateCard: (cardId: number, title: string) => 
      updateCard({ 
        boardId: Number(boardId), 
        cardId, 
        payload: { title } 
      }),

    createCard: (data: CreateCardDTO, onSuccess: () => void) => {
      createCard(
        { 
          columnId, 
          title: data.title, 
          description: data.description ?? "", 
          priority: data.priority 
        }, 
        { onSuccess }
      );
    }
  };
};