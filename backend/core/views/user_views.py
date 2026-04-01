from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.request import Request
from typing import Optional

from ..selectors import user_search_list
from ..serializers.user_serializers import UserSearchSerializer


class UserSearchView(APIView):
    """Search endpoint for finding users by username or email."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request: Request) -> Response:
        query: str = str(request.query_params.get('q', ''))
        board_id_raw = request.query_params.get('board_id')

        board_id: Optional[int] = None
        if board_id_raw and str(board_id_raw).isdigit():
            board_id = int(board_id_raw)

        try:
            users = user_search_list(
                query=query,
                exclude_board_id=board_id
            )
            serializer = UserSearchSerializer(users, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception:
            return Response(
                {"detail": "Error interno al procesar la búsqueda."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )