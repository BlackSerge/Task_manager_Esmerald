import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { boardService } from "@/services/board.service";
import { useBoardsStore } from "@/store/boardsStore";
import { Board, Column, Card } from "../types";

export const boardKeys = {
  all: ["boards"] as const,
  detail: (id: string) => ["boards", id] as const,
};

export const useBoards = () => {
  return useQuery<Board[], Error>({
    queryKey: boardKeys.all,
    queryFn: boardService.getBoards,
  });
};

export const useCreateBoard = () => {
  const queryClient = useQueryClient();
  const addBoard = useBoardsStore((state) => state.addBoard);

  return useMutation<Board, Error, string>({
    mutationFn: boardService.createBoard,
    onSuccess: (newBoard) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
      addBoard(newBoard); // Sincronización manual con el Store
    },
  });
};

export const useCreateColumn = () => {
  const queryClient = useQueryClient();
  const addColumn = useBoardsStore((state) => state.addColumn);

  return useMutation<Column, Error, { boardId: string; title: string }>({
    mutationFn: ({ boardId, title }) => boardService.createColumn(boardId, title),
    onSuccess: (newColumn, variables) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
      addColumn(variables.boardId, newColumn);
    },
  });
};

export const useCreateCard = () => {
  const queryClient = useQueryClient();
  const addCard = useBoardsStore((state) => state.addCard);

  return useMutation<Card, Error, { listId: string; title: string; description?: string }>({
    mutationFn: ({ listId, title, description }) => 
      boardService.createCard(listId, title, description),
    onSuccess: (newCard, variables) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
      addCard(variables.listId, newCard);
    },
  });
};

export const useDeleteList = () => {
  const queryClient = useQueryClient();
  const removeColumn = useBoardsStore((state) => state.removeColumn);

  return useMutation<void, Error, { boardId: string; listId: string }>({
    mutationFn: ({ boardId, listId }) => boardService.deleteColumn(boardId, listId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
      removeColumn(variables.boardId, variables.listId);
    },
  });
};