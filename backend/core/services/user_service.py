from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractBaseUser
from django.core.exceptions import ValidationError
from typing import cast

UserModel = get_user_model()

def user_update_profile(*, user: AbstractBaseUser, username: str, email: str) -> AbstractBaseUser:
    """
    Actualiza los datos básicos de un usuario existente.
    """
    # Validación: El email no debe estar tomado por otro usuario
    if UserModel.objects.filter(email=email).exclude(id=user.id).exists():
        raise ValidationError("Este correo electrónico ya está en uso por otra cuenta.")

    user.username = username
    user.email = email
    user.save()
    
    return cast(AbstractBaseUser, user)

def user_delete_account(*, user: AbstractBaseUser) -> None:
    """
    Lógica para eliminar la cuenta de un usuario. 
    Se puede extender para validaciones antes de borrar.
    """
    user.delete()