from django.db.models import Q, QuerySet, Count, OuterRef, Subquery, IntegerField
from django.contrib.auth.models import AbstractBaseUser
from django.db.models.functions import Coalesce
from typing import Optional

from .models import Board, Column, Card


def board_list_for_user(*, user: AbstractBaseUser) -> QuerySet[Board]:
    """
    Returns boards accessible by the user with SQL-computed progress metrics.
    Annotates total_cards_count_annotated and completed_cards_count_annotated.
    """
    completed_cards_subquery = Column.objects.filter(
        board_id=OuterRef('pk')
    ).order_by('-order').annotate(
        cnt=Count('cards')
    ).values('cnt')[:1]

    return Board.objects.filter(
        Q(owner=user) | Q(members=user)
    ).annotate(
        total_cards_count_annotated=Coalesce(
            Count('columns__cards', distinct=True),
            0
        ),
        completed_cards_count_annotated=Coalesce(
            Subquery(
                completed_cards_subquery,
                output_field=IntegerField()
            ),
            0
        )
    ).select_related('owner').prefetch_related(
        'members',
        'columns__cards',
        'boardmember_set'
    ).distinct().order_by('-updated_at')


def board_detail_get(*, user: AbstractBaseUser, board_id: int) -> Optional[Board]:
    """Returns a single board with full detail including progress annotations."""
    return board_list_for_user(user=user).filter(id=board_id).select_related('owner').prefetch_related(
        'columns__cards',
        'boardmember_set',
        'boardmember_set__user',
    ).first()


def column_list_by_board(*, user: AbstractBaseUser, board_id: int) -> QuerySet[Column]:
    return Column.objects.filter(
        Q(board__owner=user) | Q(board__members=user),
        board_id=board_id
    ).prefetch_related('cards').order_by('order').distinct()


def get_user_cards(*, user: AbstractBaseUser) -> QuerySet[Card]:
    return Card.objects.filter(
        Q(column__board__owner=user) | Q(column__board__members=user)
    ).select_related('column__board').distinct()


def get_user_columns(*, user: AbstractBaseUser) -> QuerySet[Column]:
    return Column.objects.filter(
        Q(board__owner=user) | Q(board__members=user)
    ).select_related('board').distinct()