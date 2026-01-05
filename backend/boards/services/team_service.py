from django.core.exceptions import ValidationError, PermissionDenied
from django.db import transaction
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractBaseUser
from django.shortcuts import get_object_or_404

from boards.models import Board, BoardMember
from .websocket_service import notify_board_change

User = get_user_model()

def board_add_member(
    *, 
    board_id: int, 
    user_id: int,  
    role: str,  
    requested_by: AbstractBaseUser
) -> BoardMember:
    """
    Agrega o actualiza un miembro en el tablero con un rol específico.
    Solo el propietario o un administrador pueden gestionar miembros.
    """
    # 1. Obtención de entidades (Fail Fast)
    board = get_object_or_404(Board, id=board_id)
    user_to_invite = get_object_or_404(User, id=user_id)

    # 2. Validación de Autoridad (RBAC)
    # Verificamos si quien solicita tiene permisos (Owner o BoardMember.Role.ADMIN)
    is_owner = board.owner == requested_by
    is_admin = BoardMember.objects.filter(
        board=board, 
        user=requested_by, 
        role=BoardMember.Role.ADMIN
    ).exists()

    if not is_owner and not is_admin:
        raise PermissionDenied("No tienes permisos de administrador para este tablero.")

    # 3. Reglas de Negocio
    if board.owner == user_to_invite:
        raise ValidationError("El propietario no puede ser gestionado como miembro regular.")

    # 4. Ejecución Atómica: update_or_create permite cambiar el rol si ya existe
    with transaction.atomic():
        membership, created = BoardMember.objects.update_or_create(
            board=board,
            user=user_to_invite,
            defaults={'role': role}
        )
        
        # Notificación en tiempo real
        transaction.on_commit(lambda: notify_board_change(board_id=board.id))
    
    return membership


def board_remove_member(
    *, 
    board_id: int, 
    user_id: int, 
    requested_by: AbstractBaseUser
) -> None:
    """
    Elimina a un miembro del equipo.
    Permite que un administrador elimine a otros o que un usuario se elimine a sí mismo.
    """
    board = get_object_or_404(Board, id=board_id)
    
    # 1. Validación de Autoridad
    is_owner = board.owner == requested_by
    is_admin = BoardMember.objects.filter(
        board=board, 
        user=requested_by, 
        role=BoardMember.Role.ADMIN
    ).exists()
    is_self_removing = requested_by.id == user_id

    if not any([is_owner, is_admin, is_self_removing]):
        raise PermissionDenied("No tienes autorización para eliminar a este miembro.")
        
    # 2. Protección del propietario (el dueño no puede ser borrado de su propio tablero aquí)
    if board.owner.id == user_id:
        raise ValidationError("El propietario debe transferir el tablero antes de salir.")

    # 3. Ejecución
    with transaction.atomic():
        deleted_count, _ = BoardMember.objects.filter(
            board=board, 
            user_id=user_id
        ).delete()
        
        if deleted_count == 0:
            raise ValidationError("El usuario no es miembro de este tablero.")
            
        transaction.on_commit(lambda: notify_board_change(board_id=board.id))