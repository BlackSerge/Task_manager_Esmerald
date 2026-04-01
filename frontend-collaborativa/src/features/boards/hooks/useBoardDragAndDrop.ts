import { DropResult } from "@hello-pangea/dnd";
import { useBoardsStore } from "../store/board.store";
import { useCardActions } from "./useCardActions";
import { confettiService } from "@/shared/services/confetti.service";
import { Board } from "../types";

export const useBoardDragAndDrop = (boardId: string | undefined) => {
  
  const { moveCard } = useCardActions(boardId);
  
  const boards = useBoardsStore((state) => state.boards);

  const handleDragEnd = (result: DropResult): void => {
    const { destination, source, draggableId } = result;

    if (!destination || !boardId) return;
    
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index 
    ) return;

    
    moveCard({
      cardId: Number(draggableId),
      fromColumnId: Number(source.droppableId),
      columnId: Number(destination.droppableId),
      order: destination.index
    });

    checkCelebration(destination.droppableId);
  };

  const checkCelebration = (targetDroppableId: string): void => {
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