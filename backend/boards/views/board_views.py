import logging
from typing import Any, Optional
from django.core.exceptions import ValidationError
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response

from ..serializers.board_serializers import (
    BoardListSerializer,
    BoardDetailSerializer,
    ColumnSerializer,
    CardSerializer,
)
from .. import selectors
from ..services import content_service

logger = logging.getLogger(__name__)

class BoardViewSet(viewsets.ModelViewSet):
    """
    Controlador para Tableros.
    Aplica optimización de consultas para que el frontend reciba 
    dueños, miembros y tareas en una sola petición.
    """
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']

    def get_queryset(self) -> Any:
        """
        Refactorizado para incluir pre-carga de datos (Optimización N+1).
        """
        queryset = selectors.board_list_for_user(user=self.request.user)
        
        # Optimizamos según la acción para que el BoardCard de React cargue rápido
        if self.action == 'list':
            return queryset.select_related('owner').prefetch_related(
                'members', 
                'columns__cards'
            )
        
        return queryset.select_related('owner').prefetch_related(
            'columns__cards', 
            'boardmember_set__user'
        )

    def get_serializer_class(self) -> type:
        if self.action == 'list':
            return BoardListSerializer
        return BoardDetailSerializer

    def get_serializer_context(self) -> dict[str, Any]:
        """Inyecta el contexto necesario para los cálculos del Serializer."""
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def perform_create(self, serializer: Any) -> None:
        """Delega la creación al Service Layer para mantener la integridad."""
        try:
            board = content_service.create_board(
                title=serializer.validated_data["title"],
                user=self.request.user
            )
            serializer.instance = board
        except Exception as e:
            logger.error(f"Error creando tablero: {e}")
            raise ValidationError({"detail": str(e)})


class ColumnViewSet(viewsets.ModelViewSet):
    """Controlador para Columnas (Secciones del Tablero)."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ColumnSerializer

    def get_queryset(self) -> Any:
        board_id = self.request.query_params.get('board_id')
        
        # Filtro optimizado
        if board_id and board_id.isdigit():
            return selectors.column_list_by_board(
                user=self.request.user, 
                board_id=int(board_id)
            ).prefetch_related('cards')
            
        return selectors.get_user_columns(user=self.request.user).prefetch_related('cards')

    def perform_create(self, serializer: ColumnSerializer) -> None:
        board_id = self.request.data.get("board")
        if not board_id:
            raise ValidationError({"board": "ID del tablero requerido."})

        column = content_service.create_column(
            board_id=int(board_id),
            title=serializer.validated_data["title"],
            user=self.request.user,
        )
        serializer.instance = column


class CardViewSet(viewsets.ModelViewSet):
    """Controlador para Tarjetas (Tareas)."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CardSerializer

    def get_queryset(self) -> Any:
        # Cargamos la columna relacionada para evitar consultas extra en el serializer
        return selectors.get_user_cards(user=self.request.user).select_related('column')

    def perform_create(self, serializer: CardSerializer) -> None:
        column_id = self.request.data.get("column")
        if not column_id:
            raise ValidationError({"column": "ID de columna requerido."})

        card = content_service.create_card(
            column_id=int(column_id),
            title=serializer.validated_data["title"],
            description=serializer.validated_data.get("description", ""),
            priority=serializer.validated_data.get("priority", "medium"),
            user=self.request.user,
        )
        serializer.instance = card