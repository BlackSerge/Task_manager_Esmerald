import pytest
from model_bakery import baker
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory

from boards.models import Board, BoardMember, Column, Card
from boards.serializers.board_serializers import (
    BoardListSerializer,
    BoardDetailSerializer,
    CardSerializer,
    ColumnSerializer,
    UserMinimalSerializer,
)
from boards.serializers.team_serializers import MemberInviteSerializer

User = get_user_model()


@pytest.mark.django_db
class TestUserMinimalSerializer:

    def test_output_fields(self, user):
        data = UserMinimalSerializer(user).data
        assert set(data.keys()) == {"id", "username", "email"}
        assert data["id"] == user.id


@pytest.mark.django_db
class TestCardSerializer:

    def test_output_fields(self, card):
        data = CardSerializer(card).data
        assert set(data.keys()) == {"id", "title", "description", "priority", "order", "column"}
        assert data["title"] == card.title

    def test_valid_input(self, column):
        data = {"title": "New", "column": column.id}
        s = CardSerializer(data=data)
        assert s.is_valid(), s.errors

    def test_missing_title_invalid(self, column):
        s = CardSerializer(data={"column": column.id})
        assert not s.is_valid()
        assert "title" in s.errors


@pytest.mark.django_db
class TestColumnSerializer:

    def test_output_includes_cards(self, column, card):
        data = ColumnSerializer(column).data
        assert "cards" in data
        assert len(data["cards"]) == 1
        assert data["cards"][0]["title"] == card.title


@pytest.mark.django_db
class TestBoardListSerializer:

    def _make_context(self, user):
        factory = APIRequestFactory()
        request = factory.get("/")
        request.user = user
        return {"request": request}

    def test_output_fields(self, user, board):
        context = self._make_context(user)
        data = BoardListSerializer(board, context=context).data
        expected_fields = {
            "id", "title", "owner", "members", "current_user_role",
            "progress_percentage", "total_cards", "completed_cards",
            "last_activity", "created_at", "updated_at"
        }
        assert set(data.keys()) == expected_fields

    def test_owner_role_is_admin(self, user, board):
        context = self._make_context(user)
        data = BoardListSerializer(board, context=context).data
        assert data["current_user_role"] == "admin"

    def test_editor_role(self, editor_user, board):
        context = self._make_context(editor_user)
        data = BoardListSerializer(board, context=context).data
        assert data["current_user_role"] == "editor"

    def test_viewer_role(self, viewer_user, board):
        context = self._make_context(viewer_user)
        data = BoardListSerializer(board, context=context).data
        assert data["current_user_role"] == "viewer"

    def test_progress_zero_when_no_cards(self, user, board):
        context = self._make_context(user)
        data = BoardListSerializer(board, context=context).data
        assert data["total_cards"] == 0
        assert data["completed_cards"] == 0
        assert data["progress_percentage"] == 0

    def test_progress_with_cards(self, user, board):
        col1 = baker.make(Column, board=board, order=1.0)
        col2 = baker.make(Column, board=board, order=2.0)
        baker.make(Card, column=col1, _quantity=3)
        baker.make(Card, column=col2, _quantity=2)

        context = self._make_context(user)
        data = BoardListSerializer(board, context=context).data
        assert data["total_cards"] == 5
        assert data["completed_cards"] == 2
        assert data["progress_percentage"] == 40


@pytest.mark.django_db
class TestBoardDetailSerializer:

    def _make_context(self, user):
        factory = APIRequestFactory()
        request = factory.get("/")
        request.user = user
        return {"request": request}

    def test_includes_columns(self, user, board, column, card):
        context = self._make_context(user)
        data = BoardDetailSerializer(board, context=context).data
        assert "columns" in data
        assert len(data["columns"]) == 1
        assert data["columns"][0]["title"] == column.title

    def test_includes_members_with_role(self, user, board, editor_user):
        context = self._make_context(user)
        data = BoardDetailSerializer(board, context=context).data
        assert "members" in data
        assert len(data["members"]) >= 1


@pytest.mark.django_db
class TestMemberInviteSerializer:

    def test_valid_input(self, other_user):
        data = {"user_id": other_user.id, "role": "editor"}
        s = MemberInviteSerializer(data=data)
        assert s.is_valid(), s.errors

    def test_invalid_user_id(self):
        data = {"user_id": 99999, "role": "editor"}
        s = MemberInviteSerializer(data=data)
        assert not s.is_valid()
        assert "user_id" in s.errors

    def test_missing_user_id(self):
        data = {"role": "editor"}
        s = MemberInviteSerializer(data=data)
        assert not s.is_valid()
        assert "user_id" in s.errors

    def test_default_role_is_viewer(self, other_user):
        data = {"user_id": other_user.id}
        s = MemberInviteSerializer(data=data)
        assert s.is_valid()
        assert s.validated_data["role"] == BoardMember.Role.VIEWER
