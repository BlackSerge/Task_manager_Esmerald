import logging
from typing import Any
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
    Controlador para Tableros con arquitectura de alto rendimiento.
    Utiliza anotaciones SQL para métricas y pre-carga selectiva para roles.
    """
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']

    def get_queryset(self) -> Any:
        user = self.request.user
        """
        Optimizado: La lista general ya no necesita 'columns__cards' porque
        el progreso viene pre-calculado en la consulta SQL principal.
        """
        # El selector ahora inyecta: total_cards_count_annotated y completed_cards_count_annotated
        queryset = selectors.board_list_for_user(user=self.request.user)
        
        if self.action == 'list':
            # Mantenemos solo lo necesario para el Dashboard: Dueño y Miembros (para el rol)
            return queryset.select_related('owner').prefetch_related(
                'members', 
                'boardmember_set' # Requerido por el Mixin para calcular el rol en la lista
            )
        
        # En el detalle (retrieve), sí cargamos el árbol completo de datos
        return queryset.select_related('owner').prefetch_related(
            'columns__cards', 
            'boardmember_set__user'
        )

    def get_serializer_class(self) -> type:
        if self.action == 'list':
            return BoardListSerializer
        return BoardDetailSerializer

    def get_serializer_context(self) -> dict[str, Any]:
        """Inyecta el contexto necesario para que el Mixin acceda al usuario."""
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def perform_create(self, serializer: Any) -> None:
        """Delega la creación al Service Layer para mantener la integridad."""
        try:
            # El service layer debe retornar el objeto para que el serializer lo use
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

    def update(self, request,  **kwargs):
            column_id = kwargs.get('pk')
            title = request.data.get('title')
        
        
            column = content_service.update_column(
            column_id=column_id,
            title=title,
            user=request.user
        )
        
            serializer = self.get_serializer(column)
            return Response(serializer.data)

    def destroy(self, request,  **kwargs):
        column_id = kwargs.get('pk')
        
        content_service.delete_column(
            column_id=column_id,
            user=request.user
        )
        
        return Response(status=status.HTTP_204_NO_CONTENT)


class CardViewSet(viewsets.ModelViewSet):
    """Controlador para Tarjetas (Tareas)."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CardSerializer

    def get_queryset(self) -> Any:
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

    def perform_update(self, serializer: CardSerializer) -> None:
        """
        NUEVO: Sobreescribe la actualización para usar el service layer 
        y disparar notificaciones WebSocket.
        """
        content_service.update_card(
            card_id=serializer.instance.id,
            user=self.request.user,
            **serializer.validated_data
        )

    def perform_destroy(self, instance: Any) -> None:
        """
        NUEVO: Sobreescribe la eliminación para usar el service layer 
        y disparar notificaciones WebSocket.
        """
        content_service.delete_card(
            card_id=instance.id,
            user=self.request.user
        )