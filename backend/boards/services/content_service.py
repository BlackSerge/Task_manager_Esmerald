from django.db import transaction
from django.db.models import Max
from django.contrib.auth.models import AbstractBaseUser
from django.core.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from typing import cast, Any
from django.utils import timezone

from ..models import Board, Column, Card, BoardMember
from .websocket_service import notify_board_change, notify_card_movement

# --- Utilidades de Validación ---

def _validate_permission(board: Board, user: AbstractBaseUser, min_role: str = 'editor') -> None:
    """
    Valida permisos con jerarquía numérica para evitar degradación de roles.
    """
    if board.owner == user:
        return

    membership = BoardMember.objects.filter(board=board, user=user).first()
    
    if not membership:
        raise PermissionDenied("No eres miembro de este tablero.")

    # Definimos el peso de cada rol para comparaciones lógicas
    ROLE_WEIGHTS = {
        BoardMember.Role.ADMIN: 3,
        BoardMember.Role.EDITOR: 2,
        BoardMember.Role.VIEWER: 1,
    }

    # Convertimos el rol requerido a su peso numérico
    required_weight = ROLE_WEIGHTS.get(
        BoardMember.Role.ADMIN if min_role == 'admin' else BoardMember.Role.EDITOR, 
        2
    )
    
    user_weight = ROLE_WEIGHTS.get(membership.role, 0)

    if user_weight < required_weight:
        raise PermissionDenied(f"Tu rol de {membership.role} no permite realizar esta acción.")


def _touch_board(board: Board) -> None:
    """Actualiza la actividad real del tablero."""
    board.last_activity = timezone.now()
    board.save(update_fields=['last_activity'])


# --- Servicios de Tablero ---

def create_board(*, title: str, user: AbstractBaseUser) -> Board:
    if not user or user.is_anonymous:
        raise PermissionDenied("Se requiere un usuario autenticado.")

    with transaction.atomic():
        board = Board.objects.create(title=title, owner=user)
        # Aseguramos que el creador sea ADMIN
        BoardMember.objects.get_or_create(
            user=user,
            board=board,
            defaults={'role': BoardMember.Role.ADMIN}
        )
        
    return cast(Board, board)


# --- Servicios de Columnas ---

def create_column(*, board_id: int, title: str, user: AbstractBaseUser) -> Column:
    board = get_object_or_404(Board, pk=board_id)
    _validate_permission(board, user, min_role='editor')
    
    with transaction.atomic():
        last_order = Column.objects.filter(board=board).aggregate(Max("order"))["order__max"]
        column = Column.objects.create(
            board=board, 
            title=title, 
            order=(last_order or 0.0) + 1.0
        )
        _touch_board(board)

    notify_board_change(board_id=board_id)
    return cast(Column, column)


def update_column(*, column_id: int, title: str, user: AbstractBaseUser) -> Column:
    """Actualiza una columna y notifica a todos los miembros."""
    column = get_object_or_404(Column.objects.select_related('board'), pk=column_id)
    board = column.board
    _validate_permission(board, user, min_role='editor')

    with transaction.atomic():
        column.title = title
        column.save()
        _touch_board(board)

    notify_board_change(board_id=board.id)
    return cast(Column, column)


def delete_column(*, column_id: int, user: AbstractBaseUser) -> None:
    """Elimina una columna y notifica el cambio de estructura."""
    column = get_object_or_404(Column.objects.select_related('board'), pk=column_id)
    board = column.board
    _validate_permission(board, user, min_role='editor')
    board_id = board.id

    with transaction.atomic():
        column.delete()
        _touch_board(board)

    notify_board_change(board_id=board_id)



# --- Servicios de Tarjetas ---

def create_card(
    *, 
    column_id: int, 
    title: str, 
    description: str = "", 
    priority: str = Card.Priority.MEDIUM, 
    user: AbstractBaseUser
) -> Card:
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
        _touch_board(board)

    notify_board_change(board_id=board.id)
    return cast(Card, card)


def update_card(*, card_id: int, user: AbstractBaseUser, **data: Any) -> Card:
    card = get_object_or_404(Card.objects.select_related('column__board'), pk=card_id)
    board = card.column.board
    _validate_permission(board, user, min_role='editor')

    with transaction.atomic():
        fields = ['title', 'description', 'priority', 'is_completed']
        for field in fields:
            if field in data:
                setattr(card, field, data[field])
        
        card.save()
        _touch_board(board)

    notify_board_change(board_id=board.id)
    return cast(Card, card)


def delete_card(*, card_id: int, user: AbstractBaseUser) -> None:
    card = get_object_or_404(Card.objects.select_related('column__board'), pk=card_id)
    board = card.column.board
    _validate_permission(board, user, min_role='editor')
    board_id = board.id

    with transaction.atomic():
        card.delete()
        _touch_board(board)

    notify_board_change(board_id=board_id)


def move_card(*, card_id: int, new_column_id: int, new_order: float, user: AbstractBaseUser) -> Card:
    card = get_object_or_404(Card.objects.select_related('column__board'), pk=card_id)
    board = card.column.board
    _validate_permission(board, user, min_role='editor')

    from_column_id = card.column_id

    with transaction.atomic():
        card.column_id = new_column_id
        card.order = new_order
        card.save()
        _touch_board(board)

    # Notificamos el movimiento específico para que el Drag & Drop sea fluido
    notify_card_movement(
        board_id=board.id,
        card_id=card.id,
        from_col=from_column_id,
        to_col=new_column_id,
        order=new_order
    )
    
    # También notificamos un cambio general para asegurar que las métricas (Board Cards) se refresquen
    notify_board_change(board_id=board.id)
    
    return cast(Card, card)