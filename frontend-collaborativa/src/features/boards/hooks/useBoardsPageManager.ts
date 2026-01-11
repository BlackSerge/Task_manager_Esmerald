// features/boards/hooks/useBoardsPageManager.ts
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useBoards, useUpdateBoard, useDeleteBoard } from "./boardHooks";
import { useBoardsStore } from "../store/board.store";

export const useBoardsPageManager = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [boardToDelete, setBoardToDelete] = useState<{ id: string; title: string } | null>(null);

  // 1. Data Fetching
  const { isPending, isError, refetch } = useBoards();
  
  // 2. Store Data
  const boards = useBoardsStore((state) => state.boards);
  const hasHydrated = useBoardsStore((state) => state.hasHydrated);

  // 3. Mutaciones
  const deleteMutation = useDeleteBoard();
  const updateMutation = useUpdateBoard();

  // 4. Lógica de filtrado
  const filteredBoards = useMemo(() => {
    return boards.filter((board) =>
      board.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [boards, searchTerm]);

  // 5. Handlers
  const handleBoardClick = (id: number | string) => navigate(`/boards/${id}`);

  const handleEditTitle = (id: string, newTitle: string) => {
    if (newTitle?.trim()) {
      updateMutation.mutate({ id: Number(id), title: newTitle.trim() });
    }
  };

  const handleDeleteConfirm = () => {
    if (boardToDelete) {
      deleteMutation.mutate(Number(boardToDelete.id), {
        onSuccess: () => setBoardToDelete(null)
      });
    }
  };

  return {
    boards,
    filteredBoards,
    searchTerm,
    setSearchTerm,
    boardToDelete,
    setBoardToDelete,
    // Estados de UI
    showSkeleton: (!hasHydrated || boards.length === 0) && isPending && !isError,
    showError: isError && boards.length === 0,
    isDeleting: deleteMutation.isPending,
    // Acciones
    handleBoardClick,
    handleEditTitle,
    handleDeleteConfirm,
    refetch
  };
};