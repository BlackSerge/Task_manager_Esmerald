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
    Actualizado: Usa una relación directa de tablero en la subquery para evitar el reset a 0.
    """
    
    # 1. Obtenemos el ID de la columna con el 'order' más alto para CADA tablero
    # Esto define qué columna es la de "Completadas"
    last_column_id_subquery = Column.objects.filter(
        board_id=OuterRef('pk')
    ).order_by('-order').values('id')[:1]

    # 2. Contamos las tarjetas. 
    # Filtramos por el tablero del OuterRef Y porque pertenezcan a esa última columna.
    completed_cards_subquery = Card.objects.filter(
        column__board_id=OuterRef('pk'),
        column_id=Subquery(last_column_id_subquery)
    ).values('column__board_id').annotate(
        cnt=Count('id')
    ).values('cnt')

    # 3. Query principal con anotaciones blindadas
    return Board.objects.filter(
        Q(owner=user) | Q(members=user)
    ).annotate(
        # Total de tarjetas: Aseguramos que siempre sea un número
        total_cards_count_annotated=Coalesce(
            Count('columns__cards', distinct=True), 
            0
        ),
        # Tarjetas completadas: Inyectamos el conteo de la subquery
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