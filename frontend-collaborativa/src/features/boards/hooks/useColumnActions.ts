import { useMutation, useQueryClient } from "@tanstack/react-query";
import { boardService } from "../services/board.service";
import { useBoardsStore } from "../store/board.store";
import { boardKeys } from "./keys/board.keys";

export const useColumnOperations = (boardId: string) => {
  const queryClient = useQueryClient();
  const store = useBoardsStore();
  const sync = () => {
    queryClient.invalidateQueries({ queryKey: boardKeys.all });
    queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
  };

  const updateColumnMutation = useMutation({
    mutationFn: (p: { columnId: number; title: string }) => 
      boardService.updateColumn(p.columnId, p.title),
    onSuccess: (updatedColumn) => {
      store.updateColumn(Number(boardId), updatedColumn.id, { title: updatedColumn.title });
      sync();
    }
  });

  const deleteColumnMutation = useMutation({
    mutationFn: (columnId: number) => boardService.deleteColumn(columnId),
    onSuccess: (_, columnId) => {
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