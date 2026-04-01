from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import status, permissions
from django.core.exceptions import ValidationError, PermissionDenied

from ..services import team_service, content_service
from ..serializers.team_serializers import MemberInviteSerializer


class BoardTeamView(APIView):
    """Manages board team membership (invite / remove)."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, board_id: int) -> Response:
        serializer = MemberInviteSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            team_service.board_add_member(
                board_id=board_id,
                user_id=serializer.validated_data['user_id'],
                role=serializer.validated_data['role'],
                requested_by=request.user
            )
            return Response({"detail": "Invitación exitosa"}, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, board_id: int, user_id: int) -> Response:
        """Removes a member from the board team."""
        try:
            team_service.board_remove_member(
                board_id=board_id,
                user_id=user_id,
                requested_by=request.user
            )
            return Response(status=status.HTTP_204_NO_CONTENT)

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception:
            return Response(
                {"error": "Ocurrió un error inesperado"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CardMoveView(APIView):
    """Handles card drag-and-drop movements between columns."""

    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request: Request, card_id: int) -> Response:
        try:
            new_column_id = request.data.get("column_id")
            new_order = request.data.get("new_order")

            if new_column_id is None or new_order is None:
                return Response(
                    {"error": "column_id y new_order son requeridos"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            content_service.move_card(
                card_id=card_id,
                new_column_id=int(new_column_id),
                new_order=float(new_order),
                user=request.user
            )
            return Response({"status": "moved"}, status=status.HTTP_200_OK)

        except (ValidationError, ValueError) as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)