import re
from django.contrib.auth import get_user_model, password_validation
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from core.services.auth_service import register_user

UserModel = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Handles user registration with auto-login (returns JWT tokens)."""

    password2 = serializers.CharField(write_only=True)
    access = serializers.SerializerMethodField()
    refresh = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()

    class Meta:
        model = UserModel
        fields = ("username", "email", "password", "password2", "access", "refresh", "user")
        extra_kwargs = {
            "password": {"write_only": True},
            "email": {"required": True}
        }

    def get_access(self, obj) -> str:
        return str(RefreshToken.for_user(obj).access_token)

    def get_refresh(self, obj) -> str:
        return str(RefreshToken.for_user(obj))

    def get_user(self, obj) -> dict:
        return {
            "id": obj.id,
            "username": obj.username,
            "email": obj.email,
        }

    def validate_username(self, value: str) -> str:
        if value.isdigit():
            raise serializers.ValidationError("El nombre de usuario no puede ser puramente numérico.")

        if len(value) < 4:
            raise serializers.ValidationError("El nombre de usuario debe tener al menos 4 caracteres.")

        if UserModel.objects.filter(username=value).exists():
            raise serializers.ValidationError("Este nombre de usuario ya está registrado.")

        return value

    def validate_email(self, value: str) -> str:
        if UserModel.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este correo electrónico ya está en uso.")
        return value

    def validate(self, data: dict) -> dict:
        if data.get("password") != data.get("password2"):
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden."})

        password = data.get("password")
        user_temp = UserModel(username=data.get('username'), email=data.get('email'))

        errors = []

        try:
            password_validation.validate_password(password, user=user_temp)
        except DjangoValidationError as e:
            errors.extend(e.messages)

        if not re.search(r'[A-Z]', password):
            errors.append("La contraseña debe contener al menos una letra mayúscula.")
        if not re.search(r'[@$!%*?&]', password):
            errors.append("La contraseña debe contener al menos un carácter especial (@$!%*?&).")
        if not re.search(r'\d', password):
            errors.append("La contraseña debe contener al menos un número.")

        if errors:
            raise serializers.ValidationError({"password": errors})

        return data

    def create(self, validated_data: dict):
        validated_data.pop("password2", None)
        return register_user(**validated_data)


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom login serializer that includes user data in the response."""

    def validate(self, attrs: dict):
        data = super().validate(attrs)
        user = self.user

        data['user'] = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
        }
        return data