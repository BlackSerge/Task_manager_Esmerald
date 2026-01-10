# apps/boards/selectors.py
from django.db.models import Q, QuerySet, Count, OuterRef, Subquery, IntegerField
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractBaseUser
from typing import Optional
from .models import Board, Column, Card
from django.db.models.functions import Coalesce

User = get_user_model()

def board_list_for_user(*, user: AbstractBaseUser) -> QuerySet[Board]:
    """
    Retorna los tableros con métricas pre-calculadas en SQL.
    Utiliza Coalesce para evitar que los valores NULL rompan las métricas al refrescar.
    """
    # 1. Subquery para obtener el ID de la última columna (Done) de cada tablero
    last_column_id_subquery = Column.objects.filter(
        board_id=OuterRef('pk')
    ).order_by('-order').values('id')[:1]

    # 2. Subquery para contar tarjetas en la última columna
    # Agregamos Coalesce aquí también para asegurar integridad en la subquery
    completed_cards_subquery = Card.objects.filter(
        column_id=Subquery(last_column_id_subquery)
    ).values('column__board').annotate(
        cnt=Count('id')
    ).values('cnt')

    # 3. Query principal con anotaciones blindadas
    return Board.objects.filter(
        Q(owner=user) | Q(members=user)
    ).annotate(
        # Coalesce(campo, 0) garantiza que el JSON siempre reciba un número
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
    """
    Obtiene el detalle completo incluyendo las anotaciones de progreso.
    """
    # Reutilizamos la lógica de anotación para que el detalle también tenga los números
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