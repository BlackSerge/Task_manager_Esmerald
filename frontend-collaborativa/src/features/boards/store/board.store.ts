import { create } from "zustand";
import { BoardsStore, Board, Column, Card, BoardMember } from "../types/board.types";

export const useBoardsStore = create<BoardsStore>((set) => ({
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
      
      if (boardIndex === -1) {
        return { boards: [...state.boards, updatedBoard], isLoading: false };
      }

      const updatedBoards = [...state.boards];
      // Merge profundo para no perder datos que el backend no envíe en actualizaciones parciales
      updatedBoards[boardIndex] = {
        ...updatedBoards[boardIndex],
        ...updatedBoard,
        columns: updatedBoard.columns || updatedBoards[boardIndex].columns || [],
        members: updatedBoard.members || updatedBoards[boardIndex].members || [],
      };

      return { boards: updatedBoards, isLoading: false };
    }),

  addMemberToBoard: (boardId: number, member: BoardMember) =>
    set((state) => ({
      boards: state.boards.map((b) =>
        b.id === boardId
          ? {
              ...b,
              // ✅ Corrección: Comparamos member.user.id según la nueva interfaz
              members: b.members?.some((m) => m.user.id === member.user.id)
                ? b.members
                : [...(b.members || []), member],
            }
          : b
      ),
    })),

  addColumn: (boardId: number, column: Column) =>
    set((state) => ({
      boards: state.boards.map((b) =>
        b.id === boardId
          ? { ...b, columns: [...(b.columns || []), { ...column, cards: column.cards || [] }] }
          : b
      ),
    })),

  removeColumn: (boardId: number, columnId: number) =>
    set((state) => ({
      boards: state.boards.map((b) =>
        b.id === boardId
          ? { ...b, columns: (b.columns || []).filter((c) => c.id !== columnId) }
          : b
      ),
    })),

  addCard: (columnId: number, card: Card) =>
    set((state) => ({
      boards: state.boards.map((board) => ({
        ...board,
        columns: (board.columns || []).map((col) => {
          if (Number(col.id) === Number(columnId)) {
            const cardExists = col.cards?.some((c) => c.id === card.id);
            if (cardExists) return col;

            return {
              ...col,
              cards: [...(col.cards || []), card],
            };
          }
          return col;
        }),
      })),
    })),

  removeCard: (columnId: number, cardId: number) =>
    set((state) => ({
      boards: state.boards.map((board) => ({
        ...board,
        columns: (board.columns || []).map((col) =>
          col.id === columnId
            ? { ...col, cards: (col.cards || []).filter((c) => c.id !== cardId) }
            : col
        ),
      })),
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

        return {
          ...board,
          columns: nextColumns.map(col => {
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
          })
        };
      })
    })),
}));