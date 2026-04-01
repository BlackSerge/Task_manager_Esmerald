import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { boardService } from "../services/board.service";
import { boardMembersService } from "../services/board-members.service";
import { UserRole, InviteMemberDto } from "../types";
import { AuthUser } from "@/features/auth";
import { boardKeys } from "./useBoards";

interface InviteParams {
  user: AuthUser;
  role: UserRole;
}

export const useBoardTeam = (boardId: string | undefined) => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState<string>("");

  
  const { data: searchResults, isLoading: isSearching } = useQuery<AuthUser[]>({
    queryKey: ["users-search", searchQuery, boardId],
    queryFn: () => boardService.searchUsers(searchQuery, boardId || ""),
    enabled: !!boardId && searchQuery.trim().length > 1,
    staleTime: 1000 * 30,
  });

  
  const inviteMutation = useMutation({
    mutationFn: ({ user, role }: InviteParams) => {
      
      const payload: InviteMemberDto = {
        user_id: user.id, 
        role: role,
      };
      
      return boardMembersService.invite(Number(boardId), payload);
    },
    onSuccess: () => {
      
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
      }
      setSearchQuery(""); 
    },
  });

  
  const removeMutation = useMutation({
    mutationFn: (userId: number) =>
      boardMembersService.remove(Number(boardId), userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
      }
    },
  });

  return {
    searchQuery,
    setSearchQuery,
    searchResults: searchResults ?? [],
    isSearching,
    invite: inviteMutation.mutate,
    isInviting: inviteMutation.isPending,
    removeMember: removeMutation.mutate,
    isRemoving: removeMutation.isPending,
    error: inviteMutation.error || removeMutation.error,
  };
};