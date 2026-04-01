from django.core.exceptions import ValidationError
from django.db.models import QuerySet
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


class BoardViewSet(viewsets.ModelViewSet):
    """CRUD for boards with SQL-annotated metrics and selective prefetching."""

    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']

    def get_queryset(self) -> QuerySet:
        queryset = selectors.board_list_for_user(user=self.request.user)

        if self.action == 'list':
            queryset = queryset.prefetch_related('members', 'boardmember_set')
        else:
            queryset = queryset.prefetch_related(
                'columns__cards',
                'boardmember_set__user'
            )

        return queryset

    def get_serializer_class(self) -> type:
        if self.action == 'list':
            return BoardListSerializer
        return BoardDetailSerializer

    def perform_create(self, serializer) -> None:
        """Delegates creation to the service layer."""
        try:
            board = content_service.create_board(
                title=serializer.validated_data["title"],
                user=self.request.user
            )
            serializer.instance = board
        except Exception as e:
            raise ValidationError({"detail": str(e)})


class ColumnViewSet(viewsets.ModelViewSet):
    """CRUD for board columns."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ColumnSerializer

    def get_queryset(self) -> QuerySet:
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

    def update(self, request, **kwargs):
        column_id = kwargs.get('pk')
        title = request.data.get('title')

        column = content_service.update_column(
            column_id=column_id,
            title=title,
            user=request.user
        )

        serializer = self.get_serializer(column)
        return Response(serializer.data)

    def destroy(self, request, **kwargs):
        column_id = kwargs.get('pk')

        content_service.delete_column(
            column_id=column_id,
            user=request.user
        )

        return Response(status=status.HTTP_204_NO_CONTENT)


class CardViewSet(viewsets.ModelViewSet):
    """CRUD for cards (tasks)."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CardSerializer

    def get_queryset(self) -> QuerySet:
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
        """Delegates update to service layer with WebSocket notifications."""
        content_service.update_card(
            card_id=serializer.instance.id,
            user=self.request.user,
            **serializer.validated_data
        )

    def perform_destroy(self, instance) -> None:
        """Delegates deletion to service layer with WebSocket notifications."""
        content_service.delete_card(
            card_id=instance.id,
            user=self.request.user
        )