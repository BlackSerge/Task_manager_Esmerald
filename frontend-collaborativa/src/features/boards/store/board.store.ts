import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Board, Column, Card, BoardMember } from "../types";

interface RawBoardResponse extends Partial<Board> {
  total_cards_count_annotated?: number;
  completed_cards_count_annotated?: number;
}

const calculateBoardMetrics = (columns: Column[]) => {
  if (!columns || columns.length === 0) return null;
  const allCards = columns.flatMap((col) => col.cards || []);
  const total = allCards.length;
  
  const sortedColumns = [...columns].sort((a, b) => Number(a.order) - Number(b.order));
  const lastColumnId = sortedColumns[sortedColumns.length - 1]?.id;
  
  const completed = allCards.filter((card) => {
    return lastColumnId !== undefined && String(card.column) === String(lastColumnId);
  }).length;

  return {
    total_cards: total,
    completed_cards: completed,
    progress_percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    columns_count: columns.length
  };
};

export interface BoardsStore {
  boards: Board[];
  recentIds: string[]; 
  isLoading: boolean;
  hasHydrated: boolean;
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
  trackVisit: (boardId: string) => void;
}

export const useBoardsStore = create<BoardsStore>()(
  persist(
    (set) => ({
      boards: [],
      recentIds: [],
      isLoading: true,
      hasHydrated: false,
      error: null,

   
      trackVisit: (boardId) => set((state) => ({
        recentIds: [boardId, ...state.recentIds.filter(id => id !== boardId)].slice(0, 12)
      })),

      setBoards: (newBoards) => set((state) => {
        const updatedBoards = (newBoards as RawBoardResponse[]).map((nb) => {
          const existingBoard = state.boards.find(b => Number(b.id) === Number(nb.id));
          const finalColumns = (nb.columns && nb.columns.length > 0) 
            ? (nb.columns as Column[]) 
            : (existingBoard?.columns || []);

          const localMetrics = calculateBoardMetrics(finalColumns);

          return {
            ...nb,
            id: nb.id!,
            title: nb.title!,
            columns: finalColumns,
            total_cards: Number(localMetrics?.total_cards ?? nb.total_cards ?? nb.total_cards_count_annotated ?? 0),
            completed_cards: Number(localMetrics?.completed_cards ?? nb.completed_cards ?? nb.completed_cards_count_annotated ?? 0),
            progress_percentage: Number(localMetrics?.progress_percentage ?? nb.progress_percentage ?? 0),
            columns_count: finalColumns.length
          } as Board;
        });
        return { boards: updatedBoards, hasHydrated: true, isLoading: false, error: null };
      }),

      updateBoard: (updatedBoard) => set((state) => {
        const metrics = calculateBoardMetrics(updatedBoard.columns || []);
        const boardWithMetrics: Board = { ...updatedBoard, ...(metrics || {}) };
        return { boards: state.boards.map(b => b.id === updatedBoard.id ? boardWithMetrics : b) };
      }),

      addBoard: (board) => set((state) => ({ boards: [board, ...state.boards] })),
      
      addColumn: (boardId, column) => set((state) => ({
        boards: state.boards.map(b => {
          if (b.id !== boardId) return b;
          const newCols = [...(b.columns || []), column];
          return { ...b, columns: newCols, ...calculateBoardMetrics(newCols) };
        })
      })),

      removeColumn: (boardId, columnId) => set((state) => ({
        boards: state.boards.map(b => {
          if (b.id !== boardId) return b;
          const newCols = b.columns.filter(c => c.id !== columnId);
          return { ...b, columns: newCols, ...calculateBoardMetrics(newCols) };
        })
      })),

      addCard: (columnId, card) => set((state) => ({
        boards: state.boards.map(b => {
          if (!b.columns?.some(c => c.id === columnId)) return b;
          const newCols = b.columns.map(col => col.id === columnId ? { ...col, cards: [...(col.cards || []), card] } : col);
          return { ...b, columns: newCols, ...calculateBoardMetrics(newCols) };
        })
      })),

      updateCard: (columnId, cardId, payload) => set((state) => ({
        boards: state.boards.map(b => {
          if (!b.columns?.some(c => c.id === columnId)) return b;
          const newCols = b.columns.map(col => col.id === columnId 
            ? { ...col, cards: col.cards.map(c => c.id === cardId ? { ...c, ...payload } : c) } 
            : col
          );
          return { ...b, columns: newCols, ...calculateBoardMetrics(newCols) };
        })
      })),

      moveCard: (fromColumnId, cardId, toColumnId) => set((state) => ({
        boards: state.boards.map(b => {
          const fromCol = b.columns?.find(c => c.id === fromColumnId);
          const toCol = b.columns?.find(c => c.id === toColumnId);
          if (!fromCol || !toCol) return b;

          const card = fromCol.cards?.find(c => c.id === cardId);
          if (!card) return b;

          const newCols = b.columns.map(col => {
            if (col.id === fromColumnId) {
              return { ...col, cards: col.cards.filter(c => c.id !== cardId) };
            }
            if (col.id === toColumnId) {
              return { ...col, cards: [...(col.cards || []), { ...card, column: toColumnId }] };
            }
            return col;
          });

          return { ...b, columns: newCols, ...calculateBoardMetrics(newCols) };
        })
      })),

      removeCard: (columnId, cardId) => set((state) => ({
        boards: state.boards.map(b => {
          if (!b.columns?.some(c => c.id === columnId)) return b;
          const newCols = b.columns.map(col => col.id === columnId ? { ...col, cards: col.cards.filter(c => c.id !== cardId) } : col);
          return { ...b, columns: newCols, ...calculateBoardMetrics(newCols) };
        })
      })),

      updateColumn: (boardId, columnId, payload) => set((state) => ({
        boards: state.boards.map(b => b.id === boardId 
          ? { ...b, columns: b.columns.map(c => c.id === columnId ? { ...c, ...payload } : c) } 
          : b
        )
      })),

      addMemberToBoard: (boardId, member) => set((state) => ({
        boards: state.boards.map(b => b.id === boardId ? { ...b, members: [...(b.members || []), member] } : b)
      })),

      syncBoardMetrics: (boardId) => set((state) => ({
        boards: state.boards.map(b => b.id === boardId ? { ...b, ...calculateBoardMetrics(b.columns) } : b)
      }))
    }),
    {
      name: "portfolio-management-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        boards: state.boards, 
        recentIds: state.recentIds 
      }),
    }
  )
);