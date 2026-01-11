import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Board, Column, Card, BoardMember } from "../types/board.types";

// --- Helpers de Cálculo ---
const calculateBoardMetrics = (columns: Column[]) => {
  if (!columns || columns.length === 0) {
    return { 
      total_cards: 0, 
      completed_cards: 0, 
      progress_percentage: 0, 
      columns_count: 0 
    };
  }

  const allCards = columns.flatMap((col) => col.cards || []);
  const total = allCards.length;
  const sortedColumns = [...columns].sort((a, b) => Number(a.order) - Number(b.order));
  const lastColumnId = sortedColumns[sortedColumns.length - 1]?.id;
  
  const completed = allCards.filter((card) => {
    const isInLastColumn = lastColumnId !== undefined && String(card.column) === String(lastColumnId);
    return card.is_completed || isInLastColumn;
  }).length;

  return {
    total_cards: total,
    completed_cards: completed,
    progress_percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    columns_count: columns.length
  };
};

// --- Store ---
export interface BoardsStore {
  boards: Board[];
  isLoading: boolean;
  hasHydrated: boolean; // Control de carga inicial
  error: string | null;
  setBoards: (boards: Board[]) => void;
  updateBoard: (updatedBoard: Board) => void;
  addBoard: (board: Board) => void;
  addColumn: (boardId: number, column: Column) => void;
  updateColumn: (boardId: number, columnId: number, payload: Partial<Column>) => void;
  removeColumn: (boardId: number, columnId: number) => void;
  addCard: (columnId: number, card: Card) => void;
  updateCard: (columnId: number, cardId: number, payload: Partial<Card>) => void;
  removeCard: (columnId: number, cardId: number) => void;
  moveCard: (fromColumnId: number, cardId: number, toColumnId: number, newIndex: number) => void;
  addMemberToBoard: (boardId: number, member: BoardMember) => void;
  syncBoardMetrics: (boardId: number) => void; 
}

export const useBoardsStore = create<BoardsStore>()(
  persist(
    (set) => ({
      boards: [],
      isLoading: true,
      hasHydrated: false, // Inicia en false para forzar Skeleton en carga limpia
      error: null,

      setBoards: (newBoards) => set((state) => {
        const updatedBoards = newBoards.map(nb => {
          const existingBoard = state.boards.find(b => Number(b.id) === Number(nb.id));
          const hasNewColumns = nb.columns && nb.columns.length > 0;
          const finalColumns = hasNewColumns ? nb.columns : (existingBoard?.columns || []);

          return {
            ...nb,
            columns: finalColumns,
            ...calculateBoardMetrics(finalColumns)
          };
        });

        return { 
          boards: updatedBoards, 
          hasHydrated: true, 
          isLoading: false, 
          error: null 
        };
      }),

      addBoard: (board) => set((state) => ({ 
        boards: [{ ...board, ...calculateBoardMetrics(board.columns || []) }, ...state.boards],
        hasHydrated: true 
      })),

      updateBoard: (updatedBoard) => set((state) => {
        const boardWithMetrics = {
          ...updatedBoard,
          ...calculateBoardMetrics(updatedBoard.columns || [])
        };
        
        const filtered = state.boards.filter(b => Number(b.id) !== Number(updatedBoard.id));
        return { 
          boards: [boardWithMetrics, ...filtered],
          hasHydrated: true 
        };
      }),

      addColumn: (boardId, column) => set((state) => ({
        boards: state.boards.map(b => {
          if (b.id !== boardId) return b;
          const newColumns = [...(b.columns || []), { ...column, cards: column.cards || [] }];
          return { ...b, columns: newColumns, ...calculateBoardMetrics(newColumns) };
        })
      })),

      removeColumn: (boardId, columnId) => set((state) => ({
        boards: state.boards.map(b => {
          if (b.id !== boardId) return b;
          const newColumns = b.columns.filter(c => c.id !== columnId);
          return { ...b, columns: newColumns, ...calculateBoardMetrics(newColumns) };
        })
      })),

      addCard: (columnId, card) => set((state) => ({
        boards: state.boards.map((board) => {
          if (!board.columns?.some(col => col.id === columnId)) return board;
          const newColumns = board.columns.map((col) => {
            if (col.id !== columnId) return col;
            const exists = col.cards?.some(c => c.id === card.id);
            return exists ? col : { ...col, cards: [...(col.cards || []), card] };
          });
          return { ...board, columns: newColumns, ...calculateBoardMetrics(newColumns) };
        })
      })),

      moveCard: (fromColumnId, cardId, toColumnId, newIndex) => set((state) => ({
        boards: state.boards.map((board) => {
          const hasCols = board.columns?.some(c => c.id === fromColumnId || c.id === toColumnId);
          if (!hasCols) return board;

          let movedCard: Card | undefined;
          const intermediateCols = board.columns.map(col => {
            if (col.id === fromColumnId) {
              movedCard = col.cards?.find(c => c.id === cardId);
              return { ...col, cards: (col.cards || []).filter(c => c.id !== cardId) };
            }
            return col;
          });

          if (!movedCard) return board;

          const finalColumns = intermediateCols.map(col => {
            if (col.id === toColumnId) {
              const newCards = [...(col.cards || [])];
              newCards.splice(newIndex, 0, { ...movedCard!, column: toColumnId });
              return { ...col, cards: newCards };
            }
            return col;
          });

          return { ...board, columns: finalColumns, ...calculateBoardMetrics(finalColumns) };
        })
      })),

      updateCard: (columnId, cardId, payload) => set((state) => ({
        boards: state.boards.map(board => {
          if (!board.columns.some(c => c.id === columnId)) return board;
          const newCols = board.columns.map(col => col.id === columnId 
            ? { ...col, cards: col.cards.map(c => c.id === cardId ? { ...c, ...payload } : c) }
            : col
          );
          return { ...board, columns: newCols, ...calculateBoardMetrics(newCols) };
        })
      })),

      removeCard: (columnId, cardId) => set((state) => ({
        boards: state.boards.map(board => {
          if (!board.columns.some(c => c.id === columnId)) return board;
          const newCols = board.columns.map(col => col.id === columnId 
            ? { ...col, cards: col.cards.filter(c => c.id !== cardId) }
            : col
          );
          return { ...board, columns: newCols, ...calculateBoardMetrics(newCols) };
        })
      })),

      updateColumn: (boardId, columnId, payload) => set((state) => ({
        boards: state.boards.map(board => {
          if (board.id !== boardId) return board;
          const newCols = board.columns.map(col => col.id === columnId ? { ...col, ...payload } : col);
          return { ...board, columns: newCols, ...calculateBoardMetrics(newCols) };
        })
      })),

      addMemberToBoard: (boardId, member) => set((state) => ({
        boards: state.boards.map(b => b.id === boardId ? { ...b, members: [...(b.members || []), member] } : b)
      })),

      syncBoardMetrics: (boardId) => set((state) => ({
        boards: state.boards.map(board => board.id === boardId 
          ? { ...board, ...calculateBoardMetrics(board.columns || []) } 
          : board
        )
      })),
    }),
    {
      name: "portfolio-management-storage",
      storage: createJSONStorage(() => localStorage),
      // IMPORTANTE: No persistimos hasHydrated ni isLoading para que se reinicien al recargar
      partialize: (state) => ({ boards: state.boards }),
    }
  )
);