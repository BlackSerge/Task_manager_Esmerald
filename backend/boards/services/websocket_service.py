import logging

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

logger = logging.getLogger(__name__)


def notify_board_change(*, board_id: int) -> None:
    """Broadcasts a general board state update to all connected clients."""
    try:
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f"board_{board_id}",
                {"type": "board.broadcast_state"}
            )
    except Exception:
        logger.exception("Error in Channel Layer (Broadcast) for board %s", board_id)


def notify_card_movement(
    *,
    board_id: int,
    card_id: int,
    from_col: int,
    to_col: int,
    order: float
) -> None:
    """Notifies a specific card movement for smooth drag-and-drop animations."""
    try:
        channel_layer = get_channel_layer()
        if not channel_layer:
            return

        async_to_sync(channel_layer.group_send)(
            f"board_{board_id}",
            {
                "type": "card_moved_event",
                "payload": {
                    "id": card_id,
                    "from_column": from_col,
                    "column": to_col,
                    "order": order
                }
            }
        )
    except Exception:
        logger.exception("Error in Channel Layer (Card Move) for board %s", board_id)