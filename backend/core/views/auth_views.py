from django.contrib.auth import get_user_model
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from core.serializers.auth_serializers import (
    UserRegistrationSerializer, 
    MyTokenObtainPairSerializer
)

# Usamos una variable clara para el modelo, tipado para evitar 'Any'
UserModel = get_user_model()

class RegisterView(generics.CreateAPIView):
    """
    Vista para el registro de usuarios.
    Delegación total al Service Layer a través del Serializer.
    """
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer
    queryset = UserModel.objects.all()

class LoginView(TokenObtainPairView):
    """
    Vista de login personalizada.
    Devuelve JWT + DTO de usuario.
    """
    permission_classes = [AllowAny]
    serializer_class = MyTokenObtainPairSerializer