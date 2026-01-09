from django.db import transaction
from django.db.models import Max
from django.contrib.auth.models import AbstractBaseUser
from django.core.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from typing import cast
from django.utils import timezone

from ..models import Board, Column, Card, BoardMember
from .websocket_service import notify_board_change, notify_card_movement

# --- Utilidades de Validación ---

def _validate_permission(board: Board, user: AbstractBaseUser, min_role: str = 'editor') -> None:
    """
    Centraliza la validación de permisos basada en roles.
    """
    if board.owner == user:
        return

    membership = BoardMember.objects.filter(board=board, user=user).first()
    
    if not membership:
        raise PermissionDenied("No eres miembro de este tablero.")

    # Jerarquía: admin > editor > viewer
    if min_role == 'editor' and membership.role == BoardMember.Role.VIEWER:
        raise PermissionDenied("Los observadores no tienen permiso para realizar cambios.")
    
    if min_role == 'admin' and membership.role != BoardMember.Role.ADMIN:
        raise PermissionDenied("Se requieren permisos de administrador para esta acción.")

def _touch_board(board: Board) -> None:
    """
    Actualiza el campo manual 'last_activity' del tablero para que el frontend 
    muestre actividad real, evitando falsos positivos de 'ahora mismo' al solo leer.
    """
    board.last_activity = timezone.now()
    # Usamos update_fields para evitar disparar el auto_now de updated_at
    # y mantener la integridad del timestamp técnico.
    board.save(update_fields=['last_activity'])


# --- Servicios de Tablero ---

def create_board(*, title: str, user: AbstractBaseUser) -> Board:
    """
    Crea un tablero y asigna automáticamente al usuario como ADMIN.
    """
    if not user or user.is_anonymous:
        raise PermissionDenied("Se requiere un usuario autenticado.")

    with transaction.atomic():
        board = Board.objects.create(
            title=title,
            owner=user
        )
        
        BoardMember.objects.create(
            user=user,
            board=board,
            role=BoardMember.Role.ADMIN
        )
        
    return cast(Board, board)


# --- Servicios de Columnas ---

def create_column(*, board_id: int, title: str, user: AbstractBaseUser) -> Column:
    """
    Crea una columna nueva al final del tablero.
    """
    board = get_object_or_404(Board, pk=board_id)
    _validate_permission(board, user, min_role='editor')
    
    with transaction.atomic():
        last_order = Column.objects.filter(board=board).aggregate(Max("order"))["order__max"]
        
        column = Column.objects.create(
            board=board, 
            title=title, 
            order=(last_order or 0.0) + 1.0
        )
        
        _touch_board(board) # Actualiza la actividad real

    notify_board_change(board_id=board_id)
    return cast(Column, column)


# --- Servicios de Tarjetas ---

def create_card(
    *, 
    column_id: int, 
    title: str, 
    description: str = "", 
    priority: str = Card.Priority.MEDIUM, 
    user: AbstractBaseUser
) -> Card:
    """
    Crea una tarjeta en una columna específica.
    """
    column = get_object_or_404(Column.objects.select_related("board"), pk=column_id)
    board = column.board

    _validate_permission(board, user, min_role='editor')
    
    with transaction.atomic():
        last_order = Card.objects.filter(column=column).aggregate(Max("order"))["order__max"]
        
        card = Card.objects.create(
            column=column, 
            title=title, 
            description=description, 
            priority=priority, 
            order=(last_order or 0.0) + 1.0
        )
        
        _touch_board(board) # Marcamos actividad real en el tablero

    notify_board_change(board_id=board.id)
    return cast(Card, card)


def move_card(
    *, 
    card_id: int, 
    new_column_id: int, 
    new_order: float, 
    user: AbstractBaseUser
) -> Card:
    """
    Actualiza la posición y/o columna de una tarjeta.
    """
    card = get_object_or_404(Card.objects.select_related('column__board'), pk=card_id)
    board = card.column.board
    
    _validate_permission(board, user, min_role='editor')

    from_column_id = card.column_id

    with transaction.atomic():
        card.column_id = new_column_id
        card.order = new_order
        card.save()
        
        _touch_board(board) # El movimiento es una acción de contenido real

    notify_card_movement(
        board_id=board.id,
        card_id=card.id,
        from_col=from_column_id,
        to_col=new_column_id,
        order=new_order
    )
    
    return cast(Card, card)