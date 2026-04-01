import pytest
from model_bakery import baker
from django.contrib.auth import get_user_model

from boards.models import Board, BoardMember
from core.selectors import user_search_list

User = get_user_model()


@pytest.mark.django_db
class TestUserSearchList:

    def test_finds_by_username(self):
        baker.make(User, username="johndoe")
        result = user_search_list(query="john")
        assert result.count() == 1

    def test_finds_by_email(self):
        baker.make(User, email="test@example.com")
        result = user_search_list(query="test@example")
        assert result.count() == 1

    def test_returns_empty_for_short_query(self):
        baker.make(User, username="ab")
        result = user_search_list(query="a")
        assert result.count() == 0

    def test_returns_empty_for_empty_query(self):
        result = user_search_list(query="")
        assert result.count() == 0

    def test_excludes_board_members(self):
        owner = baker.make(User, username="owner_test")
        member = baker.make(User, username="member_test")
        outsider = baker.make(User, username="outsider_test")
        board = baker.make(Board, owner=owner)
        BoardMember.objects.create(board=board, user=member, role=BoardMember.Role.VIEWER)

        result = user_search_list(query="test", exclude_board_id=board.id)
        result_ids = list(result.values_list("id", flat=True))
        assert outsider.id in result_ids
        assert owner.id not in result_ids
        assert member.id not in result_ids

    def test_limits_to_10_results(self):
        for i in range(15):
            baker.make(User, username=f"searchuser{i}")
        result = user_search_list(query="searchuser")
        assert len(result) <= 10

    def test_invalid_board_id_ignored(self):
        baker.make(User, username="testuser")
        result = user_search_list(query="testuser", exclude_board_id=99999)
        assert result.count() == 1
