import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { boardService } from "../services/board.service";
import { boardMembersService } from "../services/board-members.service";
import { UserRole } from "../types/board.types";
import { AuthUser } from "@/features/auth/types/auth.types";

interface InviteParams {
  user: AuthUser; // Cambiado de userId a user objeto completo
  role: UserRole;
}

export const useBoardTeam = (boardId: string) => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState<string>("");

  /**
   * 1. Búsqueda de usuarios.
   * Utiliza la ruta profesional: /api/users/search/
   */
  const { data: searchResults, isLoading: isSearching } = useQuery<AuthUser[]>({
    queryKey: ["users-search", searchQuery, boardId],
    queryFn: () => boardService.searchUsers(searchQuery, boardId),
    enabled: searchQuery.trim().length > 1,
    staleTime: 1000 * 30, 
  });

  /**
   * 2. Mutación para invitar miembros.
   * Cumple con InviteMemberDto: { email: string; role: UserRole }
   */
  const inviteMutation = useMutation({
    mutationFn: ({ user, role }: InviteParams) =>
      boardMembersService.invite(Number(boardId), {
        email: user.email, // Se extrae el email del objeto AuthUser
        role: role,
      }),
    onSuccess: () => {
      // Sincronización de caché de React Query
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });

  /**
   * 3. Mutación para eliminar miembro.
   */
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
    // Acciones (Cambiamos el nombre interno para claridad en el componente)
    invite: inviteMutation.mutate,
    isInviting: inviteMutation.isPending,
    removeMember: removeMutation.mutate,
    isRemoving: removeMutation.isPending,
    // Estados de error consolidados
    error: inviteMutation.error || removeMutation.error,
  };
};