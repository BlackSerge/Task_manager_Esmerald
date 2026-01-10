import { useMutation, useQueryClient } from "@tanstack/react-query";
import { boardService } from "../services/board.service";
import { useBoardsStore } from "../store/board.store";
import { boardKeys } from "./keys/board.keys";

export const useColumnOperations = (boardId: string) => {
  const queryClient = useQueryClient();
  const store = useBoardsStore();

  /**
   * Sincronización de Cache
   */
  const sync = () => {
    queryClient.invalidateQueries({ queryKey: boardKeys.all });
    queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
  };

  // --- 1. EDITAR COLUMNA ---
  const updateColumnMutation = useMutation({
    mutationFn: (p: { columnId: number; title: string }) => 
      boardService.updateColumn(p.columnId, p.title),
    onSuccess: (updatedColumn) => {
      // Actualizamos el store localmente para feedback instantáneo
      store.updateColumn(Number(boardId), updatedColumn.id, { title: updatedColumn.title });
      sync();
    }
  });

  // --- 2. ELIMINAR COLUMNA ---
  const deleteColumnMutation = useMutation({
    mutationFn: (columnId: number) => boardService.deleteColumn(columnId),
    onSuccess: (_, columnId) => {
      // Eliminamos del store localmente
      store.removeColumn(Number(boardId), columnId);
      sync();
    }
  });

  return {
    updateColumn: updateColumnMutation.mutate,
    removeColumn: deleteColumnMutation.mutate,
    isColumnProcessing: updateColumnMutation.isPending || deleteColumnMutation.isPending
  };
};