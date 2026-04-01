import pytest
from model_bakery import baker
from django.db import IntegrityError

from boards.models import Board, BoardMember, Column, Card


@pytest.mark.django_db
class TestBoardModel:

    def test_str_returns_title(self, board):
        assert str(board) == board.title

    def test_ordering_by_last_activity_desc(self, user):
        b1 = baker.make(Board, owner=user, title="Old")
        b2 = baker.make(Board, owner=user, title="New")
        titles = list(Board.objects.values_list("title", flat=True))
        assert "Old" in titles
        assert "New" in titles

    def test_completed_cards_count_no_columns(self, board):
        assert board.completed_cards_count == 0

    def test_completed_cards_count_with_columns(self, board):
        col1 = baker.make(Column, board=board, order=1.0)
        col2 = baker.make(Column, board=board, order=2.0)
        baker.make(Card, column=col1, _quantity=3)
        baker.make(Card, column=col2, _quantity=2)
        assert board.completed_cards_count == 2

    def test_last_column_property(self, board):
        col1 = baker.make(Column, board=board, order=1.0)
        col2 = baker.make(Column, board=board, order=2.0)
        assert board.last_column.id == col2.id

    def test_last_column_no_columns(self, board):
        assert board.last_column is None


@pytest.mark.django_db
class TestBoardMemberModel:

    def test_str_representation(self, board, user):
        member = BoardMember.objects.filter(board=board, user=user).first()
        assert user.username in str(member)
        assert board.title in str(member)

    def test_unique_together_constraint(self, board, user):
        with pytest.raises(IntegrityError):
            BoardMember.objects.create(
                board=board, user=user,
                role=BoardMember.Role.EDITOR
            )

    def test_role_choices(self):
        assert BoardMember.Role.ADMIN == 'admin'
        assert BoardMember.Role.EDITOR == 'editor'
        assert BoardMember.Role.VIEWER == 'viewer'

    def test_default_role_is_viewer(self, board, other_user):
        member = BoardMember.objects.create(board=board, user=other_user)
        assert member.role == BoardMember.Role.VIEWER


@pytest.mark.django_db
class TestColumnModel:

    def test_str_representation(self, column):
        assert column.board.title in str(column)
        assert column.title in str(column)

    def test_ordering_by_order(self, board):
        c2 = baker.make(Column, board=board, order=2.0)
        c1 = baker.make(Column, board=board, order=1.0)
        columns = list(board.columns.values_list("id", flat=True))
        assert columns.index(c1.id) < columns.index(c2.id)

    def test_cascade_delete_with_board(self, board, column):
        board_id = board.id
        board.delete()
        assert not Column.objects.filter(board_id=board_id).exists()


@pytest.mark.django_db
class TestCardModel:

    def test_str_returns_title(self, card):
        assert str(card) == card.title

    def test_default_priority_is_medium(self, column):
        card = Card.objects.create(column=column, title="Test")
        assert card.priority == Card.Priority.MEDIUM

    def test_priority_choices(self):
        assert Card.Priority.LOW == 'low'
        assert Card.Priority.MEDIUM == 'medium'
        assert Card.Priority.HIGH == 'high'

    def test_ordering_by_order(self, column):
        c2 = baker.make(Card, column=column, order=2.0)
        c1 = baker.make(Card, column=column, order=1.0)
        cards = list(column.cards.values_list("id", flat=True))
        assert cards.index(c1.id) < cards.index(c2.id)

    def test_cascade_delete_with_column(self, column, card):
        column_id = column.id
        column.delete()
        assert not Card.objects.filter(column_id=column_id).exists()
