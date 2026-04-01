from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractBaseUser
from django.db.models import Q, QuerySet
from typing import Optional, cast, List

UserModel = get_user_model()


def user_search_list(*, query: str, exclude_board_id: Optional[int] = None) -> QuerySet[AbstractBaseUser]:
    """Searches users by username or email, optionally excluding existing board members."""
    if not query or len(query) < 2:
        return cast(QuerySet[AbstractBaseUser], UserModel.objects.none())

    queryset = cast(QuerySet[AbstractBaseUser], UserModel.objects.filter(
        Q(username__icontains=query) | Q(email__icontains=query)
    ))

    if exclude_board_id:
        from boards.models import Board
        try:
            board = Board.objects.get(pk=exclude_board_id)
            excluded_ids: List[int] = [board.owner_id]
            member_ids = list(board.members.values_list('id', flat=True))
            excluded_ids.extend(member_ids)
            queryset = queryset.exclude(id__in=excluded_ids)
        except Board.DoesNotExist:
            pass

    return queryset.only('id', 'username', 'email').distinct()[:10]