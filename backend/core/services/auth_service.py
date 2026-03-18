from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractBaseUser
from django.db import transaction
from typing import cast

UserModel = get_user_model()


def register_user(*, username: str, email: str, password: str) -> AbstractBaseUser:
    """Creates a new user within an atomic transaction."""
    with transaction.atomic():
        user = UserModel.objects.create_user(
            username=username,
            email=email,
            password=password,
        )
        return cast(AbstractBaseUser, user)