import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socketService } from "../services/socket/board.socket.service";
import { boardKeys } from "./useBoards";

export const useBoardSocket = (boardId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!boardId) return;

    const url = `${import.meta.env.VITE_WS_URL}/ws/boards/${boardId}/`;
    socketService.connect(url);

    const unsubscribe = socketService.subscribe((data) => {
      if (data.type === "card_moved" || data.type === "board_update") {
        queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
      }
    });

    return () => {
      unsubscribe();
      socketService.disconnect();
    };
  }, [boardId, queryClient]);
};