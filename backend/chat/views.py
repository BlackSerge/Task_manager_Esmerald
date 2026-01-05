# chat/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated  # Importación faltante
from django.shortcuts import get_object_or_404

from boards.models import Board
from .selectors import get_board_messages
from .serializers import MessageSerializer

class BoardMessagesView(APIView):
    # Solo usuarios autenticados pueden ver el historial
    permission_classes = [IsAuthenticated]
    
    def get(self, request, board_id):
        # 1. Obtenemos el tablero o lanzamos 404 si no existe
        board = get_object_or_404(Board, id=board_id)
        
        # 2. Obtenemos los mensajes usando el selector que definiste
        messages = get_board_messages(board)
        
        # 3. Serializamos los datos
        serializer = MessageSerializer(messages, many=True)
        
        # 4. Retornamos la lista de mensajes
        return Response(serializer.data, status=status.HTTP_200_OK)