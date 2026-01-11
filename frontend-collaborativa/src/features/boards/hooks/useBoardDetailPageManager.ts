// features/boards/hooks/useBoardDetailPageManager.ts
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useBoardsStore } from "../store/board.store";
import { useBoardDetail } from "./useBoards";
import { useSocketSync } from "./useSocketSync";
import { useBoardDragAndDrop } from "./useBoardDragAndDrop";
import { useNavBarStore } from "@/shared/components/stores/navbar.store";

export const useBoardDetailPageManager = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const { isChatOpen, closeChat } = useNavBarStore();

  // 1. Data Fetching
  const { 
    isLoading: isQueryLoading, 
    isFetching, 
    isError, 
    data: boardData,
    refetch 
  } = useBoardDetail(boardId);
  
  // 2. Socket Sync
  useSocketSync(boardId);

  // 3. Fuente de Verdad (Zustand)
  const board = useBoardsStore((state) =>
    state.boards.find((b) => String(b.id) === String(boardId))
  );
  const hasHydrated = useBoardsStore((state) => state.hasHydrated);
  const updateBoardStore = useBoardsStore((state) => state.updateBoard);

  // 4. Sincronización de Store
  useEffect(() => {
    if (boardData) {
      updateBoardStore(boardData);
    }
  }, [boardData, updateBoardStore]);

  // 5. Drag & Drop
  const { handleDragEnd } = useBoardDragAndDrop(boardId);

  // 6. Lógica de estados de vista
  const showSkeleton = (!board || !hasHydrated) && isQueryLoading && !isError;
  const showNotFound = !board && !isQueryLoading && !isError;
  const showSyncing = isFetching && !isQueryLoading;
  const syncFailed = isError && !isQueryLoading;
  

return {
    board,
    boardId,
    isChatOpen,
    closeChat,
    isError,
    showSkeleton,
    showNotFound,
    showSyncing,
    syncFailed,
    handleDragEnd,
    refetch
  };
};