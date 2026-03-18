from typing import Dict, Any, Optional, cast

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AbstractBaseUser

from .services import content_service
from . import selectors
from .serializers.board_serializers import BoardDetailSerializer


class BoardConsumer(AsyncJsonWebsocketConsumer):
    """WebSocket consumer for real-time board state synchronization."""

    board_id: int
    group_name: str
    user: AbstractBaseUser

    async def connect(self) -> None:
        self.user = self.scope["user"]

        if self.user.is_anonymous:
            await self.close()
            return

        route_kwargs: Dict[str, str] = self.scope["url_route"]["kwargs"]
        self.board_id = int(route_kwargs["board_id"])
        self.group_name = f"board_{self.board_id}"

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.send_board_state()

    async def disconnect(self, close_code: int) -> None:
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content: Dict[str, Any]) -> None:
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
            await self.send_json({"type": "ERROR", "message": str(e)})

    async def card_moved_event(self, event: Dict[str, Any]) -> None:
        """Forwards card movement events to all connected clients."""
        await self.send_json({
            "type": "CARD_MOVED",
            "payload": event["payload"]
        })

    async def board_broadcast_state(self, event: Dict[str, Any]) -> None:
        """Handler for 'board.broadcast_state' events from the channel layer."""
        await self.send_board_state()

    async def send_board_state(self) -> None:
        """Sends the current serialized board state to the client."""
        board_data = await self.get_board_snapshot()
        if board_data:
            await self.send_json({
                "type": "BOARD.UPDATED",
                "payload": board_data
            })

    @database_sync_to_async
    def get_board_snapshot(self) -> Optional[Dict[str, Any]]:
        """Fetches board snapshot with user context for role-aware serialization."""
        board = selectors.board_detail_get(user=self.user, board_id=self.board_id)
        if not board:
            return None

        serializer = BoardDetailSerializer(board, context={'user': self.user})
        return cast(Dict[str, Any], serializer.data)