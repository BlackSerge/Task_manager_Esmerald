from rest_framework import viewsets, permissions

from . import selectors, services
from .serializers import (
    BoardListSerializer,
    BoardDetailSerializer,
    ColumnSerializer,
    CardSerializer,
)


class BoardViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return selectors.get_user_boards(self.request.user)

    def get_serializer_class(self):
        return BoardListSerializer if self.action == "list" else BoardDetailSerializer

    def perform_create(self, serializer):
        board = services.create_board(
            title=serializer.validated_data["title"],
            user=self.request.user,
        )
        serializer.instance = board


class ColumnViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ColumnSerializer

    def get_queryset(self):
        return selectors.get_user_columns(self.request.user)

    def perform_create(self, serializer):
        column = services.create_column(
            board_id=self.request.data["board"],
            title=serializer.validated_data["title"],
            user=self.request.user,
        )
        serializer.instance = column


class CardViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CardSerializer

    def get_queryset(self):
        return selectors.get_user_cards(self.request.user)
