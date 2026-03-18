import pytest
from rest_framework import status
from rest_framework.test import APIClient
from model_bakery import baker
from django.contrib.auth import get_user_model

from boards.models import Board
from chat.models import Message

User = get_user_model()


@pytest.mark.django_db
class TestBoardMessagesView:

    def test_returns_messages(self):
        user = baker.make(User)
        board = baker.make(Board, owner=user)
        Message.objects.create(board=board, user=user, content="Hello")
        Message.objects.create(board=board, user=user, content="World")

        client = APIClient()
        client.force_authenticate(user=user)
        response = client.get(f"/api/chat/boards/{board.id}/messages/")

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 2

    def test_excludes_deleted_messages(self):
        user = baker.make(User)
        board = baker.make(Board, owner=user)
        Message.objects.create(board=board, user=user, content="Visible")
        Message.objects.create(board=board, user=user, content="Gone", is_deleted=True)

        client = APIClient()
        client.force_authenticate(user=user)
        response = client.get(f"/api/chat/boards/{board.id}/messages/")

        assert len(response.data) == 1
        assert response.data[0]["content"] == "Visible"

    def test_response_structure(self):
        user = baker.make(User)
        board = baker.make(Board, owner=user)
        Message.objects.create(board=board, user=user, content="Test")

        client = APIClient()
        client.force_authenticate(user=user)
        response = client.get(f"/api/chat/boards/{board.id}/messages/")

        msg = response.data[0]
        assert set(msg.keys()) == {"id", "username", "content", "created_at", "edited_at"}

    def test_unauthenticated_denied(self):
        user = baker.make(User)
        board = baker.make(Board, owner=user)
        client = APIClient()
        response = client.get(f"/api/chat/boards/{board.id}/messages/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_invalid_board_404(self):
        user = baker.make(User)
        client = APIClient()
        client.force_authenticate(user=user)
        response = client.get("/api/chat/boards/99999/messages/")
        assert response.status_code == status.HTTP_404_NOT_FOUND
