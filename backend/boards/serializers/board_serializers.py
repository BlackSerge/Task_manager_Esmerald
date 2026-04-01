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
    """Shared logic for board permissions and progress statistics."""

    def get_current_user_role(self, obj: Board) -> str:
        request = self.context.get('request')
        user = getattr(request, 'user', None) if request else self.context.get('user')

        if not user or user.is_anonymous:
            return "viewer"

        if obj.owner_id == user.id:
            return "admin"

        memberships = getattr(obj, 'boardmember_set', None)
        if memberships:
            for m in (memberships.all() if hasattr(memberships, 'all') else memberships):
                if m.user_id == user.id:
                    return str(m.role)
        else:
            membership = BoardMember.objects.filter(board=obj, user_id=user.id).first()
            if membership:
                return str(membership.role)

        return "viewer"

    def _get_progress_data(self, obj: Board) -> dict:
        """Returns cached progress data to avoid redundant computation per serializer instance."""
        cache_attr = '_progress_cache'
        cached = getattr(obj, cache_attr, None)
        if cached is not None:
            return cached

        total = getattr(obj, 'total_cards_count_annotated', None)
        if total is None:
            total = Card.objects.filter(column__board=obj).count()

        completed = getattr(obj, 'completed_cards_count_annotated', None)
        if completed is None:
            last_col = obj.columns.only('id').last()
            completed = last_col.cards.count() if last_col else 0

        percentage = int((completed / total) * 100) if total > 0 else 0

        result = {
            "total_cards": total,
            "completed_cards": completed,
            "progress_percentage": percentage
        }
        setattr(obj, cache_attr, result)
        return result


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

    def get_total_cards(self, obj: Board) -> int:
        return self._get_progress_data(obj)["total_cards"]

    def get_completed_cards(self, obj: Board) -> int:
        return self._get_progress_data(obj)["completed_cards"]

    def get_progress_percentage(self, obj: Board) -> int:
        return self._get_progress_data(obj)["progress_percentage"]


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

    def get_total_cards(self, obj: Board) -> int:
        return self._get_progress_data(obj)["total_cards"]

    def get_completed_cards(self, obj: Board) -> int:
        return self._get_progress_data(obj)["completed_cards"]

    def get_progress_percentage(self, obj: Board) -> int:
        return self._get_progress_data(obj)["progress_percentage"]