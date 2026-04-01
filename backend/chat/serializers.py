from rest_framework import serializers
from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username")

    class Meta:
        model = Message
        fields = [
            "id",
            "username",
            "content",
            "created_at",
            "edited_at",
        ]
