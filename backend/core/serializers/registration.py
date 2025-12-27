from rest_framework import serializers
from django.contrib.auth import get_user_model
from core.services.auth import register_user

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("username", "email", "password", "password2")
        extra_kwargs = {"password": {"write_only": True}}

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError(
                {"password": "Las contraseñas no coinciden"}
            )
        return data

    def create(self, validated_data):
        validated_data.pop("password2")
        return register_user(**validated_data)
