# apps/boards/api/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from ..models import Board, Column, Card, BoardMember

User = get_user_model()


class UserMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email")

class BoardMemberSerializer(serializers.ModelSerializer):
    user = UserMinimalSerializer(read_only=True)
    class Meta:
        model = BoardMember
        fields = ("user", "role", "joined_at")



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


class BoardBusinessLogicMixin:
    """Lógica compartida para permisos y estadísticas de tableros."""
    
    def get_current_user_role(self, obj: Board) -> str:
        request = self.context.get('request')
        user = getattr(request, 'user', None) if request else self.context.get('user')

        if not user or user.is_anonymous:
            return "viewer"
        
        if obj.owner_id == user.id:
            return "admin"
       
        memberships = getattr(obj, 'boardmember_set', None)
        if memberships:
            # Optimizamos para no hacer query extra si ya está prefecheado
            for m in (memberships.all() if hasattr(memberships, 'all') else memberships):
                if m.user_id == user.id:
                    return str(m.role)
        else:
            membership = BoardMember.objects.filter(board=obj, user_id=user.id).first()
            if membership:
                return str(membership.role)
            
        return "viewer"

    def calculate_progress(self, obj: Board) -> dict:
        total = getattr(obj, 'total_cards_count_annotated', None)
        if total is None:
           
            total = Card.objects.filter(column__board=obj).count()
        
        completed = getattr(obj, 'completed_cards_count_annotated', None)
        if completed is None:
          
            last_col = obj.columns.only('id').last()
            completed = last_col.cards.count() if last_col else 0

        percentage = int((completed / total) * 100) if total > 0 else 0
        
        return {
            "total_cards": total,
            "completed_cards": completed,
            "progress_percentage": percentage
        }


class BoardListSerializer(serializers.ModelSerializer, BoardBusinessLogicMixin):
    owner = UserMinimalSerializer(read_only=True)
    members = UserMinimalSerializer(many=True, read_only=True)
    current_user_role = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()
    total_cards = serializers.SerializerMethodField()
    completed_cards = serializers.SerializerMethodField()
   

    class Meta:
        model = Board
        fields = (
            "id", "title", "owner", "members", "current_user_role",
            "progress_percentage", "total_cards", "completed_cards",
            "last_activity", "created_at", "updated_at"
        )

    def get_current_user_role(self, obj: Board) -> str:
        return super().get_current_user_role(obj)

    def get_total_cards(self, obj):
        return self.calculate_progress(obj)["total_cards"]

    def get_completed_cards(self, obj):
        return self.calculate_progress(obj)["completed_cards"]
    
    def get_progress_percentage(self, obj) -> int:
        total = getattr(obj, 'total_cards_count_annotated', 0) or 0
        completed = getattr(obj, 'completed_cards_count_annotated', 0) or 0
        if total <= 0: return 0
        return int((completed / total) * 100)
    


class BoardDetailSerializer(serializers.ModelSerializer, BoardBusinessLogicMixin):
    columns = ColumnSerializer(many=True, read_only=True)
    owner = UserMinimalSerializer(read_only=True)
    members = BoardMemberSerializer(source='boardmember_set', many=True, read_only=True)
    current_user_role = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()
    total_cards = serializers.SerializerMethodField()
    completed_cards = serializers.SerializerMethodField()

    class Meta:
        model = Board
        fields = (
            "id", "title", "owner", "columns", "members", 
            "current_user_role", "progress_percentage", "total_cards", "completed_cards",
            "last_activity", "created_at", "updated_at"
        )
    
    def get_current_user_role(self, obj: Board) -> str:
        return super().get_current_user_role(obj)

    def get_total_cards(self, obj):
        return self.calculate_progress(obj)["total_cards"]

    def get_completed_cards(self, obj):
        return self.calculate_progress(obj)["completed_cards"]

    def get_progress_percentage(self, obj):
        return self.calculate_progress(obj)["progress_percentage"]