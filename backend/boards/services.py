from django.core.exceptions import PermissionDenied
from django.db.models import Max
from django.db import transaction

from .models import Board, Column, Card


def create_board(*, title, user):
    return Board.objects.create(title=title, owner=user)


def create_column(*, board_id, title, user):
    board = Board.objects.get(pk=board_id)

    if board.owner != user:
        raise PermissionDenied("No tienes permiso sobre este tablero")

    last_order = Column.objects.filter(board=board).aggregate(Max("order"))["order__max"]
    order = (last_order or 0.0) + 1.0

    return Column.objects.create(board=board, title=title, order=order)


@transaction.atomic
def move_card(*, card_id, new_column_id, new_order, user):
    card = Card.objects.select_related("column__board").select_for_update().get(pk=card_id)
    new_column = Column.objects.select_related("board").get(pk=new_column_id)

    if card.column.board.owner != user:
        raise PermissionDenied("No autorizado")

    card.column = new_column
    card.order = new_order
    card.save()

    return card
