from django.shortcuts import get_object_or_404
from django.utils import timezone
from boards.models import Board
from .models import Message


def create_message(*, board_id, user, content):
    board = get_object_or_404(Board, id=board_id)

    # Aquí irían permisos reales (miembros del board)
    return Message.objects.create(
        board=board,
        user=user,
        content=content,
    )


def edit_message(*, message_id, user, content):
    message = get_object_or_404(Message, id=message_id, user=user)
    message.content = content
    message.edited_at = timezone.now()
    message.save()
    return message


def delete_message(*, message_id, user):
    message = get_object_or_404(Message, id=message_id, user=user)
    message.is_deleted = True
    message.save()
