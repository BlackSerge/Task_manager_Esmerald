from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Board, Column, Card
from .services import move_card
from .serializers import BoardDetailSerializer

class BoardConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        # 1. Verificación de seguridad (Middleware inyecta el user)
        if self.scope["user"].is_anonymous:
            print("❌ [WS]: Intento de conexión anónima rechazado.")
            await self.close()
            return

        self.board_id = self.scope["url_route"]["kwargs"]["board_id"]
        self.group_name = f"board_{self.board_id}"

        # 2. Unirse al grupo del tablero
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        
        # 3. ACEPTAR CONEXIÓN
        await self.accept()
        print(f"✅ [WS]: Usuario {self.scope['user']} conectado al tablero {self.board_id}")

      # 4. Enviar estado inicial del tablero al conectarse
        board_data = await self.get_board_data()
        if board_data:
            await self.send_json(board_data)
        else:
            # Si el tablero no existe en BD, avisamos al front
            await self.send_json({"type": "BOARD_NOT_FOUND", "id": self.board_id})

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content):
        """Maneja los mensajes entrantes desde Angular"""
        msg_type = content.get("type")
        # Aseguramos que el payload sea un diccionario
        payload = content.get("payload") if content.get("payload") is not None else content
        
        print(f"--- 📥 ACCIÓN RECIBIDA: {msg_type} ---")

        try:
            # 1. CREAR TABLERO
            if msg_type == "CREATE_BOARD":
                title = payload.get("title", "Nuevo Tablero")
                await self._create_board(title)
                print(f"✅ Tablero creado/verificado: {title}")
                await self.broadcast_board_state()

            # 2. CREAR COLUMNA
            elif msg_type == "column.create":
                title = payload.get("title")
                print(f"🔨 Intentando crear columna: {title} en board {self.board_id}")
                if title:
                    await self._create_column(title)
                    print(f"✅ Columna '{title}' guardada en BD")
                    await self.broadcast_board_state()
                else:
                    print("⚠️ Error: El título de la columna llegó vacío")

            # 3. CREAR TARJETA
            elif msg_type == "card.create":
                await self._create_card(payload.get("column_id"), payload.get("title"))
                print(f"✅ Tarjeta creada en columna {payload.get('column_id')}")
                await self.broadcast_board_state()

            # 4. MOVER TARJETA
            elif msg_type == "card.move":
                await self._move_card(payload)
                print(f"✅ Tarjeta {payload.get('card_id')} movida")
                await self.broadcast_board_state()
            
            else:
                print(f"❓ Tipo de mensaje desconocido: {msg_type}")

        except Exception as e:
            print(f"❌ ERROR CRÍTICO en receive_json: {str(e)}")
            await self.send_json({"type": "ERROR", "message": "Error interno en el servidor"})

    # --- Lógica de Notificación Masiva ---

    async def broadcast_board_state(self):
        """Obtiene el tablero y lo envía a TODO el grupo"""
        board_data = await self.get_board_data()
        if board_data:
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "board.update",  # <--- Esto debe coincidir con el nombre del método abajo
                    "data": board_data
                }
            )

    async def board_update(self, event):
        """Este es el handler que Channels llama automáticamente"""
        # Enviamos 'data' que es el tablero serializado
        await self.send_json(event["data"])

    # --- Operaciones de Base de Datos (Async) ---

    @database_sync_to_async
    def get_board_data(self):
        try:
            # Optimizamos con prefetch_related para evitar el problema N+1
            board = Board.objects.prefetch_related('columns__cards').get(id=self.board_id)
            return BoardDetailSerializer(board).data
        except Board.DoesNotExist:
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