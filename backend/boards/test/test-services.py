import pytest
from django.core.exceptions import PermissionDenied
from model_bakery import baker

from boards.services import create_column, move_card
from boards.models import Board, Column, Card


@pytest.mark.django_db
def test_create_column_success():
    user = baker.make("auth.User")
    board = baker.make(Board, owner=user)

    column = create_column(
        board_id=board.id,
        title="To Do",
        user=user,
    )

    assert column.board == board
    assert column.title == "To Do"
    assert column.order == 1.0


@pytest.mark.django_db
def test_create_column_forbidden():
    owner = baker.make("auth.User")
    intruder = baker.make("auth.User")
    board = baker.make(Board, owner=owner)

    with pytest.raises(PermissionDenied):
        create_column(
            board_id=board.id,
            title="Hack",
            user=intruder,
        )


@pytest.mark.django_db
def test_move_card_success():
    user = baker.make("auth.User")
    board = baker.make(Board, owner=user)
    column_a = baker.make(Column, board=board, order=1)
    column_b = baker.make(Column, board=board, order=2)
    card = baker.make(Card, column=column_a, order=1)

    updated = move_card(
        card_id=card.id,
        new_column_id=column_b.id,
        new_order=5,
        user=user,
    )

    assert updated.column == column_b
    assert updated.order == 5


@pytest.mark.django_db
def test_move_card_forbidden():
    owner = baker.make("auth.User")
    intruder = baker.make("auth.User")
    board = baker.make(Board, owner=owner)
    column = baker.make(Column, board=board)
    card = baker.make(Card, column=column)

    with pytest.raises(PermissionDenied):
        move_card(
            card_id=card.id,
            new_column_id=column.id,
            new_order=1,
            user=intruder,
        )
