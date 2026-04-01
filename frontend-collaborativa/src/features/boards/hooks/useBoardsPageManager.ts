import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useBoards, useUpdateBoard, useDeleteBoard } from "./boardHooks";
import { useBoardsStore } from "../store/board.store";

export const useBoardsPageManager = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [boardToDelete, setBoardToDelete] = useState<{ id: string; title: string } | null>(null);
  const { isPending, isError, refetch } = useBoards();
  const { boards, hasHydrated, recentIds, trackVisit } = useBoardsStore();
  const deleteMutation = useDeleteBoard();
  const updateMutation = useUpdateBoard();

  /**
   * Lógica de ordenamiento y filtrado
   * Prioridad: 
   * 1. Coincidencia con búsqueda.
   * 2. Orden de navegación reciente (recentIds).
   * 3. Fecha de actualización/creación real.
   */
  const filteredBoards = useMemo(() => {
    const query = searchTerm.toLowerCase();
    const filtered = boards.filter((b) => b.title.toLowerCase().includes(query));

    return [...filtered].sort((a, b) => {
      const idA = String(a.id);
      const idB = String(b.id);

      const indexA = recentIds.indexOf(idA);
      const indexB = recentIds.indexOf(idB);

      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      const timeA = new Date(a.updated_at || a.created_at || 0).getTime();
      const timeB = new Date(b.updated_at || b.created_at || 0).getTime();
      return timeB - timeA;
    });
  }, [boards, searchTerm, recentIds]);

  const handleBoardClick = (id: number | string) => {
    trackVisit(String(id)); 
    navigate(`/boards/${id}`);
  };

  const handleEditTitle = (id: string, newTitle: string) => {
    const cleanTitle = newTitle?.trim();
    if (cleanTitle) {
      updateMutation.mutate({ id: Number(id), title: cleanTitle });
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
    filteredBoards,
    searchTerm,
    setSearchTerm,
    boardToDelete,
    setBoardToDelete,
    showSkeleton: (!hasHydrated || boards.length === 0) && isPending && !isError,
    showError: isError && boards.length === 0,
    isDeleting: deleteMutation.isPending,
    handleBoardClick,
    handleEditTitle,
    handleDeleteConfirm,
    refetch
  };
};