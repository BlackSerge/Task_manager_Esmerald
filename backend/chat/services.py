from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser

from boards.models import Board
from .models import Message


def create_message(*, board_id: int, user: AbstractBaseUser, content: str) -> Message:
    """Creates a new chat message in the specified board."""
    board = get_object_or_404(Board, id=board_id)
    return Message.objects.create(
        board=board,
        user=user,
        content=content,
    )


def edit_message(*, message_id: int, user: AbstractBaseUser, content: str) -> Message:
    """Updates the content of an existing message owned by the user."""
    message = get_object_or_404(Message, id=message_id, user=user)
    message.content = content
    message.edited_at = timezone.now()
    message.save(update_fields=['content', 'edited_at'])
    return message


def delete_message(*, message_id: int, user: AbstractBaseUser) -> None:
    """Soft-deletes a message owned by the user."""
    message = get_object_or_404(Message, id=message_id, user=user)
    message.is_deleted = True
    message.save(update_fields=['is_deleted'])
