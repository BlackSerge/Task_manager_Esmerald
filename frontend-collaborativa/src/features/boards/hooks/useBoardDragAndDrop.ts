import { DropResult } from "@hello-pangea/dnd";
import { useBoardsStore } from "../store/board.store";
import { useMoveCardMutation } from "./useMoveCardMutation.ts";
import { confettiService } from "@/shared/services/confetti.service";
import { Board } from "../types/board.types";

/**
 * Hook de orquestación para el Drag and Drop.
 * Normalizamos el boardId como string para ser consistentes con los hooks de React Query.
 */
export const useBoardDragAndDrop = (boardId: string | undefined) => {
  const queryClient = useMoveCardMutation(boardId || "");
  const { mutate: moveCard } = queryClient;
  
  const boards = useBoardsStore((state) => state.boards);

  const handleDragEnd = (result: DropResult): void => {
    const { destination, source, draggableId } = result;

    if (!destination || !boardId) return;
    
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index 
    ) return;

    // Ejecutamos la mutación (conversión segura a número aquí)
    moveCard({
      cardId: Number(draggableId),
      columnId: Number(destination.droppableId),
      order: destination.index
    });

    checkCelebration(destination.droppableId);
  };

  const checkCelebration = (targetDroppableId: string): void => {
    // Buscamos el board comparando strings para evitar errores de tipo
    const currentBoard = boards.find((b) => String(b.id) === String(boardId)) as Board | undefined;

    if (currentBoard?.columns) {
      const targetColumnId = Number(targetDroppableId);
      const targetColumn = currentBoard.columns.find((col) => Number(col.id) === targetColumnId);

      if (targetColumn) {
        const title = targetColumn.title.toLowerCase();
        
        const isDoneTitle = [
          "hecho", "finalizado", "done", "completado", "terminado"
        ].some(keyword => title.includes(keyword));

        const lastColumn = currentBoard.columns[currentBoard.columns.length - 1];
        const isLastColumn = Number(lastColumn?.id) === targetColumnId;

        if (isDoneTitle || isLastColumn) {
          setTimeout(() => {
            confettiService.fireSuccess();
          }, 150);
        }
      }
    }
  };

  return { handleDragEnd };
};