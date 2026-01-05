import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { boardService } from "../services/board.service";
import { boardMembersService } from "../services/board-members.service";
import {  InviteMemberDto } from "../types/board.types"; // Importamos el DTO
import { AuthUser } from "@/features/auth/types/auth.types";

export const useBoardTeam = (boardId: string) => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState<string>("");

  // 1. Búsqueda de usuarios
  const { data: searchResults, isLoading: isSearching } = useQuery<AuthUser[]>({
    queryKey: ["users-search", searchQuery, boardId], 
    queryFn: () => boardService.searchUsers(searchQuery, boardId),
    enabled: searchQuery.trim().length > 1,
    staleTime: 1000 * 60,
  });

 
   // 2. Mutación para invitar
   
  const inviteMutation = useMutation({
    mutationFn: (payload: InviteMemberDto) => 
      boardMembersService.invite(Number(boardId), payload),
    onSuccess: () => {
      // Invalida el tablero específico para ver al nuevo miembro de inmediato
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      // Invalida la lista general si es necesario
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      setSearchQuery(""); // Limpiamos la búsqueda tras éxito
    },
  });

  // 3. Mutación para eliminar miembro
  const removeMutation = useMutation({
    mutationFn: (userId: number) => 
      boardMembersService.remove(Number(boardId), userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });

  return {
    searchQuery,
    setSearchQuery,
    searchResults: searchResults ?? [],
    isSearching,
    // Exponemos el método mutate con el tipado correcto
    invite: inviteMutation.mutate,
    isInviting: inviteMutation.isPending,
    removeMember: removeMutation.mutate,
    isRemoving: removeMutation.isPending,
    error: inviteMutation.error || removeMutation.error
  };
};