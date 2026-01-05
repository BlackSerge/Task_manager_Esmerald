from django.db.models import Q, QuerySet
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractBaseUser
from typing import Optional
from .models import Board, Column, Card

# Obtenemos el modelo de usuario activo en el sistema
User = get_user_model()

def board_list_for_user(*, user: AbstractBaseUser) -> QuerySet[Board]:
    """
    Retorna los tableros donde el usuario es dueño o miembro.
    Optimizado con prefetch para alimentar las propiedades del modelo sin N+1.
    """
    return Board.objects.filter(
        Q(owner=user) | Q(members=user)
    ).select_related('owner').prefetch_related(
        'members',
        'columns__cards' 
    ).distinct().order_by('-updated_at')

def board_detail_get(*, user: AbstractBaseUser, board_id: int) -> Optional[Board]:
    """
    Obtiene el detalle de un tablero validando el acceso de seguridad.
    """
    return Board.objects.filter(
        Q(owner=user) | Q(members=user),
        id=board_id
    ).select_related('owner').prefetch_related(
        'columns__cards',
        'boardmember_set__user'
    ).distinct().first()

def column_list_by_board(*, user: AbstractBaseUser, board_id: int) -> QuerySet[Column]:
    """Lista columnas validando acceso mediante el tablero padre."""
    return Column.objects.filter(
        Q(board__owner=user) | Q(board__members=user),
        board_id=board_id
    ).prefetch_related('cards').order_by('order').distinct()

def get_user_cards(*, user: AbstractBaseUser) -> QuerySet[Card]:
    """Retorna todas las tarjetas a las que el usuario tiene acceso."""
    return Card.objects.filter(
        Q(column__board__owner=user) | Q(column__board__members=user)
    ).select_related('column__board').distinct()

def get_user_columns(*, user: AbstractBaseUser) -> QuerySet[Column]:
    """Selector necesario para el ColumnViewSet."""
    return Column.objects.filter(
        Q(board__owner=user) | Q(board__members=user)
    ).select_related('board').distinct()