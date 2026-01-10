import logging
from typing import Dict, Any, Optional, cast
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AbstractBaseUser

from .services import content_service
from . import selectors
from .serializers.board_serializers import BoardDetailSerializer

logger = logging.getLogger(__name__)

class BoardConsumer(AsyncJsonWebsocketConsumer):
    # Tipado de atributos de clase
    board_id: int
    group_name: str
    user: AbstractBaseUser

    async def connect(self) -> None:
        """Establece conexión y valida al usuario."""
        self.user = self.scope["user"]
        
        if self.user.is_anonymous:
            await self.close()
            return

        # Obtenemos el ID de la ruta
        route_kwargs: Dict[str, str] = self.scope["url_route"]["kwargs"]
        self.board_id = int(route_kwargs["board_id"])
        self.group_name = f"board_{self.board_id}"

        # Unirse al grupo de Redis
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        
        # Snapshot inicial
        await self.send_board_state()

    async def disconnect(self, close_code: int) -> None: # Corregido el argumento self: int
        """Limpieza de canales al desconectar."""
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content: Dict[str, Any]) -> None:
        """
        Maneja acciones directas desde el socket (Zustand -> WebSocket).
        """
        msg_type: Optional[str] = content.get("type")
        payload: Dict[str, Any] = content.get("payload") or {}

        try:
            if msg_type == "card.move":
                await database_sync_to_async(content_service.move_card)(
                    card_id=int(payload["card_id"]),
                    new_column_id=int(payload["new_column_id"]),
                    new_order=float(payload["new_order"]),
                    user=self.user
                )
            
            elif msg_type == "card.create":
                await database_sync_to_async(content_service.create_card)(
                    column_id=int(payload["column_id"]),
                    title=str(payload["title"]),
                    user=self.user
                )

        except Exception as e:
            logger.error(f"WebSocket Error [{msg_type}]: {str(e)}")
            await self.send_json({"type": "ERROR", "message": str(e)})

    # --- Handlers de Eventos (Broadcast recibidos de Redis) ---

    async def card_moved_event(self, event: Dict[str, Any]) -> None:
        """Reenvía el movimiento de tarjeta a todos los clientes conectados."""
        await self.send_json({
            "type": "CARD_MOVED",
            "payload": event["payload"]
        })

    async def board_broadcast_state(self, event: Dict[str, Any]) -> None:
        """
        Handler para el evento 'board.broadcast_state'.
        Se dispara cuando notify_board_change() es llamado en el service.
        """
        await self.send_board_state()

    async def send_board_state(self) -> None:
        """Envía el estado actual serializado al cliente."""
        board_data = await self.get_board_snapshot()
        if board_data:
            await self.send_json({
                "type": "BOARD.UPDATED", 
                "payload": board_data
            })

    @database_sync_to_async
    def get_board_snapshot(self) -> Optional[Dict[str, Any]]:
        """
        Obtiene el snapshot del tablero inyectando el usuario en el contexto
        para que el Serializer calcule correctamente el rol (admin/editor/viewer).
        """
        board = selectors.board_detail_get(user=self.user, board_id=self.board_id)
        if not board:
            return None
        
        
        serializer = BoardDetailSerializer(board, context={'user': self.user})
        return cast(Dict[str, Any], serializer.data)