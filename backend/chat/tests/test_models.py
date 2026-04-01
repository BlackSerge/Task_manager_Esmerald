import pytest
from model_bakery import baker
from django.contrib.auth import get_user_model

from boards.models import Board
from chat.models import Message

User = get_user_model()


@pytest.mark.django_db
class TestMessageModel:

    def test_str_representation(self):
        user = baker.make(User)
        board = baker.make(Board, owner=user)
        msg = Message.objects.create(board=board, user=user, content="Hello")
        assert str(user) in str(msg)

    def test_ordering_by_created_at(self):
        user = baker.make(User)
        board = baker.make(Board, owner=user)
        m1 = Message.objects.create(board=board, user=user, content="First")
        m2 = Message.objects.create(board=board, user=user, content="Second")
        messages = list(Message.objects.filter(board=board))
        assert messages.index(m1) < messages.index(m2)

    def test_default_is_deleted_false(self):
        user = baker.make(User)
        board = baker.make(Board, owner=user)
        msg = Message.objects.create(board=board, user=user, content="Test")
        assert msg.is_deleted is False

    def test_edited_at_initially_null(self):
        user = baker.make(User)
        board = baker.make(Board, owner=user)
        msg = Message.objects.create(board=board, user=user, content="Test")
        assert msg.edited_at is None

    def test_cascade_delete_with_board(self):
        user = baker.make(User)
        board = baker.make(Board, owner=user)
        Message.objects.create(board=board, user=user, content="Test")
        board_id = board.id
        board.delete()
        assert not Message.objects.filter(board_id=board_id).exists()
