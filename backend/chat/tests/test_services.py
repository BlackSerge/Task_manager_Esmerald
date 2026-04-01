import pytest
from model_bakery import baker
from django.contrib.auth import get_user_model

from boards.models import Board
from chat.models import Message
from chat.services import create_message, edit_message, delete_message

User = get_user_model()


@pytest.mark.django_db
class TestCreateMessage:

    def test_creates_message(self):
        user = baker.make(User)
        board = baker.make(Board, owner=user)
        msg = create_message(board_id=board.id, user=user, content="Hello")
        assert msg.content == "Hello"
        assert msg.board == board
        assert msg.user == user

    def test_invalid_board_raises_404(self):
        from django.http import Http404
        user = baker.make(User)
        with pytest.raises(Http404):
            create_message(board_id=99999, user=user, content="Ghost")


@pytest.mark.django_db
class TestEditMessage:

    def test_edits_message_content(self):
        user = baker.make(User)
        board = baker.make(Board, owner=user)
        msg = Message.objects.create(board=board, user=user, content="Original")
        updated = edit_message(message_id=msg.id, user=user, content="Edited")
        assert updated.content == "Edited"
        assert updated.edited_at is not None

    def test_cannot_edit_other_users_message(self):
        from django.http import Http404
        user = baker.make(User)
        other = baker.make(User)
        board = baker.make(Board, owner=user)
        msg = Message.objects.create(board=board, user=user, content="Mine")
        with pytest.raises(Http404):
            edit_message(message_id=msg.id, user=other, content="Hacked")


@pytest.mark.django_db
class TestDeleteMessage:

    def test_soft_deletes_message(self):
        user = baker.make(User)
        board = baker.make(Board, owner=user)
        msg = Message.objects.create(board=board, user=user, content="Delete me")
        delete_message(message_id=msg.id, user=user)
        msg.refresh_from_db()
        assert msg.is_deleted is True

    def test_cannot_delete_other_users_message(self):
        from django.http import Http404
        user = baker.make(User)
        other = baker.make(User)
        board = baker.make(Board, owner=user)
        msg = Message.objects.create(board=board, user=user, content="Mine")
        with pytest.raises(Http404):
            delete_message(message_id=msg.id, user=other)
