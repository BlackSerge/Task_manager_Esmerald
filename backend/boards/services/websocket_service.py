import logging
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

logger = logging.getLogger(__name__)

def notify_board_change(*, board_id: int) -> None:
    """Avisa al socket que el estado general del tablero ha cambiado."""
    try:
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f"board_{board_id}",
                {"type": "board.broadcast_state"}
            )
    except Exception as e:
        logger.error(f"Error en Channel Layer (Broadcast): {str(e)}")

def notify_card_movement(
    *, 
    board_id: int, 
    card_id: int, 
    from_col: int, 
    to_col: int, 
    order: float
) -> None:
    """Notifica el movimiento específico de una tarjeta para animaciones fluidas."""
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
    except Exception as e:
        logger.error(f"Error en Channel Layer (Card Move): {str(e)}")