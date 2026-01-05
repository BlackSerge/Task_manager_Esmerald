// src/features/boards/hooks/useFilteredBoards.ts
import { useState, useMemo } from 'react';
import { Board } from '../types/board.types';

export const useFilteredBoards = (boards: Board[] = []) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBoards = useMemo(() => {
    return boards.filter((board) =>
      board.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [boards, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredBoards
  };
};