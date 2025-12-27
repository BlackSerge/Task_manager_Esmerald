# boards/consumers.py
import traceback
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Board, Column, Card
from .services import move_card

class BoardConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        """Maneja la conexión inicial del WebSocket"""
        # 1. Validación de usuario (Middleware de Channels debe estar configurado)
        if self.scope["user"].is_anonymous:
            print("❌ [WS]: Intento de conexión anónima rechazado.")
            await self.close()
            return

        self.board_id = self.scope["url_route"]["kwargs"]["board_id"]
        self.group_name = f"board_{self.board_id}"

        # 2. Unión al grupo del tablero para broadcasting
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        print(f"✅ [WS]: Usuario {self.scope['user']} conectado al tablero {self.board_id}")

        # 3. Envío del estado inicial del tablero al conectar
        board_data = await self.get_board_data()
        if board_data:
            await self.send_json(board_data)
        else:
            await self.send_json({"type": "BOARD_NOT_FOUND", "id": self.board_id})

    async def disconnect(self, close_code):
        """Maneja la desconexión del cliente"""
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            print(f"🔌 [WS]: Desconectado del tablero {self.board_id} (Código: {close_code})")

    async def receive_json(self, content):
        """Punto de entrada para todos los mensajes enviados desde el Frontend"""
        msg_type = content.get("type")
        payload = content.get("payload") or {}

        try:
            # Enrutamiento de acciones
            if msg_type == "CREATE_BOARD":
                await self._create_board(payload.get("title", "Nuevo Tablero"))
            
            elif msg_type == "column.create":
                await self._create_column(payload.get("title"))
            
            elif msg_type == "column.update":
                await self._update_column(payload)
            
            elif msg_type == "card.create":
                await self._create_card(payload.get("column_id"), payload.get("title"))
            
            elif msg_type == "card.update":
                await self._update_card(payload)
            
            elif msg_type == "card.move":
                await self._move_card(payload)

            # Tras realizar cualquier cambio, notificamos a todos los miembros del grupo
            await self.broadcast_board_state()

        except Exception as e:
            print(f"❌ [WS ERROR] en receive_json: {str(e)}")
            await self.send_json({"type": "ERROR", "message": "No se pudo procesar la acción"})

    # --- Sincronización Masiva (Broadcasting) ---

    async def broadcast_board_state(self):
        """Obtiene la data actualizada de la DB y la envía a todo el grupo"""
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
        """Handler que recibe el mensaje del group_send y lo envía al socket físico"""
        await self.send_json(event["data"])

    # --- Operaciones de Base de Datos (Async) ---

    @database_sync_to_async
    def get_board_data(self):
        """Serializa el tablero completo optimizando las consultas"""
        try:
            from .serializers import BoardDetailSerializer
            board = Board.objects.prefetch_related('columns__cards').get(id=self.board_id)
            return BoardDetailSerializer(board).data
        except Exception as e:
            print(f"❌ [WS ERROR] Serialización: {str(e)}")
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
    def _update_column(self, data):
        return Column.objects.filter(id=data["column_id"]).update(title=data["title"])

    @database_sync_to_async
    def _create_card(self, column_id, title):
        order = Card.objects.filter(column_id=column_id).count()
        return Card.objects.create(column_id=column_id, title=title, order=order)

    @database_sync_to_async
    def _update_card(self, data):
        """Actualiza campos específicos de la tarjeta (principalmente el título)"""
        return Card.objects.filter(id=data["card_id"]).update(title=data["title"])

    @database_sync_to_async
    def _move_card(self, data):
        """Invoca el servicio de lógica de negocio para mover tarjetas"""
        return move_card(
            card_id=data["card_id"],
            new_column_id=data["new_column_id"],
            new_order=data["new_order"],
            user=self.scope["user"]
        )