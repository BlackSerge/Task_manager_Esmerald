import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from model_bakery import baker

from boards.models import Board, BoardMember, Column, Card

User = get_user_model()


@pytest.fixture
def user(db):
    return baker.make(User)


@pytest.fixture
def other_user(db):
    return baker.make(User)


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def auth_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def board(user):
    board = baker.make(Board, owner=user)
    BoardMember.objects.get_or_create(
        board=board, user=user,
        defaults={"role": BoardMember.Role.ADMIN}
    )
    return board


@pytest.fixture
def column(board):
    return baker.make(Column, board=board, title="To Do", order=1.0)


@pytest.fixture
def card(column):
    return baker.make(Card, column=column, title="Task 1", order=1.0)


@pytest.fixture
def editor_user(db, board):
    editor = baker.make(User)
    BoardMember.objects.create(
        board=board, user=editor,
        role=BoardMember.Role.EDITOR
    )
    return editor


@pytest.fixture
def viewer_user(db, board):
    viewer = baker.make(User)
    BoardMember.objects.create(
        board=board, user=viewer,
        role=BoardMember.Role.VIEWER
    )
    return viewer
