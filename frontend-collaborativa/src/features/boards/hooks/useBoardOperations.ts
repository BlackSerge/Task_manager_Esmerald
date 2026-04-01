import { useMutation, useQueryClient } from "@tanstack/react-query";
import { boardService } from "../services/board.service";
import { boardMembersService } from "../services/board-members.service";
import { useBoardsStore } from "../store/board.store";
import { boardKeys } from "./keys/board.keys";
import { PriorityLevel, Card, InviteMemberDto } from "../types";

export const useBoardOperations = (boardId?: string) => {
  const queryClient = useQueryClient();
  const store = useBoardsStore();

  const sync = () => {
    queryClient.invalidateQueries({ queryKey: boardKeys.all });
    if (boardId) {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    }
  };

  // --- 1. OPERACIONES DE COLUMNAS ---

  const updateColumnMutation = useMutation({
    mutationFn: (p: { columnId: number; title: string }) => 
      boardService.updateColumn(p.columnId, p.title),
    onSuccess: () => sync()
  });

  const deleteColumnMutation = useMutation({
    mutationFn: (columnId: number) => boardService.deleteColumn(columnId),
    onSuccess: (_, columnId) => {
      if (boardId) store.removeColumn(Number(boardId), columnId);
      sync();
    }
  });

  // --- 2. OPERACIONES DE TARJETAS ---

  const addCardMutation = useMutation({
    mutationFn: (p: { columnId: number; title: string; priority: PriorityLevel }) =>
      boardService.createCard(p.columnId, p.title, "", p.priority),
    onSuccess: (newCard) => {
      store.addCard(newCard.column, newCard);
      sync();
    }
  });

 const updateCardMutation = useMutation({
  mutationFn: (p: { cardId: number; columnId: number; payload: Partial<Card> }) =>
    boardService.updateCard(p.cardId, p.payload),
  onSuccess: (updatedCard, variables) => {
    const colId = updatedCard?.column || variables.columnId;
    store.updateCard(colId, updatedCard.id, updatedCard);
    sync();
  },
  onMutate: async (variables) => {
    store.updateCard(variables.columnId, variables.cardId, variables.payload);
  }
});

  const deleteCardMutation = useMutation({
    mutationFn: (p: { columnId: number; cardId: number }) => 
      boardService.deleteCard(p.cardId),
    onSuccess: (_, variables) => {
      store.removeCard(variables.columnId, variables.cardId);
      sync();
    }
  });

  const moveCardMutation = useMutation({
  mutationFn: (p: { cardId: number; fromColumnId: number; toColumnId: number; order: number }) =>
    boardService.moveCard(p.cardId, p.toColumnId, p.order),
  onSuccess: (_, v) => {
    store.moveCard(v.fromColumnId, v.cardId, v.toColumnId, v.order);
  }
});

  // --- 3. OPERACIONES DE MIEMBROS ---

  const inviteMemberMutation = useMutation({
    mutationFn: (payload: InviteMemberDto) => 
      boardMembersService.invite(Number(boardId), payload),
    onSuccess: (newMember) => {
      if (boardId) store.addMemberToBoard(Number(boardId), newMember);
      sync();
    }
  });

  // --- EXPOSICIÓN DE MÉTODOS Y ESTADOS ---

  return {
    // Columnas
    updateColumn: updateColumnMutation.mutate,
    removeColumn: deleteColumnMutation.mutate,
    // Tarjetas
    addCard: addCardMutation.mutate,
    updateCard: updateCardMutation.mutate,
    deleteCard: deleteCardMutation.mutate,
    moveCard: moveCardMutation.mutate,
    // Miembros
    invite: inviteMemberMutation.mutate,
    // Estados de carga (Smart Loading)
    isProcessing: 
      updateColumnMutation.isPending || 
      deleteColumnMutation.isPending || 
      addCardMutation.isPending || 
      updateCardMutation.isPending ||
      moveCardMutation.isPending
  };
};