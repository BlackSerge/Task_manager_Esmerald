import { socketService } from "./board.socket.service";
import { useBoardsStore } from "../../store/board.store";
import { BoardSocketType, SocketEvent } from "../../types";
import { storageService } from "@/core/services/storage/storage.service";

export const boardSocketGateway = {
  connect: (boardId: number) => {
    const token = storageService.getToken();
    const baseUrl = import.meta.env.VITE_WS_URL;
    const url = `${baseUrl}/ws/board/${boardId}/?token=${token}`;

    socketService.connect(url);

    return socketService.subscribe((raw) => {
      const event = raw as unknown as SocketEvent;
      const store = useBoardsStore.getState();

      switch (event.type) {
        case BoardSocketType.CARD_MOVED:
          store.moveCard(
            event.payload.fromColumnId,
            event.payload.cardId,
            event.payload.toColumnId,
            event.payload.newOrder
          );
          break;

        case BoardSocketType.CARD_CREATED:
          store.addCard(event.payload.columnId, event.payload.card);
          break;

        case BoardSocketType.CARD_UPDATED:
          store.updateCard(
            event.payload.columnId|| 0, 
            event.payload.cardId,
            event.payload.card
          );
          break;

        case BoardSocketType.CARD_DELETED:
          store.removeCard(event.payload.columnId, event.payload.cardId);
          break;

        case BoardSocketType.COLUMN_CREATED:
          store.addColumn(event.payload.boardId, event.payload.column);
          break;

        case BoardSocketType.BOARD_UPDATED:
        case BoardSocketType.BOARD_SYNC:
          store.updateBoard(event.payload);
          break;
      }
    });
  },

  disconnect: () => {
    socketService.disconnect();
  }
};