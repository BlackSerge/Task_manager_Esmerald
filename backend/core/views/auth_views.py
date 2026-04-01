from django.contrib.auth import get_user_model
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from core.serializers.auth_serializers import (
    UserRegistrationSerializer,
    MyTokenObtainPairSerializer
)

UserModel = get_user_model()


class RegisterView(generics.CreateAPIView):
    """User registration endpoint. Delegates to service layer via serializer."""

    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer
    queryset = UserModel.objects.all()


class LoginView(TokenObtainPairView):
    """Custom login endpoint returning JWT + user DTO."""

    permission_classes = [AllowAny]
    serializer_class = MyTokenObtainPairSerializer