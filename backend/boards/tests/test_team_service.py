import pytest
from unittest.mock import patch
from django.core.exceptions import ValidationError, PermissionDenied
from django.http import Http404
from model_bakery import baker
from django.contrib.auth import get_user_model

from boards.models import Board, BoardMember
from boards.services.team_service import board_add_member, board_remove_member

User = get_user_model()
WS_PATCH = "boards.services.team_service.notify_board_change"


@pytest.mark.django_db
class TestBoardAddMember:

    def test_owner_can_invite(self, user, board, other_user):
        with patch(WS_PATCH):
            membership = board_add_member(
                board_id=board.id, user_id=other_user.id,
                role=BoardMember.Role.EDITOR, requested_by=user
            )
        assert membership.user == other_user
        assert membership.role == BoardMember.Role.EDITOR

    def test_admin_can_invite(self, board, editor_user, other_user):
        BoardMember.objects.filter(board=board, user=editor_user).update(
            role=BoardMember.Role.ADMIN
        )
        with patch(WS_PATCH):
            membership = board_add_member(
                board_id=board.id, user_id=other_user.id,
                role=BoardMember.Role.VIEWER,
                requested_by=editor_user
            )
        assert membership.user == other_user

    def test_editor_cannot_invite(self, board, editor_user, other_user):
        with pytest.raises(PermissionDenied):
            with patch(WS_PATCH):
                board_add_member(
                    board_id=board.id, user_id=other_user.id,
                    role=BoardMember.Role.VIEWER,
                    requested_by=editor_user
                )

    def test_cannot_add_owner_as_member(self, user, board):
        with pytest.raises(ValidationError):
            with patch(WS_PATCH):
                board_add_member(
                    board_id=board.id, user_id=user.id,
                    role=BoardMember.Role.EDITOR, requested_by=user
                )

    def test_updates_existing_member_role(self, user, board, other_user):
        BoardMember.objects.create(
            board=board, user=other_user,
            role=BoardMember.Role.VIEWER
        )
        with patch(WS_PATCH):
            membership = board_add_member(
                board_id=board.id, user_id=other_user.id,
                role=BoardMember.Role.ADMIN, requested_by=user
            )
        assert membership.role == BoardMember.Role.ADMIN

    def test_invalid_board_raises_404(self, user, other_user):
        with pytest.raises(Http404):
            with patch(WS_PATCH):
                board_add_member(
                    board_id=99999, user_id=other_user.id,
                    role=BoardMember.Role.VIEWER, requested_by=user
                )

    def test_invalid_user_raises_404(self, user, board):
        with pytest.raises(Http404):
            with patch(WS_PATCH):
                board_add_member(
                    board_id=board.id, user_id=99999,
                    role=BoardMember.Role.VIEWER, requested_by=user
                )


@pytest.mark.django_db
class TestBoardRemoveMember:

    def test_owner_can_remove_member(self, user, board, other_user):
        BoardMember.objects.create(
            board=board, user=other_user,
            role=BoardMember.Role.EDITOR
        )
        with patch(WS_PATCH):
            board_remove_member(
                board_id=board.id, user_id=other_user.id,
                requested_by=user
            )
        assert not BoardMember.objects.filter(
            board=board, user=other_user
        ).exists()

    def test_self_removal(self, board, editor_user):
        with patch(WS_PATCH):
            board_remove_member(
                board_id=board.id, user_id=editor_user.id,
                requested_by=editor_user
            )
        assert not BoardMember.objects.filter(
            board=board, user=editor_user
        ).exists()

    def test_cannot_remove_owner(self, user, board):
        with pytest.raises(ValidationError):
            with patch(WS_PATCH):
                board_remove_member(
                    board_id=board.id, user_id=user.id,
                    requested_by=user
                )

    def test_editor_cannot_remove_others(self, board, editor_user, viewer_user):
        with pytest.raises(PermissionDenied):
            with patch(WS_PATCH):
                board_remove_member(
                    board_id=board.id, user_id=viewer_user.id,
                    requested_by=editor_user
                )

    def test_remove_non_member_raises_error(self, user, board, other_user):
        with pytest.raises(ValidationError):
            with patch(WS_PATCH):
                board_remove_member(
                    board_id=board.id, user_id=other_user.id,
                    requested_by=user
                )
