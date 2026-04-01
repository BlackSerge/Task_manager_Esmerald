import pytest
from unittest.mock import patch
from django.core.exceptions import PermissionDenied
from django.http import Http404
from model_bakery import baker

from boards.models import Board, BoardMember, Column, Card
from boards.services.content_service import (
    create_board,
    create_column,
    update_column,
    delete_column,
    create_card,
    update_card,
    delete_card,
    move_card,
)

WS_PATCH = "boards.services.content_service.notify_board_change"
WS_MOVE_PATCH = "boards.services.content_service.notify_card_movement"


@pytest.mark.django_db
class TestCreateBoard:

    def test_creates_board_with_owner(self, user):
        with patch(WS_PATCH):
            board = create_board(title="My Board", user=user)
        assert board.title == "My Board"
        assert board.owner == user

    def test_creates_admin_membership(self, user):
        with patch(WS_PATCH):
            board = create_board(title="Test", user=user)
        assert BoardMember.objects.filter(
            board=board, user=user, role=BoardMember.Role.ADMIN
        ).exists()

    def test_rejects_anonymous_user(self):
        from django.contrib.auth.models import AnonymousUser
        with pytest.raises(PermissionDenied):
            create_board(title="Hack", user=AnonymousUser())


@pytest.mark.django_db
class TestCreateColumn:

    def test_creates_column_for_owner(self, user, board):
        with patch(WS_PATCH):
            column = create_column(board_id=board.id, title="To Do", user=user)
        assert column.title == "To Do"
        assert column.board == board
        assert column.order == 1.0

    def test_increments_order(self, user, board):
        with patch(WS_PATCH):
            c1 = create_column(board_id=board.id, title="Col 1", user=user)
            c2 = create_column(board_id=board.id, title="Col 2", user=user)
        assert c2.order > c1.order

    def test_rejects_viewer(self, viewer_user, board):
        with pytest.raises(PermissionDenied):
            with patch(WS_PATCH):
                create_column(board_id=board.id, title="Hack", user=viewer_user)

    def test_rejects_non_member(self, other_user, board):
        with pytest.raises(PermissionDenied):
            with patch(WS_PATCH):
                create_column(board_id=board.id, title="Hack", user=other_user)

    def test_allows_editor(self, editor_user, board):
        with patch(WS_PATCH):
            column = create_column(board_id=board.id, title="Editor Col", user=editor_user)
        assert column.title == "Editor Col"

    def test_invalid_board_raises_404(self, user):
        with pytest.raises(Http404):
            with patch(WS_PATCH):
                create_column(board_id=99999, title="Ghost", user=user)


@pytest.mark.django_db
class TestUpdateColumn:

    def test_updates_column_title(self, user, column):
        with patch(WS_PATCH):
            updated = update_column(column_id=column.id, title="Done", user=user)
        assert updated.title == "Done"

    def test_rejects_viewer(self, viewer_user, column):
        with pytest.raises(PermissionDenied):
            with patch(WS_PATCH):
                update_column(column_id=column.id, title="Hack", user=viewer_user)


@pytest.mark.django_db
class TestDeleteColumn:

    def test_deletes_column(self, user, column):
        column_id = column.id
        with patch(WS_PATCH):
            delete_column(column_id=column_id, user=user)
        assert not Column.objects.filter(id=column_id).exists()

    def test_rejects_non_member(self, other_user, column):
        with pytest.raises(PermissionDenied):
            with patch(WS_PATCH):
                delete_column(column_id=column.id, user=other_user)


@pytest.mark.django_db
class TestCreateCard:

    def test_creates_card_in_column(self, user, column):
        with patch(WS_PATCH):
            card = create_card(
                column_id=column.id, title="Task", user=user
            )
        assert card.title == "Task"
        assert card.column == column
        assert card.priority == Card.Priority.MEDIUM

    def test_custom_priority(self, user, column):
        with patch(WS_PATCH):
            card = create_card(
                column_id=column.id, title="Urgent",
                priority=Card.Priority.HIGH, user=user
            )
        assert card.priority == Card.Priority.HIGH

    def test_increments_order(self, user, column):
        with patch(WS_PATCH):
            c1 = create_card(column_id=column.id, title="A", user=user)
            c2 = create_card(column_id=column.id, title="B", user=user)
        assert c2.order > c1.order

    def test_rejects_viewer(self, viewer_user, column):
        with pytest.raises(PermissionDenied):
            with patch(WS_PATCH):
                create_card(column_id=column.id, title="Hack", user=viewer_user)


@pytest.mark.django_db
class TestUpdateCard:

    def test_updates_card_title(self, user, card):
        with patch(WS_PATCH):
            updated = update_card(card_id=card.id, user=user, title="New Title")
        assert updated.title == "New Title"

    def test_updates_multiple_fields(self, user, card):
        with patch(WS_PATCH):
            updated = update_card(
                card_id=card.id, user=user,
                title="Updated", description="desc", priority="high"
            )
        assert updated.title == "Updated"
        assert updated.description == "desc"
        assert updated.priority == "high"

    def test_rejects_viewer(self, viewer_user, card):
        with pytest.raises(PermissionDenied):
            with patch(WS_PATCH):
                update_card(card_id=card.id, user=viewer_user, title="Hack")


@pytest.mark.django_db
class TestDeleteCard:

    def test_deletes_card(self, user, card):
        card_id = card.id
        with patch(WS_PATCH):
            delete_card(card_id=card_id, user=user)
        assert not Card.objects.filter(id=card_id).exists()

    def test_rejects_non_member(self, other_user, card):
        with pytest.raises(PermissionDenied):
            with patch(WS_PATCH):
                delete_card(card_id=card.id, user=other_user)


@pytest.mark.django_db
class TestMoveCard:

    def test_moves_card_to_new_column(self, user, board, card):
        new_col = baker.make(Column, board=board, order=2.0)
        with patch(WS_PATCH), patch(WS_MOVE_PATCH):
            moved = move_card(
                card_id=card.id, new_column_id=new_col.id,
                new_order=5.0, user=user
            )
        assert moved.column_id == new_col.id
        assert moved.order == 5.0

    def test_rejects_viewer(self, viewer_user, card, board):
        new_col = baker.make(Column, board=board, order=2.0)
        with pytest.raises(PermissionDenied):
            with patch(WS_PATCH), patch(WS_MOVE_PATCH):
                move_card(
                    card_id=card.id, new_column_id=new_col.id,
                    new_order=1.0, user=viewer_user
                )
