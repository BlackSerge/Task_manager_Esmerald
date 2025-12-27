from rest_framework import generics
from rest_framework.permissions import AllowAny
from core.serializers.registration import UserRegistrationSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    permission_classes = (AllowAny,)
    serializer_class = UserRegistrationSerializer
    queryset = User.objects.all()
