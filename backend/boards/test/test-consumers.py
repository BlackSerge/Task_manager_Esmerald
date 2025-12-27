import pytest
from model_bakery import baker
from channels.testing import WebsocketCommunicator
from config.asgi import application
from boards.models import Board


@pytest.mark.django_db
@pytest.mark.asyncio
async def test_board_consumer_connection():
    user = baker.make("auth.User")
    board = baker.make(Board, owner=user)

    communicator = WebsocketCommunicator(
        application,
        f"/ws/board/{board.id}/",
    )

    communicator.scope["user"] = user
    connected, _ = await communicator.connect()

    assert connected
    await communicator.disconnect()
