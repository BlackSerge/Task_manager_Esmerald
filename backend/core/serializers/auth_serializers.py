import re
from django.contrib.auth import get_user_model, password_validation
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from core.services.auth_service import register_user

UserModel = get_user_model()



class UserRegistrationSerializer(serializers.ModelSerializer):
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

    # Getters para la respuesta automática (Auto-login)
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

    # --- VALIDACIONES DE CAMPO ESPECÍFICAS ---

    def validate_username(self, value: str) -> str:
        # No permitir nombres solo numéricos
        if value.isdigit():
            raise serializers.ValidationError("El nombre de usuario no puede ser puramente numérico.")
        
        # Longitud mínima para el nombre de usuario
        if len(value) < 4:
            raise serializers.ValidationError("El nombre de usuario debe tener al menos 4 caracteres.")

        if UserModel.objects.filter(username=value).exists():
            raise serializers.ValidationError("Este nombre de usuario ya está registrado.")
        
        return value

    def validate_email(self, value: str) -> str:
        if UserModel.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este correo electrónico ya está en uso.")
        return value

    # --- VALIDACIÓN CRUZADA DE SEGURIDAD ---

    def validate(self, data: dict) -> dict:
        # 1. Coincidencia de contraseñas
        if data.get("password") != data.get("password2"):
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden."})

        # 2. Validación de Contraseña Robusta (Integra settings.AUTH_PASSWORD_VALIDATORS)
        password = data.get("password")
        user_temp = UserModel(username=data.get('username'), email=data.get('email'))

        errors = []
        
        # Validar contra los validadores configurados en settings.py
        try:
            password_validation.validate_password(password, user=user_temp)
        except DjangoValidationError as e:
            errors.extend(e.messages)

        # Validación extra de signos y mayúsculas (Si no quieres tocar settings.py todavía)
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
    """
    Login robusto que inyecta los datos del usuario.
    """
    def validate(self, attrs: dict):
        data = super().validate(attrs)
        user = self.user 
        
        data['user'] = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
        }
        return data