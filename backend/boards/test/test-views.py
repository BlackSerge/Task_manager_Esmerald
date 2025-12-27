import pytest
from rest_framework.test import APIClient
from model_bakery import baker

from boards.models import Board


@pytest.mark.django_db
def test_board_list_only_user_boards():
    client = APIClient()
    user = baker.make("auth.User")
    other = baker.make("auth.User")

    baker.make(Board, owner=user, title="Mine")
    baker.make(Board, owner=other, title="Not mine")

    client.force_authenticate(user=user)
    response = client.get("/api/boards/")

    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]["title"] == "Mine"


@pytest.mark.django_db
def test_create_board():
    client = APIClient()
    user = baker.make("auth.User")

    client.force_authenticate(user=user)
    response = client.post("/api/boards/", {"title": "New Board"})

    assert response.status_code == 201
    assert Board.objects.filter(owner=user).exists()
