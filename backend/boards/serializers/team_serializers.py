from rest_framework import serializers
from django.contrib.auth import get_user_model
from boards.models import BoardMember

User = get_user_model()

class MemberInviteSerializer(serializers.Serializer):
    """
    DTO para la validación de entrada al invitar miembros.
    """
    user_id = serializers.IntegerField(required=True)
    role = serializers.ChoiceField(
        choices=BoardMember.Role.choices, 
        default=BoardMember.Role.VIEWER
    )

    def validate_user_id(self, value: int) -> int:
        if not User.objects.filter(id=value).exists():
            raise serializers.ValidationError("El usuario seleccionado no existe.")
        return value


class BoardMemberSerializer(serializers.ModelSerializer):
    """
    Representación detallada de un miembro dentro de un tablero.
    """
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    # Ya no usamos SerializerMethodField, usamos el campo directo del modelo BoardMember
    role = serializers.CharField(read_only=True) 

    class Meta:
        model = BoardMember
        fields = ['user_id', 'username', 'email', 'role', 'joined_at']