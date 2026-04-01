import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { boardService } from "@/features/boards/services/board.service";
import { useBoardsStore } from "../store/board.store";
import { Board } from "../types";

export const useBoards = () => {
  const setBoards = useBoardsStore((state) => state.setBoards);

  return useQuery<Board[], Error>({
    queryKey: ["boards"],
    queryFn: async () => {
      const data = await boardService.getBoards();
      
      setBoards(data);
      return data;
    },
   
    staleTime: 1000 * 60 * 5, 
  });
};

export const useCreateBoard = () => {
  const queryClient = useQueryClient();
  const addBoard = useBoardsStore((state) => state.addBoard);

  return useMutation({
    mutationFn: (title: string) => boardService.createBoard(title),
    onSuccess: (newBoard) => {
  
      addBoard(newBoard);
      
   
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });
};

export const useUpdateBoard = () => {
  const queryClient = useQueryClient();
  const updateBoardStore = useBoardsStore((state) => state.updateBoard);

  return useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) => 
      boardService.updateBoard(id, title),
    onSuccess: (updatedBoard) => {
      updateBoardStore(updatedBoard);
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });
};

export const useDeleteBoard = () => {
  const queryClient = useQueryClient();
  const setBoards = useBoardsStore((state) => state.setBoards);
  const boards = useBoardsStore((state) => state.boards);

  return useMutation({
    mutationFn: (id: number) => boardService.deleteBoard(id),
    onSuccess: (_, deletedId) => {
      const updatedBoards = boards.filter(b => b.id !== deletedId);
      setBoards(updatedBoards);
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });
};