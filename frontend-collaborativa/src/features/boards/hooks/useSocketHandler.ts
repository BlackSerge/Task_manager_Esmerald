import { useCallback } from 'react';
import { useBoardsStore } from '../store/board.store';
import { BoardSocketType, SocketEvent } from '../types/events.types';
import { RawSocketData } from '../services/socket/board.socket.service';

export const useSocketHandler = () => {
  const store = useBoardsStore();

  const processMessage = useCallback((rawData: RawSocketData) => {
    // 1. Casting inicial de la respuesta cruda al contrato de eventos
    const event = rawData as unknown as SocketEvent;
    if (!event || !event.type) return;

    // Variable para rastrear qué tablero necesita recalcular métricas (siempre número)
    let targetBoardId: number | undefined;

    // 2. Discriminación de la Unión (Type Guarding automático)
    switch (event.type) {
      case BoardSocketType.BOARD_SYNC:
      case BoardSocketType.BOARD_UPDATED:
        targetBoardId = Number(event.payload.id);
        store.updateBoard(event.payload);
        break;

      case BoardSocketType.COLUMN_CREATED:
        targetBoardId = Number(event.payload.boardId);
        store.addColumn(targetBoardId, event.payload.column);
        store.syncBoardMetrics(targetBoardId);
        break;

      case BoardSocketType.COLUMN_DELETED:
        targetBoardId = Number(event.payload.boardId);
        store.removeColumn(targetBoardId, event.payload.columnId);
        break;

      case BoardSocketType.CARD_CREATED:
        store.addCard(event.payload.columnId, event.payload.card);
        break;

      case BoardSocketType.CARD_MOVED:
        store.moveCard(
          event.payload.fromColumnId,
          event.payload.cardId,
          event.payload.toColumnId,
          event.payload.newOrder
        );
        break;

      case BoardSocketType.CARD_DELETED:
        store.removeCard(event.payload.columnId, event.payload.cardId);
        break;

      case BoardSocketType.CARD_UPDATED:
        store.updateCard(
          event.payload.columnId, 
          event.payload.cardId, 
          event.payload.card
        );
        break;

      default: {
        // Técnica de "Exhaustive Check" para evitar 'any' en logs
        const _exhaustiveCheck: never = event;
        console.warn(`[SocketHandler]: Evento no manejado`, _exhaustiveCheck);
        return;
      }
    }

    // 3. Sincronización de métricas
    // Se ejecuta para eventos de columnas/tablero que traen boardId explícito.
    // Para tarjetas, el store ya lo hace internamente en sus métodos.
    if (targetBoardId) {
      store.syncBoardMetrics(targetBoardId);
    }
  }, [store]);

  return { processMessage };
};