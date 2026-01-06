import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { BoardsStore, Board, Column, Card, BoardMember } from "../types/board.types";


const calculateBoardMetrics = (columns: Column[]) => {
  const allCards = columns.flatMap((col) => col.cards || []);
  const total = allCards.length;
  const completed = allCards.filter((card) => card.is_completed).length;
  return {
    total_cards: total,
    completed_cards: completed,
    progress_percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
};

export const useBoardsStore = create<BoardsStore>()(
  persist(
    (set) => ({
      boards: [],
      isLoading: true,
      error: null,

      setBoards: (boards) => set({ boards, isLoading: false, error: null }),

      addBoard: (board) => set((state) => ({ 
        boards: [board, ...state.boards] 
      })),

      updateBoard: (updatedBoard: Board) =>
        set((state) => {
          const boardIndex = state.boards.findIndex((b) => b.id === updatedBoard.id);
          if (boardIndex === -1) return { boards: [...state.boards, updatedBoard] };

          const updatedBoards = [...state.boards];
          updatedBoards[boardIndex] = {
            ...updatedBoards[boardIndex],
            ...updatedBoard,
            columns: updatedBoard.columns || updatedBoards[boardIndex].columns || [],
            members: updatedBoard.members || updatedBoards[boardIndex].members || [],
            updated_at: new Date().toISOString(),
            last_activity: new Date().toISOString(),
          };

          return { boards: updatedBoards };
        }),

      updateCard: (columnId: number, cardId: number, payload: Partial<Card>) =>
        set((state) => ({
          boards: state.boards.map((board) => {
            const hasColumn = board.columns?.some((c) => Number(c.id) === Number(columnId));
            if (!hasColumn) return board;

            const newColumns = board.columns.map((col) => {
              if (Number(col.id) !== Number(columnId)) return col;
              return {
                ...col,
                cards: col.cards.map((card) => 
                  card.id === cardId ? { ...card, ...payload } : card
                ),
              };
            });

            return {
              ...board,
              ...calculateBoardMetrics(newColumns),
              columns: newColumns,
              last_activity: new Date().toISOString(),
            };
          }),
        })),

      addCard: (columnId: number, card: Card) =>
        set((state) => ({
          boards: state.boards.map((board) => {
            const belongsToThisBoard = board.columns?.some(col => Number(col.id) === Number(columnId));
            if (!belongsToThisBoard) return board;

            const newColumns = (board.columns || []).map((col) => {
              if (Number(col.id) === Number(columnId)) {
                const cardExists = col.cards?.some((c) => c.id === card.id);
                return cardExists ? col : { ...col, cards: [...(col.cards || []), card] };
              }
              return col;
            });

            return {
              ...board,
              ...calculateBoardMetrics(newColumns),
              last_activity: new Date().toISOString(),
              columns: newColumns,
            };
          }),
        })),

      removeCard: (columnId: number, cardId: number) =>
        set((state) => ({
          boards: state.boards.map((board) => {
            const hasColumn = board.columns?.some(c => Number(c.id) === Number(columnId));
            if (!hasColumn) return board;

            const newColumns = (board.columns || []).map((c) =>
              Number(c.id) === Number(columnId)
                ? { ...c, cards: (c.cards || []).filter((card) => card.id !== cardId) }
                : c
            );

            return {
              ...board,
              ...calculateBoardMetrics(newColumns),
              last_activity: new Date().toISOString(),
              columns: newColumns,
            };
          }),
        })),

      addColumn: (boardId: number, column: Column) =>
        set((state) => ({
          boards: state.boards.map((b) =>
            b.id === boardId
              ? { 
                  ...b, 
                  columns_count: (b.columns_count || 0) + 1,
                  columns: [...(b.columns || []), { ...column, cards: column.cards || [] }],
                  last_activity: new Date().toISOString(),
                }
              : b
          ),
        })),

      removeColumn: (boardId: number, columnId: number) =>
        set((state) => ({
          boards: state.boards.map((b) =>
            b.id === boardId
              ? { 
                  ...b, 
                  columns_count: Math.max(0, (b.columns_count || 1) - 1),
                  columns: (b.columns || []).filter((c) => c.id !== columnId),
                  last_activity: new Date().toISOString(),
                }
              : b
          ),
        })),

      addMemberToBoard: (boardId: number, member: BoardMember) =>
        set((state) => ({
          boards: state.boards.map((b) =>
            b.id === boardId
              ? {
                  ...b,
                  members: b.members?.some((m) => m.user.id === member.user.id)
                    ? b.members
                    : [...(b.members || []), member],
                  last_activity: new Date().toISOString(),
                }
              : b
          ),
        })),

      moveCard: (fromColumnId: number, cardId: number, toColumnId: number, newOrder: number) =>
        set((state) => ({
          boards: state.boards.map((board) => {
            const hasFrom = board.columns?.some(c => Number(c.id) === Number(fromColumnId));
            if (!hasFrom) return board;

            let movedCard: Card | null = null;
            const nextColumns = board.columns.map(col => {
              if (Number(col.id) === Number(fromColumnId)) {
                movedCard = col.cards.find(c => Number(c.id) === Number(cardId)) || null;
                return { ...col, cards: col.cards.filter(c => Number(c.id) !== Number(cardId)) };
              }
              return col;
            });

            if (!movedCard) return board;

            const finalColumns = nextColumns.map(col => {
              if (Number(col.id) === Number(toColumnId)) {
                const newCards = [...col.cards];
                const insertIndex = Math.max(0, Math.floor(newOrder) - 1);
                newCards.splice(insertIndex, 0, { 
                  ...movedCard!, 
                  column: Number(toColumnId), 
                  order: newOrder 
                });
                return { ...col, cards: newCards };
              }
              return col;
            });

            return {
              ...board,
              ...calculateBoardMetrics(finalColumns),
              last_activity: new Date().toISOString(),
              columns: finalColumns
            };
          })
        })),
    }),
    {
      name: "portfolio-management-storage", 
      storage: createJSONStorage(() => localStorage), 
      partialize: (state) => ({ boards: state.boards }),
    }
  )
);