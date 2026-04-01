import pytest
from unittest.mock import patch
from rest_framework import status
from rest_framework.test import APIClient
from model_bakery import baker
from django.contrib.auth import get_user_model

from boards.models import Board, BoardMember, Column, Card

User = get_user_model()

WS_PATCH = "boards.services.content_service.notify_board_change"
WS_MOVE_PATCH = "boards.services.content_service.notify_card_movement"
WS_TEAM_PATCH = "boards.services.team_service.notify_board_change"


@pytest.mark.django_db
class TestBoardEndpoints:

    def test_list_boards_authenticated(self, auth_client, board):
        response = auth_client.get("/api/boards/")
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["title"] == board.title

    def test_list_boards_unauthenticated(self, api_client):
        response = api_client.get("/api/boards/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_only_user_boards(self, auth_client, board, other_user):
        baker.make(Board, owner=other_user)
        response = auth_client.get("/api/boards/")
        assert len(response.data) == 1

    def test_retrieve_board(self, auth_client, board):
        response = auth_client.get(f"/api/boards/{board.id}/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["title"] == board.title
        assert "columns" in response.data
        assert "members" in response.data

    def test_create_board(self, auth_client, user):
        with patch(WS_PATCH):
            response = auth_client.post("/api/boards/", {"title": "New Board"})
        assert response.status_code == status.HTTP_201_CREATED
        assert Board.objects.filter(owner=user, title="New Board").exists()

    def test_create_board_missing_title(self, auth_client):
        response = auth_client.post("/api/boards/", {})
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_delete_board(self, auth_client, board):
        response = auth_client.delete(f"/api/boards/{board.id}/")
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Board.objects.filter(id=board.id).exists()

    def test_update_board(self, auth_client, board):
        response = auth_client.patch(
            f"/api/boards/{board.id}/",
            {"title": "Updated"},
            format="json"
        )
        assert response.status_code == status.HTTP_200_OK
        board.refresh_from_db()
        assert board.title == "Updated"


@pytest.mark.django_db
class TestColumnEndpoints:

    def test_list_columns_by_board(self, auth_client, board, column):
        response = auth_client.get(f"/api/boards/columns/?board_id={board.id}")
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    def test_create_column(self, auth_client, board):
        with patch(WS_PATCH):
            response = auth_client.post(
                "/api/boards/columns/",
                {"title": "Doing", "board": board.id},
                format="json"
            )
        assert response.status_code == status.HTTP_201_CREATED

    def test_update_column(self, auth_client, column):
        with patch(WS_PATCH):
            response = auth_client.put(
                f"/api/boards/columns/{column.id}/",
                {"title": "Updated Col"},
                format="json"
            )
        assert response.status_code == status.HTTP_200_OK
        column.refresh_from_db()
        assert column.title == "Updated Col"

    def test_delete_column(self, auth_client, column):
        with patch(WS_PATCH):
            response = auth_client.delete(f"/api/boards/columns/{column.id}/")
        assert response.status_code == status.HTTP_204_NO_CONTENT


@pytest.mark.django_db
class TestCardEndpoints:

    def test_list_cards(self, auth_client, card):
        response = auth_client.get("/api/boards/cards/")
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    def test_create_card(self, auth_client, column):
        with patch(WS_PATCH):
            response = auth_client.post(
                "/api/boards/cards/",
                {"title": "New Task", "column": column.id},
                format="json"
            )
        assert response.status_code == status.HTTP_201_CREATED

    def test_update_card(self, auth_client, card):
        with patch(WS_PATCH):
            response = auth_client.patch(
                f"/api/boards/cards/{card.id}/",
                {"title": "Updated Task"},
                format="json"
            )
        assert response.status_code == status.HTTP_200_OK

    def test_delete_card(self, auth_client, card):
        with patch(WS_PATCH):
            response = auth_client.delete(f"/api/boards/cards/{card.id}/")
        assert response.status_code == status.HTTP_204_NO_CONTENT


@pytest.mark.django_db
class TestCardMoveEndpoint:

    def test_move_card(self, auth_client, board, card):
        new_col = baker.make(Column, board=board, order=2.0)
        with patch(WS_PATCH), patch(WS_MOVE_PATCH):
            response = auth_client.patch(
                f"/api/boards/cards/{card.id}/move/",
                {"column_id": new_col.id, "new_order": 5.0},
                format="json"
            )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == "moved"

    def test_move_card_missing_params(self, auth_client, card):
        response = auth_client.patch(
            f"/api/boards/cards/{card.id}/move/",
            {},
            format="json"
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestBoardTeamEndpoints:

    def test_invite_member(self, auth_client, board, other_user):
        with patch(WS_TEAM_PATCH):
            response = auth_client.post(
                f"/api/boards/{board.id}/members/",
                {"user_id": other_user.id, "role": "editor"},
                format="json"
            )
        assert response.status_code == status.HTTP_201_CREATED
        assert BoardMember.objects.filter(
            board=board, user=other_user
        ).exists()

    def test_invite_invalid_user(self, auth_client, board):
        response = auth_client.post(
            f"/api/boards/{board.id}/members/",
            {"user_id": 99999, "role": "editor"},
            format="json"
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_remove_member(self, auth_client, board, editor_user):
        with patch(WS_TEAM_PATCH):
            response = auth_client.delete(
                f"/api/boards/{board.id}/members/{editor_user.id}/"
            )
        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_unauthenticated_invite(self, api_client, board, other_user):
        response = api_client.post(
            f"/api/boards/{board.id}/members/",
            {"user_id": other_user.id, "role": "editor"},
            format="json"
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
