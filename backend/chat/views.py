from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from boards.models import Board
from .selectors import get_board_messages
from .serializers import MessageSerializer


class BoardMessagesView(APIView):
    """Retrieves chat message history for a board."""

    permission_classes = [IsAuthenticated]

    def get(self, request, board_id):
        board = get_object_or_404(Board, id=board_id)
        messages = get_board_messages(board)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)