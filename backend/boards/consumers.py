# boards/consumers.py
import traceback
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Board, Column, Card
from .services import move_card

class BoardConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        # 1. Validación de usuario
        if self.scope["user"].is_anonymous:
            print("❌ [WS]: Intento de conexión anónima rechazado.")
            await self.close()
            return

        self.board_id = self.scope["url_route"]["kwargs"]["board_id"]
        self.group_name = f"board_{self.board_id}"

        # 2. Unión al grupo
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        print(f"✅ [WS]: Usuario {self.scope['user']} conectado al tablero {self.board_id}")

        # 3. Envío de estado inicial
        board_data = await self.get_board_data()
        if board_data:
            await self.send_json(board_data)
        else:
            await self.send_json({"type": "BOARD_NOT_FOUND", "id": self.board_id})

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            print(f"🔌 [WS]: Desconectado del tablero {self.board_id}")

    async def receive_json(self, content):
        """Procesa acciones enviadas desde el Frontend (React/Zustand)"""
        msg_type = content.get("type")
        payload = content.get("payload") if content.get("payload") is not None else content
        
        try:
            if msg_type == "CREATE_BOARD":
                await self._create_board(payload.get("title", "Nuevo Tablero"))
            elif msg_type == "column.create":
                await self._create_column(payload.get("title"))
            elif msg_type == "card.create":
                await self._create_card(payload.get("column_id"), payload.get("title"))
            elif msg_type == "card.move":
                await self._move_card(payload)
            
            # Después de cualquier cambio, notificamos a todos los usuarios del tablero
            await self.broadcast_board_state()

        except Exception as e:
            print(f"❌ [WS ERROR] en receive_json: {str(e)}")
            await self.send_json({"type": "ERROR", "message": str(e)})

    # --- Sincronización Masiva ---

    async def broadcast_board_state(self):
        """Obtiene el tablero fresco y lo envía a todo el grupo"""
        board_data = await self.get_board_data()
        if board_data:
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "board.update",
                    "data": board_data
                }
            )

    async def board_update(self, event):
        """Handler llamado por el group_send"""
        await self.send_json(event["data"])

    # --- Operaciones de Base de Datos (Async) ---

    @database_sync_to_async
    def get_board_data(self):
        """Serializa el tablero con prefetch para optimizar rendimiento"""
        try:
            from .serializers import BoardDetailSerializer
            board = Board.objects.prefetch_related('columns__cards').get(id=self.board_id)
            return BoardDetailSerializer(board).data
        except Exception as e:
            print(f"❌ [WS ERROR]: Error serializando tablero {self.board_id}: {str(e)}")
            traceback.print_exc()
            return None

    @database_sync_to_async
    def _create_board(self, title):
        return Board.objects.get_or_create(
            id=self.board_id, 
            defaults={'title': title, 'owner': self.scope["user"]}
        )

    @database_sync_to_async
    def _create_column(self, title):
        order = Column.objects.filter(board_id=self.board_id).count()
        return Column.objects.create(board_id=self.board_id, title=title, order=order)

    @database_sync_to_async
    def _create_card(self, column_id, title):
        order = Card.objects.filter(column_id=column_id).count()
        return Card.objects.create(column_id=column_id, title=title, order=order)

    @database_sync_to_async
    def _move_card(self, data):
        return move_card(
            card_id=data["card_id"],
            new_column_id=data["new_column_id"],
            new_order=data["new_order"],
            user=self.scope["user"],
        )