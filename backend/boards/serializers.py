from rest_framework import serializers
from .models import Board, Column, Card


class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = ["id", "title", "description", "order", "column"]
        read_only_fields = ["column"]


class ColumnSerializer(serializers.ModelSerializer):
    cards = CardSerializer(many=True, read_only=True)

    class Meta:
        model = Column
        fields = ["id", "title", "order", "board", "cards"]
        read_only_fields = ["board"]


class BoardDetailSerializer(serializers.ModelSerializer):
    columns = ColumnSerializer(many=True, read_only=True)
    owner_username = serializers.CharField(source="owner.username", read_only=True)

    class Meta:
        model = Board
        fields = ["id", "title", "owner", "owner_username", "columns"]
        read_only_fields = ["owner"]


class BoardListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Board
        fields = ["id", "title"]
