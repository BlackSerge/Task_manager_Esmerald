from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db.models import Count
from ..models import Board, Column, Card, BoardMember

User = get_user_model()

# --- Identidad y Miembros ---

class UserMinimalSerializer(serializers.ModelSerializer):
    """Información básica para avatars y etiquetas."""
    class Meta:
        model = User
        fields = ("id", "username", "email")


class BoardMemberSerializer(serializers.ModelSerializer):
    """Representación del miembro desde la tabla intermedia."""
    user = UserMinimalSerializer(read_only=True)
    
    class Meta:
        model = BoardMember
        fields = ("user", "role", "joined_at")


# --- Contenido ---

class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = ("id", "title", "description", "priority", "order", "column")


class ColumnSerializer(serializers.ModelSerializer):
    cards = CardSerializer(many=True, read_only=True)
    board = serializers.PrimaryKeyRelatedField(queryset=Board.objects.all(), required=False)

    class Meta:
        model = Column
        fields = ("id", "title", "order", "cards", "board")


# --- Mixin de Permisos y Lógica de Negocio ---

class BoardBusinessLogicMixin:
    """Lógica compartida para permisos y estadísticas de tableros."""
    
    def get_current_user_role(self, obj: Board) -> str:
        request = self.context.get('request')
        if not request or not request.user or request.user.is_anonymous:
            return "viewer"
        
        if obj.owner_id == request.user.id:
            return "admin"
            
        membership = BoardMember.objects.filter(board=obj, user=request.user).first()
        return membership.role if membership else "viewer"

    def calculate_progress(self, obj: Board) -> dict:
        """Calcula estadísticas de tarjetas de forma centralizada."""
        # Obtenemos todas las columnas para identificar la última (Done)
        columns = list(obj.columns.all().prefetch_related('cards'))
        if not columns:
            return {"total": 0, "completed": 0, "percentage": 0}

        # Todas las tarjetas del tablero
        all_cards = [card for col in columns for card in col.cards.all()]
        total_cards = len(all_cards)
        
        if total_cards == 0:
            return {"total": 0, "completed": 0, "percentage": 0}

        # Definimos la última columna por orden como la de 'Completadas'
        last_column = max(columns, key=lambda c: c.order)
        completed_cards = len([card for card in all_cards if card.column_id == last_column.id])
        
        percentage = int((completed_cards / total_cards) * 100)
        
        return {
            "total": total_cards,
            "completed": completed_cards,
            "percentage": percentage
        }


# --- Tableros ---

class BoardListSerializer(serializers.ModelSerializer, BoardBusinessLogicMixin):
    """
    Optimizado para el dashboard. 
    Utiliza las propiedades del modelo para máxima velocidad.
    """
    
    owner = UserMinimalSerializer(read_only=True)
    # Cambiamos a 'members' a través de la relación ManyToMany para simplificar
    members = UserMinimalSerializer(many=True, read_only=True)
    current_user_role = serializers.SerializerMethodField()
    
    # Conectamos directamente con las @property del modelo usando 'source'
    columns_count = serializers.IntegerField(source='columns.count', read_only=True)
    total_cards = serializers.IntegerField(source='total_cards_count', read_only=True)
    completed_cards = serializers.IntegerField(source='completed_cards_count', read_only=True)
    progress_percentage = serializers.IntegerField(read_only=True)
    
    # Mapeo de actividad reciente
    last_activity = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = Board
        fields = (
            "id", 
            "title", 
            "owner", 
            "members", 
            "current_user_role",
            "columns_count", 
            "total_cards", 
            "completed_cards",
            "progress_percentage", 
            "last_activity", 
            "created_at", 
            "updated_at"
        )

    def get_current_user_role(self, obj: Board) -> str:
        """Utiliza la lógica del Mixin para determinar el rol del usuario actual."""
        return super().get_current_user_role(obj)
    def get_columns_count(self, obj: Board) -> int:
        return obj.columns.count()

    def get_total_cards(self, obj: Board) -> int:
        return self.calculate_progress(obj)["total"]

    def get_completed_cards(self, obj: Board) -> int:
        return self.calculate_progress(obj)["completed"]

    def get_progress_percentage(self, obj: Board) -> int:
        return self.calculate_progress(obj)["percentage"]


class BoardDetailSerializer(serializers.ModelSerializer, BoardBusinessLogicMixin):
    """Representación completa para la vista de tablero individual."""
    
    columns = ColumnSerializer(many=True, read_only=True)
    owner = UserMinimalSerializer(read_only=True)
    members = BoardMemberSerializer(source='boardmember_set', many=True, read_only=True)
    current_user_role = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Board
        fields = (
            "id", "title", "owner", "columns", "members", 
            "current_user_role", "progress_percentage", 
            "created_at", "updated_at"
        )
    
    def get_current_user_role(self, obj: Board) -> str:
        return super().get_current_user_role(obj)

    def get_progress_percentage(self, obj: Board) -> int:
        return self.calculate_progress(obj)["percentage"]