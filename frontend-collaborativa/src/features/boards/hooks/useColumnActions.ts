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

export interface CreateCardDTO extends Pick<Card, 'title' | 'priority'> {
  description?: string; 
}

export const useColumnActions = (boardId: string, columnId: number) => {
  // Convertimos a número una sola vez para limpieza
  const bId = Number(boardId);

  const { mutate: deleteColumn } = useDeleteColumn();
  const { mutate: updateColumn } = useUpdateColumn();
  const { mutate: deleteCard } = useDeleteCard();
  const { mutate: updateCard } = useUpdateCard(bId); // Pasamos el bId al hook si es necesario
  const { mutate: createCard, isPending: isCreatingCard } = useCreateCard();

  return {
    isCreatingCard,

    deleteColumn: () => 
      deleteColumn({ boardId: bId, columnId }),
    
    updateColumn: (title: string) => {
      updateColumn({ boardId: bId, columnId, title });
      socketService.send({ 
        type: "COLUMN_UPDATED", 
        payload: { columnId, title } 
      });
    },

 
    deleteCard: (cardId: number) => 
      deleteCard({ boardId: bId, columnId, cardId }),

    updateCard: (cardId: number, payload: Partial<Card>) => 
      updateCard({ 
        boardId: bId, 
        cardId, 
        payload 
      }),

  
    createCard: (data: CreateCardDTO, onSuccess: () => void) => {
      createCard(
        { 
          boardId: bId, 
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