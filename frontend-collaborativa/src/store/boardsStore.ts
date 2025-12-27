// src/store/boardsStore.ts
import { create } from "zustand";
import { BoardsStore, Board, Column, Card } from "@/features/boards/types";

export const useBoardsStore = create<BoardsStore>((set) => ({
  boards: [],
  isLoading: true,
  error: null,

  // Sincronización masiva desde API (apaga el loading)
  setBoards: (boards: Board[]) => set({ boards, isLoading: false, error: null }),

  // VITAL: Actualiza o inserta un tablero y apaga el spinner (usado por el Socket)
  updateBoard: (updatedBoard: Board) =>
    set((state) => {
      const boardId = Number(updatedBoard.id);
      const exists = state.boards.some((b) => Number(b.id) === boardId);
      
      return {
        boards: exists
          ? state.boards.map((b) => (Number(b.id) === boardId ? updatedBoard : b))
          : [...state.boards, updatedBoard],
        isLoading: false, // Detenemos el spinner de búsqueda
        error: null,
      };
    }),

  addBoard: (board: Board) =>
    set((state) => ({
      boards: [...state.boards, board],
    })),

  // Operaciones de Columna con tipado estricto
  addColumn: (boardId: number | string, column: Column) =>
    set((state) => ({
      boards: state.boards.map((b) =>
        Number(b.id) === Number(boardId)
          ? { ...b, columns: [...(b.columns || []), column] }
          : b
      ),
    })),

  removeColumn: (boardId: number | string, columnId: number | string) =>
    set((state) => ({
      boards: state.boards.map((b) =>
        Number(b.id) === Number(boardId)
          ? {
              ...b,
              columns: (b.columns || []).filter((c) => Number(c.id) !== Number(columnId)),
            }
          : b
      ),
    })),

  // Operaciones de Tarjeta con tipado estricto
  addCard: (columnId: number | string, card: Card) =>
    set((state) => ({
      boards: state.boards.map((board) => ({
        ...board,
        columns: (board.columns || []).map((col) =>
          Number(col.id) === Number(columnId)
            ? { ...col, cards: [...(col.cards || []), card] }
            : col
        ),
      })),
    })),

  removeCard: (columnId: number | string, cardId: number | string) =>
    set((state) => ({
      boards: state.boards.map((board) => ({
        ...board,
        columns: (board.columns || []).map((col) =>
          Number(col.id) === Number(columnId)
            ? {
                ...col,
                cards: (col.cards || []).filter((c) => Number(c.id) !== Number(cardId)),
              }
            : col
        ),
      })),
    })),
}));