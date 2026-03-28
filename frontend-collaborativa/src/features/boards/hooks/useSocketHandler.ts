import { useCallback } from 'react';
import { useBoardsStore } from '../store/board.store';
import { RawSocketData } from '../services/socket/board.socket.service';

export const useSocketHandler = () => {
  const store = useBoardsStore();

  const processMessage = useCallback((rawData: RawSocketData) => {
  const event = rawData as any; 
    if (!event || (!event.type && !event.action)) return;

    const type = (event.type || event.action || "").toUpperCase();
    const payload = event.payload || event;

    let targetBoardId: number | undefined;

    switch (type) {
      case "BOARD_SYNC":
      case "BOARD_UPDATED":
      case "BOARD.UPDATED":
        targetBoardId = Number(payload.id);
        store.updateBoard(payload);
        break;

      case "COLUMN_CREATED":
        targetBoardId = Number(payload.boardId || payload.board_id);
        store.addColumn(targetBoardId, payload.column);
        break;

      case "COLUMN_DELETED":
        targetBoardId = Number(payload.boardId || payload.board_id);
        store.removeColumn(targetBoardId, payload.columnId || payload.column_id);
        break;

      case "CARD_CREATED":
      case "CARD.CREATED":
        store.addCard(Number(payload.columnId || payload.column_id), payload.card);
        break;

      case "CARD_MOVED":
      case "CARD.MOVED":
        store.moveCard(
          payload.fromColumnId || payload.from_col,
          payload.cardId || payload.card_id,
          payload.toColumnId || payload.to_col,
          payload.newOrder || payload.order
        );
        break;

      case "CARD_DELETED":
        store.removeCard(payload.columnId || payload.column_id, payload.cardId || payload.card_id);
        break;

      case "CARD_UPDATED":
        store.updateCard(
          payload.columnId || payload.column_id, 
          payload.cardId || payload.card_id, 
          payload.card
        );
        break;
    }

    if (targetBoardId) {
      store.syncBoardMetrics(targetBoardId);
    }
  }, [store]);

  return { processMessage };
};