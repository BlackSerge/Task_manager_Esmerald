from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSearchSerializer(serializers.ModelSerializer):
    """
    Utilizado exclusivamente para listados y búsqueda de usuarios.
    Mantiene la respuesta ligera (minimalista).
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'email')