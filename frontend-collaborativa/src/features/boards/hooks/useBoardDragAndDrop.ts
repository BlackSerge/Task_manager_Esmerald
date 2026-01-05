import { DropResult } from "@hello-pangea/dnd";
import { useBoardsStore } from "../store/board.store";
import { useMoveCardMutation } from "./useBoardMutations"; // ✅ Usamos el nuevo hook
import { confettiService } from "@/shared/services/confetti.service";
import { Board } from "../types/board.types";

/**
 * Hook de orquestación para el Drag and Drop.
 * Responsabilidades: Validar el drop, disparar la persistencia y gestionar celebraciones.
 */
export const useBoardDragAndDrop = (boardId: number) => {
  // ✅ Usamos la mutación especializada que invalida la caché de React Query
  const { mutate: moveCard } = useMoveCardMutation(String(boardId));
  
  // Obtenemos el board del store para la lógica de celebración
  const boards = useBoardsStore((state) => state.boards);

  const handleDragEnd = (result: DropResult): void => {
    const { destination, source, draggableId } = result;

    // 1. Validaciones básicas
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index 
    ) return;

    // 2. Ejecutar actualización en Backend
    // El backend espera el ID de la columna destino y el nuevo orden
    moveCard({
      cardId: Number(draggableId),
      columnId: Number(destination.droppableId),
      order: destination.index // El backend se encarga de reordenar el resto
    });

    // 3. Lógica de Celebración (Confeti)
    checkCelebration(destination.droppableId);
  };

  /**
   * Lógica interna para determinar si se debe disparar el confeti
   */
  const checkCelebration = (targetDroppableId: string): void => {
    const currentBoard = boards.find((b) => Number(b.id) === boardId) as Board | undefined;

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