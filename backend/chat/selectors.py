from .models import Message


def get_board_messages(board):
    return Message.objects.filter(
        board=board,
        is_deleted=False
    ).select_related("user")
