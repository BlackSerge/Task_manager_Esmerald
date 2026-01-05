// src/features/boards/services/board-members.service.ts
import { http } from "@/api/http.service";
import { API_ENDPOINTS } from "@/core/constants/endpoints";
import { InviteMemberDto, BoardMember } from "../types/board.types";

export const boardMembersService = {
  /**
   * Invita a un usuario usando user_id.
   */
  invite: async (boardId: number, data: InviteMemberDto): Promise<BoardMember> => {
    // Al ser TypeScript estricto, 'data' ya debe cumplir con tener 'user_id'
    const response = await http.post<BoardMember>(
      API_ENDPOINTS.BOARDS.INVITE(boardId), 
      data
    );
    return response.data;
  },

  remove: async (boardId: number, memberId: number): Promise<void> => {
    const baseUrl = API_ENDPOINTS.BOARDS.MEMBERS(boardId);
    const url = `${baseUrl}${memberId}/`;
    await http.delete(url);
  }
};