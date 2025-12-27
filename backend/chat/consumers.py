from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from .services import create_message


class ChatConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        if self.scope["user"].is_anonymous:
            await self.close()
            return

        self.board_id = self.scope["url_route"]["kwargs"]["board_id"]
        self.group_name = f"chat_board_{self.board_id}"

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive_json(self, content):
        action = content.get("action")

        if action == "send_message":
            message = await self._create_message(
                content["message"]
            )

            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "broadcast_message",
                    "id": message.id,
                    "user": message.user.username,
                    "content": message.content,
                    "created_at": message.created_at.isoformat(),
                }
            )

    async def broadcast_message(self, event):
        await self.send_json(event)

    @database_sync_to_async
    def _create_message(self, content):
        return create_message(
            board_id=self.board_id,
            user=self.scope["user"],
            content=content,
        )
