from django.db.models import QuerySet

from .models import Message


def get_board_messages(board) -> QuerySet[Message]:
    """Returns non-deleted messages for a board, with user data preloaded."""
    return Message.objects.filter(
        board=board,
        is_deleted=False
    ).select_related("user")
