import pytest
from model_bakery import baker
from django.contrib.auth import get_user_model

from boards.models import Board, BoardMember, Column, Card
from boards.selectors import (
    board_list_for_user,
    board_detail_get,
    column_list_by_board,
    get_user_cards,
    get_user_columns,
)

User = get_user_model()


@pytest.mark.django_db
class TestBoardListForUser:

    def test_returns_owned_boards(self, user, board):
        result = board_list_for_user(user=user)
        assert board in result

    def test_excludes_unrelated_boards(self, user, other_user):
        baker.make(Board, owner=other_user)
        result = board_list_for_user(user=user)
        assert result.count() == 0

    def test_returns_shared_boards(self, user, other_user):
        other_board = baker.make(Board, owner=other_user)
        BoardMember.objects.create(board=other_board, user=user, role=BoardMember.Role.VIEWER)
        result = board_list_for_user(user=user)
        assert other_board in result

    def test_no_duplicates_for_owner_and_member(self, user, board):
        result = board_list_for_user(user=user)
        assert result.count() == 1

    def test_annotates_total_cards(self, user, board):
        col = baker.make(Column, board=board)
        baker.make(Card, column=col, _quantity=5)
        result = board_list_for_user(user=user).first()
        assert result.total_cards_count_annotated == 5

    def test_annotates_completed_cards(self, user, board):
        col1 = baker.make(Column, board=board, order=1.0)
        col2 = baker.make(Column, board=board, order=2.0)
        baker.make(Card, column=col1, _quantity=3)
        baker.make(Card, column=col2, _quantity=2)
        result = board_list_for_user(user=user).first()
        assert result.completed_cards_count_annotated == 2

    def test_annotates_zero_when_no_cards(self, user, board):
        result = board_list_for_user(user=user).first()
        assert result.total_cards_count_annotated == 0
        assert result.completed_cards_count_annotated == 0


@pytest.mark.django_db
class TestBoardDetailGet:

    def test_returns_board_for_owner(self, user, board):
        result = board_detail_get(user=user, board_id=board.id)
        assert result is not None
        assert result.id == board.id

    def test_returns_none_for_non_member(self, other_user, board):
        result = board_detail_get(user=other_user, board_id=board.id)
        assert result is None

    def test_returns_none_for_invalid_id(self, user):
        result = board_detail_get(user=user, board_id=99999)
        assert result is None


@pytest.mark.django_db
class TestColumnListByBoard:

    def test_returns_columns_for_owner(self, user, board, column):
        result = column_list_by_board(user=user, board_id=board.id)
        assert column in result

    def test_excludes_other_board_columns(self, user, board, other_user):
        other_board = baker.make(Board, owner=other_user)
        other_col = baker.make(Column, board=other_board)
        result = column_list_by_board(user=user, board_id=board.id)
        assert other_col not in result

    def test_ordered_by_order_field(self, user, board):
        c2 = baker.make(Column, board=board, order=2.0)
        c1 = baker.make(Column, board=board, order=1.0)
        result = list(column_list_by_board(user=user, board_id=board.id))
        assert result.index(c1) < result.index(c2)


@pytest.mark.django_db
class TestGetUserCards:

    def test_returns_cards_for_owner(self, user, card):
        result = get_user_cards(user=user)
        assert card in result

    def test_excludes_other_user_cards(self, other_user, card):
        result = get_user_cards(user=other_user)
        assert card not in result


@pytest.mark.django_db
class TestGetUserColumns:

    def test_returns_columns_for_owner(self, user, column):
        result = get_user_columns(user=user)
        assert column in result

    def test_excludes_other_user_columns(self, other_user, column):
        result = get_user_columns(user=other_user)
        assert column not in result
